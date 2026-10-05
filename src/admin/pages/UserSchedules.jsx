import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Calendar, Clock, MonitorSmartphone, CheckCircle2, XCircle, Trash2, Pencil, Plus } from 'lucide-react'
import { postData } from '../services/api'
import { toast } from 'react-hot-toast'

export default function UserSchedules() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  const fetchedPage = useRef(0);
  
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({ device_id: '', schedule_time: '12:00', is_enabled: true });
  const [userDevices, setUserDevices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDevicesForDropdown = async () => {
    try {
      const data = await postData('/schedules/device', { 
        id: id 
      });
      if (data && data.success) {
        const devs = data.devices || [];
        setUserDevices(devs);
        if (devs.length > 0 && !formData.device_id) {
          setFormData(prev => ({ ...prev, device_id: devs[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load devices for dropdown', err);
    }
  };

  const fetchedDevicesRef = useRef(false);

  useEffect(() => {
    if (!fetchedDevicesRef.current) {
      fetchDevicesForDropdown();
      fetchedDevicesRef.current = true;
    }
  }, [id]);

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormData({ 
      device_id: userDevices.length > 0 ? userDevices[0].id : '', 
      schedule_time: '12:00', 
      is_enabled: true 
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingSchedule(item);
    setFormData({
      device_id: item.devices?.[0]?.device_id || item.device_id || '',
      schedule_time: item.schedule_time || '12:00',
      is_enabled: !!item.is_enabled
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.device_id) {
      toast.error('Please select a device');
      return;
    }
    
    setIsSaving(true);
    const toastId = toast.loading('Saving schedule...');
    try {
      const payload = {
        user_id: id,
        device_id: formData.device_id,
        schedule_time: formData.schedule_time,
        is_enabled: formData.is_enabled
      };
      if (editingSchedule) {
        payload.id = editingSchedule.id;
      }
      
      const data = await postData('/schedules/create-update', payload);
      if (data && data.success !== false) {
        toast.success(`Schedule ${editingSchedule ? 'updated' : 'created'} successfully`, { id: toastId });
        setModalOpen(false);
        fetchedPage.current = 0;
        setSchedules([]);
        setPage(1);
        setHasMore(true);
        fetchSchedules(1);
      } else {
        toast.error(data?.message || data?.error || 'Failed to save schedule', { id: toastId });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Unable to save schedule', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deletingSchedule) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting schedule...');
    try {
      const data = await postData('/schedules/delete', {
        id: deletingSchedule.id
      });
      if (data && data.success !== false) {
        toast.success('Schedule deleted successfully', { id: toastId });
        setSchedules(prev => prev.filter(s => s.id !== deletingSchedule.id));
        setDeletingSchedule(null);
      } else {
        toast.error(data?.message || 'Failed to delete schedule', { id: toastId });
      }
    } catch (err) {
      toast.error('Unable to delete schedule', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  
  const lastElementRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const fetchSchedules = async (pageNum) => {
    if (fetchedPage.current === pageNum) return;
    fetchedPage.current = pageNum;

    setIsLoading(true);
    try {
      const data = await postData('/schedules/list', {
        id: id,
        page: pageNum,
        limit: 20
      });
      
      const newItems = data?.data || data?.schedules || (Array.isArray(data) ? data : []);
      
      if (data && data.success !== false) {
        setSchedules(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const filtered = newItems.filter(i => !existingIds.has(i.id));
          return [...prev, ...filtered];
        });
        
        if (newItems.length < 20) {
          setHasMore(false);
        }
      } else {
        toast.error(data?.message || 'Failed to fetch schedules');
        setHasMore(false);
      }
    } catch (err) {
      toast.error('Unable to fetch schedules');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(page);
  }, [page, id]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const format12Hour = (timeStr) => {
    if (!timeStr) return '--:--';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return timeStr;
    
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const mStr = m.toString().padStart(2, '0');
    
    return `${h12}:${mStr} ${ampm}`;
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white/50 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-400" />
              User Schedules
            </h1>
          </div>
        </div>

        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#015a82] text-white font-bold hover:bg-[#027aad] transition-colors shadow-lg shadow-lg"
        >
          <Plus className="w-5 h-5" /> Create Schedule
        </button>
      </div>

      <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl overflow-hidden shadow-xl">
        {schedules.length === 0 && !isLoading ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-[#5a6b7c] text-base">No schedules found for this user.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {schedules.map((item, index) => {
              const isLast = schedules.length === index + 1;
              return (
                <div 
                  key={item.id || index} 
                  ref={isLast ? lastElementRef : null}
                  className="p-6 hover:bg-white/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-lg font-bold text-[#1a2b3c] mb-2 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      {format12Hour(item.schedule_time)}
                      {item.is_enabled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-2">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#5a6b7c] bg-white border border-[#e2eaf0] px-2 py-0.5 rounded-full ml-2">
                          <XCircle className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </h4>
                    
                    {item.devices && item.devices.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <MonitorSmartphone className="w-4 h-4 text-[#5a6b7c]" />
                        <span className="text-[#5a6b7c] text-sm">
                          {item.devices.map(d => d.device_info?.deviceName || d.line_device_id).join(', ') || item.deviceName || 'Unknown Device'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 text-[#1a2b3c] hover:bg-slate-100 hover:text-[#1a2b3c] transition-colors text-xs font-medium border border-[#e2eaf0]"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeletingSchedule(item); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[#1a2b3c] transition-colors text-xs font-medium border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {deletingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2eaf0] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#1a2b3c] mb-2">Delete Schedule</h2>
            <p className="text-[#5a6b7c] mb-6">Are you sure you want to delete this schedule? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeletingSchedule(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-white hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2eaf0] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#1a2b3c] mb-6">{editingSchedule ? 'Update Schedule' : 'Create Schedule'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Select Device</label>
                <select
                  value={formData.device_id}
                  onChange={e => setFormData(prev => ({ ...prev, device_id: e.target.value }))}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-[#015a82] disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!!editingSchedule}
                >
                  <option value="" disabled>Select a device</option>
                  {userDevices.map(dev => {
                    const devId = dev.id;
                    const devName = dev.name || dev.deviceName || 'Unknown Device';
                    return (
                      <option key={devId} value={devId}>
                        {devName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Schedule Time</label>
                <input
                  type="time"
                  value={formData.schedule_time}
                  onChange={e => setFormData(prev => ({ ...prev, schedule_time: e.target.value }))}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-[#015a82]"
                  required
                />
              </div>

              <div className="flex items-center justify-between mt-6 mb-2">
                <label className="text-sm font-medium text-[#5a6b7c]">Enable Schedule</label>
                <div 
                  onClick={() => setFormData(prev => ({ ...prev, is_enabled: !prev.is_enabled }))}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.is_enabled ? 'bg-[#015a82]' : 'bg-slate-100'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.is_enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-white hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-white bg-[#015a82] hover:bg-[#027aad] font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
