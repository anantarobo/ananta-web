import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, ShieldCheck, Activity, Calendar, Loader2, Pencil, Trash2, MonitorSmartphone, Power, PowerOff, Plus, ChevronLeft, ChevronRight, BatteryFull, BatteryMedium, BatteryLow, Battery } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { postData } from '../services/api'
import EditUserModal from '../components/users/EditUserModal'
import DeleteUserModal from '../components/users/DeleteUserModal'
import AddDeviceModal from '../components/devices/AddDeviceModal'

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);
  
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  // Pagination for devices
  const [devicePage, setDevicePage] = useState(1);
  const [deviceLimit, setDeviceLimit] = useState(5);
  const [deviceTotalPages, setDeviceTotalPages] = useState(1);
  const [totalDevices, setTotalDevices] = useState(0);
  const [onlineDevices, setOnlineDevices] = useState(0);
  const [offlineDevices, setOfflineDevices] = useState(0);

  const fetchUserDetails = async () => {
    setIsLoading(true);
    try {
      const data = await postData('/users/detail', { id });
      if (data && data.success) {
        setUser(data.user || data.data || data);
      } else {
        toast.error(data?.message || 'Failed to fetch user details');
      }
    } catch (err) {
      toast.error('Unable to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  const deviceAbortCtrlRef = useRef(null);

  const fetchUserDevices = useCallback(async () => {
    if (deviceAbortCtrlRef.current) {
      deviceAbortCtrlRef.current.abort();
    }
    deviceAbortCtrlRef.current = new AbortController();

    setIsDevicesLoading(true);
    try {
      const data = await postData('/users/me/devices', { 
        page: devicePage, 
        limit: deviceLimit, 
        userId: id 
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
        toast.error(data?.message || 'Failed to fetch user devices');
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Unable to fetch user devices');
      }
    } finally {
      setIsDevicesLoading(false);
    }
  }, [id, devicePage, deviceLimit]);

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      const data = await postData('/users/active-inactive', { id });
      if (data && data.success) {
        toast.success(`User ${user.status === 'active' ? 'deactivated' : 'activated'} successfully`);
        fetchUserDetails(); // Refresh to get updated status
      } else {
        toast.error(data?.message || 'Failed to change user status');
      }
    } catch (err) {
      toast.error('Unable to change user status');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const fetchedIdRef = useRef(null);

  useEffect(() => {
    if (id && fetchedIdRef.current !== id) {
      fetchedIdRef.current = id;
      fetchUserDetails();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchUserDevices();
    }
    
    return () => {
      if (deviceAbortCtrlRef.current) {
        deviceAbortCtrlRef.current.abort();
      }
    };
  }, [fetchUserDevices, id]);

  if (isLoading) {
    return (
      <div className="p-8 h-[calc(100vh-2rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#015a82] mb-4" />
        <p className="text-[#5a6b7c]">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 h-[calc(100vh-2rem)] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-[#5a6b7c]" />
        </div>
        <h2 className="text-xl font-bold text-[#1a2b3c] mb-2">User Not Found</h2>
        <p className="text-[#5a6b7c] mb-6">The user you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => navigate('/dashboard/users')}
          className="px-6 py-2 rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/users')}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-[#1a2b3c] rounded-xl transition-colors border border-[#e2eaf0]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight">User Details</h1>
            <p className="text-[#5a6b7c] text-sm mt-1">View profile information and manage connected devices.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleToggleStatus}
            disabled={isTogglingStatus}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-all shadow-sm ${
              user.status === 'active' 
                ? 'border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white hover:border-orange-500' 
                : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
            }`}
          >
            {isTogglingStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.status === 'active' ? (
              <PowerOff className="w-4 h-4" />
            ) : (
              <Power className="w-4 h-4" />
            )}
            {user.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button 
            onClick={() => setEditingUser(user)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2eaf0] bg-white text-[#1a2b3c] hover:text-[#027aad] hover:bg-slate-50 hover:border-[#027aad] font-medium transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          <button 
            onClick={() => navigate(`/dashboard/users/${id}/schedules`)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 hover:text-white hover:bg-indigo-500 hover:border-indigo-500 font-medium transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4" /> Schedules
          </button>
          <button 
            onClick={() => setDeletingUser(user)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 font-medium transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Unified Profile Card */}
      <div className="bg-white border border-[#e2eaf0] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#015a82]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#015a82]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6 flex-1 w-full">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-[#e2eaf0] flex items-center justify-center text-[#027aad] text-4xl font-bold shadow-lg shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#015a82]/10 to-[#015a82]/10 rounded-full"></div>
              <span className="relative z-10">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-[#1a2b3c] tracking-tight mb-3 truncate">{user.name}</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/80 border border-[#e2eaf0] text-sm font-medium text-[#1a2b3c]">
                  <ShieldCheck className="w-4 h-4 text-[#027aad]" />
                  <span className="capitalize">{user.role || 'User'}</span>
                </span>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-medium ${
                  user.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                  <span className="capitalize">{user.status || 'inactive'}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Vertical Divider (desktop) */}
          <div className="hidden md:block w-px h-24 bg-slate-100/50 shrink-0"></div>

          {/* Contact Info */}
          <div className="flex-1 w-full bg-white/30 rounded-2xl p-5 border border-[#e2eaf0]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#e2eaf0] flex items-center justify-center group-hover:bg-[#015a82]/10 group-hover:border-[#015a82]/30 transition-colors shrink-0">
                  <Mail className="w-5 h-5 text-[#5a6b7c] group-hover:text-[#027aad] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#5a6b7c] mb-0.5">Email Address</p>
                  <p className="text-[#1a2b3c] font-medium truncate" title={user.email}>{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#e2eaf0] flex items-center justify-center group-hover:bg-[#015a82]/10 group-hover:border-[#015a82]/30 transition-colors shrink-0">
                  <Phone className="w-5 h-5 text-[#5a6b7c] group-hover:text-[#027aad] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#5a6b7c] mb-0.5">Phone Number</p>
                  <p className="text-[#1a2b3c] font-medium truncate">{user.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Linked Devices Section */}
      <div className="bg-white border border-[#e2eaf0] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-[#1a2b3c] flex items-center gap-2">
              <MonitorSmartphone className="w-6 h-6 text-[#027aad]" /> Linked Devices
            </h3>
            <p className="text-[#5a6b7c] text-sm mt-1">Robotic devices connected to this account.</p>
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
        <div className="overflow-hidden border border-[#e2eaf0] rounded-2xl bg-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#1a2b3c]">
              <thead className="text-xs uppercase bg-white/80 text-[#5a6b7c] border-b border-[#e2eaf0]">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Device Info</th>
                  <th scope="col" className="px-6 py-4 font-semibold">User</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Battery</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {isDevicesLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#015a82] mx-auto" />
                    </td>
                  </tr>
                ) : devices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <MonitorSmartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-[#5a6b7c] text-base">No devices linked to this user yet.</p>
                    </td>
                  </tr>
                ) : (
                  devices.map(item => {
                    // Handle nested API response format
                    const devData = item.Device || item;
                    const userData = item.User || user;
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
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isDevicesLoading && devices.length > 0 && (
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
      </div>

      {/* Modals */}
      <EditUserModal 
        user={editingUser} 
        onClose={() => setEditingUser(null)} 
        onRefresh={fetchUserDetails} 
      />

      <DeleteUserModal 
        user={deletingUser} 
        onClose={() => setDeletingUser(null)} 
        onDeleteSuccess={() => navigate('/dashboard/users')}
      />

      <AddDeviceModal 
        isOpen={isAddingDevice} 
        onClose={() => setIsAddingDevice(false)} 
        onSuccess={fetchUserDevices}
        userId={id}
      />
    </div>
  );
}
