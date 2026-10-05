import { useState, useEffect, useRef, useCallback } from 'react'
import { MonitorSmartphone, Plus, Loader2, ChevronLeft, ChevronRight, BatteryFull, BatteryMedium, BatteryLow, Battery, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { postData } from '../services/api'
import AddDeviceModal from '../components/devices/AddDeviceModal'

export default function Devices() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  
  // Pagination
  const [devicePage, setDevicePage] = useState(1);
  const [deviceLimit, setDeviceLimit] = useState(5);
  const [deviceTotalPages, setDeviceTotalPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deviceAbortCtrlRef = useRef(null);

  const fetchDevices = useCallback(async () => {
    if (deviceAbortCtrlRef.current) {
      deviceAbortCtrlRef.current.abort();
    }
    deviceAbortCtrlRef.current = new AbortController();

    setIsLoading(true);
    try {
      const data = await postData('/users/me/devices', { 
        page: devicePage, 
        limit: deviceLimit
      }, {
        signal: deviceAbortCtrlRef.current.signal
      });
      
      if (data && data.success) {
        setDevices(data.devices || []);
        setDeviceTotalPages(data.totalPages || 1);
        setTotalDevices(data.total || data.devices?.length || 0);
        setOnlineDevices(data.onlineDevices || 0);
        setOfflineDevices(data.offlineDevices || 0);
      } else {
        toast.error(data?.message || 'Failed to fetch devices');
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Unable to fetch devices');
      }
    } finally {
      setIsLoading(false);
    }
  }, [devicePage, deviceLimit]);

  useEffect(() => {
    fetchDevices();
    return () => {
      if (deviceAbortCtrlRef.current) {
        deviceAbortCtrlRef.current.abort();
      }
    };
  }, [fetchDevices]);

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    setIsDeleting(true);
    try {
      const data = await postData('/devices/delete', { id: deviceToDelete });
      if (data && data.success) {
        toast.success('Device deleted successfully');
        fetchDevices(); // Refresh list
      } else {
        toast.error(data?.message || 'Failed to delete device');
      }
    } catch (err) {
      toast.error('Unable to delete device');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeviceToDelete(null);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeviceToDelete(id);
    setDeleteModalOpen(true);
  };

  // Shimmer Loader Component
  const TableShimmer = () => (
    <>
      {[...Array(deviceLimit < 10 ? deviceLimit : 5)].map((_, i) => (
        <tr key={i} className="border-b border-[#e2eaf0]">
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100/50 animate-pulse shrink-0"></div>
              <div>
                <div className="h-4 w-32 bg-slate-100/50 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-slate-100/50 rounded animate-pulse"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-24 bg-slate-100/50 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-12 bg-slate-100/50 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-20 bg-slate-100/50 rounded-lg animate-pulse"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="h-8 w-8 bg-slate-100/50 rounded-lg animate-pulse inline-block"></div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight">Devices Management</h1>
          <p className="text-[#5a6b7c] mt-1">Manage, add, and monitor all your robotic devices.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-white border border-[#e2eaf0] text-[#027aad] py-1.5 px-3 rounded-xl text-sm font-bold shadow-sm">
            {totalDevices} Total
          </span>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1.5 px-3 rounded-xl text-sm font-bold shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {onlineDevices} Online
          </span>
          <span className="bg-slate-50 border border-[#e2eaf0] text-[#5a6b7c] py-1.5 px-3 rounded-xl text-sm font-bold shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {offlineDevices} Offline
          </span>
          
          <div className="w-px h-6 bg-slate-100/50 mx-1"></div>
          
          <button 
            onClick={() => setIsAddingDevice(true)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Device
          </button>
        </div>
      </div>

      {/* Devices Table */}
      <div className="overflow-hidden border border-[#e2eaf0] rounded-2xl bg-white/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1a2b3c]">
            <thead className="text-xs uppercase bg-white/80 text-[#5a6b7c] border-b border-[#e2eaf0]">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Device Info</th>
                <th scope="col" className="px-6 py-4 font-semibold">User</th>
                <th scope="col" className="px-6 py-4 font-semibold">Battery</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableShimmer />
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <MonitorSmartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-[#5a6b7c] text-base">No devices found.</p>
                  </td>
                </tr>
              ) : (
                devices.map(item => {
                  const devData = item.Device || item;
                  const userData = item.User || null;
                  const status = devData.status || 'offline';
                  
                  return (
                  <tr 
                    key={item.id} 
                    onClick={() => navigate(`/dashboard/devices/${devData.id}`)}
                    className="border-b border-[#e2eaf0] hover:bg-white/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${status === 'online' ? 'bg-[#015a82]/10 text-[#027aad]' : 'bg-white text-[#5a6b7c]'}`}>
                          <MonitorSmartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a2b3c] text-base truncate">{devData.deviceName || 'Unknown Device'}</h4>
                          <p className="text-xs text-[#5a6b7c] font-mono mt-0.5">{devData.deviceId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a2b3c]">{userData?.name || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1a2b3c]">
                        {devData.batteryPercent !== undefined && devData.batteryPercent !== null ? `${devData.batteryPercent}%` : '0%'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-[#e2eaf0]">
                        <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                        <span className="text-xs font-semibold text-[#1a2b3c] uppercase tracking-wider">{status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleDeleteClick(e, devData.id)}
                        className="p-2 rounded-lg text-[#5a6b7c] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Delete Device"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && devices.length > 0 && (
          <div className="px-6 py-4 border-t border-[#e2eaf0] bg-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#5a6b7c]">
              <span>Show</span>
              <select 
                value={deviceLimit}
                onChange={(e) => {
                  setDeviceLimit(Number(e.target.value));
                  setDevicePage(1);
                }}
                className="bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-lg px-2 py-1 focus:outline-none focus:border-[#015a82]"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#5a6b7c]">
                Page <span className="font-medium text-[#1a2b3c]">{devicePage}</span> of <span className="font-medium text-[#1a2b3c]">{deviceTotalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setDevicePage(p => Math.max(1, p - 1))}
                  disabled={devicePage === 1}
                  className="p-1.5 rounded-lg border border-[#e2eaf0] text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setDevicePage(p => Math.min(deviceTotalPages, p + 1))}
                  disabled={devicePage === deviceTotalPages}
                  className="p-1.5 rounded-lg border border-[#e2eaf0] text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddDeviceModal 
        isOpen={isAddingDevice} 
        onClose={() => setIsAddingDevice(false)} 
        onSuccess={fetchDevices}
      />

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2eaf0] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#1a2b3c] mb-2">Delete Device</h2>
            <p className="text-[#5a6b7c] mb-6">Are you sure you want to delete this device? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-white hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
