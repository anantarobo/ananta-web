import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Loader2, 
  ArrowLeft, 
  MonitorSmartphone, 
  BatteryFull, 
  BatteryMedium, 
  BatteryLow, 
  Battery, 
  Activity, 
  User,
  Play,
  Square,
  Pause,
  ArrowRight,
  ShieldAlert,
  Power,
  Home as HomeIcon,
  Sun,
  AlertTriangle,
  Zap,
  Cpu,
  Gauge,
  Target,
  Trash2,
  History,
  Settings,
  UploadCloud
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { postData } from '../services/api'

const COMMAND_TYPES = {
  START: 'start',
  STOP: 'stop',
  RESTART: 'restart',
  REVERSE: 'reverse',
  FORWARD: 'forward',
  SET_SCHEDULE: 'schedule_create',
  PAUSE: 'pause',
  RESUME: 'resume',
  JOG_FWD: 'jog_fwd',
  JOG_RWD: 'jog_rwd',
  JOG_STOP: 'jog_stop',
  CLEAR_FAULTS: 'clear_faults',
  SEND_TELEMETRY: 'send_telemetry',
  REBOOT: 'reboot',
  HOME: 'home'
};

// Helper component for Quick Command buttons
const CommandButton = ({ icon: Icon, label, color, bg, border, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 border border-[#e2eaf0] transition-all duration-200 ${!disabled ? bg : ''} ${!disabled ? border : ''} group ${disabled ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}
  >
    <div className={`p-3 rounded-full bg-white/50 transition-transform ${color} ${!disabled ? 'group-hover:scale-110' : ''}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className={`text-sm font-semibold transition-colors ${disabled ? 'text-[#5a6b7c]' : 'text-[#1a2b3c] group-hover:text-[#1a2b3c]'}`}>{label}</span>
  </button>
)

export default function DeviceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedId = useRef(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // OTA states
  const [otaModalOpen, setOtaModalOpen] = useState(false);
  const [otaTarget, setOtaTarget] = useState('firmware');
  const [otaFile, setOtaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCommandSending, setIsCommandSending] = useState(false);

  useEffect(() => {
    if (fetchedId.current === id) return;
    fetchedId.current = id;

    const fetchDeviceDetails = async () => {
      setIsLoading(true);
      try {
        const data = await postData('/devices/detail', { id });
        if (data && data.success) {
          const dev = data.device?.Device || data.device || data.data || data;
          const user = data.device?.User || data.user || data;
          
          setDevice({
            ...dev,
            userObj: user
          });
        } else {
          toast.error(data?.message || 'Failed to fetch device details');
        }
      } catch (err) {
        toast.error('Unable to fetch device details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeviceDetails();
  }, [id]);

  const handleCommand = async (commandType) => {
    if (isCommandSending) return;
    const userId = device?.userId || device?.userObj?.id;
    if (!userId) {
      toast.error('User ID not found for this device');
      return;
    }
    
    setIsCommandSending(true);
    const toastId = toast.loading(`Sending '${commandType}' command...`);
    try {
      const data = await postData(`/schedules/command/${commandType}`, {
        id: userId,
        deviceId: id
      });
      
      if (data && data.success !== false) {
        toast.success(`Command '${commandType}' sent successfully.`, { id: toastId });
      } else {
        toast.error(data?.message || `Failed to send command '${commandType}'`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Unable to send command '${commandType}'`, { id: toastId });
    } finally {
      setIsCommandSending(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const data = await postData('/devices/delete', { id });
      if (data && data.success) {
        toast.success('Device deleted successfully');
        navigate('/dashboard/devices');
      } else {
        toast.error(data?.message || 'Failed to delete device');
      }
    } catch (err) {
      toast.error('Unable to delete device');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleOtaSubmit = async (e) => {
    e.preventDefault();
    if (!otaFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    const toastId = toast.loading('Uploading OTA file...');
    
    try {
      const formData = new FormData();
      formData.append('deviceId', id);
      formData.append('target', otaTarget);
      formData.append('file', otaFile);
      
      const data = await postData('/ota/devices/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (data && data.success !== false) {
        toast.success('OTA file uploaded successfully', { id: toastId });
        setOtaModalOpen(false);
        setOtaFile(null);
        setOtaTarget('firmware');
      } else {
        toast.error(data?.message || 'Failed to upload OTA file', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Unable to upload OTA file', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#015a82]" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center mt-20 animate-in fade-in zoom-in duration-300">
        <MonitorSmartphone className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a2b3c] mb-2">Device Not Found</h2>
        <p className="text-[#5a6b7c] mb-6">The device you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl bg-white text-[#1a2b3c] hover:bg-slate-100 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const status = device.status || device.state || device.currentStatus || 'offline';
  
  const faultsList = device.device_fault || device.faults || [];
  const hasFaults = Array.isArray(faultsList) && faultsList.length > 0;
  
  const isFaulty = hasFaults || status.toLowerCase().includes('fault') || status.toLowerCase().includes('error');

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white/50 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight">{device.deviceName || 'Unknown Device'}</h1>
            <p className="text-[#5a6b7c] mt-1 font-mono text-sm">Serial: {device.deviceId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {device.currentStatus && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 shadow-sm shadow-indigo-500/10">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">{device.currentStatus}</span>
            </div>
          )}
          <button
            onClick={() => setOtaModalOpen(true)}
            className="p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors shadow-sm"
            title="OTA Update"
          >
            <UploadCloud className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/dashboard/devices/${id}/settings`)}
            className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors shadow-sm"
            title="Device Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/dashboard/devices/${id}/history`)}
            className="p-2.5 rounded-xl border border-[#015a82]/20 bg-[#015a82]/10 text-[#027aad] hover:bg-[#015a82]/20 transition-colors shadow-sm"
            title="Command History"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="p-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shadow-sm"
            title="Delete Device"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div>
        <h3 className="text-lg font-bold text-[#1a2b3c] mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#027aad]" />
          Quick Commands
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <CommandButton disabled={isCommandSending} icon={Play} label="Start" color="text-emerald-400" bg="hover:bg-emerald-400/10" border="hover:border-emerald-400/30" onClick={() => handleCommand(COMMAND_TYPES.START)} />
          <CommandButton disabled={isCommandSending} icon={Square} label="Stop" color="text-red-400" bg="hover:bg-red-400/10" border="hover:border-red-400/30" onClick={() => handleCommand(COMMAND_TYPES.STOP)} />
          <CommandButton disabled={isCommandSending} icon={Pause} label="Pause" color="text-amber-400" bg="hover:bg-amber-400/10" border="hover:border-amber-400/30" onClick={() => handleCommand(COMMAND_TYPES.PAUSE)} />
          <CommandButton disabled={isCommandSending} icon={Play} label="Resume" color="text-blue-400" bg="hover:bg-blue-400/10" border="hover:border-blue-400/30" onClick={() => handleCommand(COMMAND_TYPES.RESUME)} />
          <CommandButton disabled={isCommandSending} icon={ArrowLeft} label="Reverse" color="text-indigo-400" bg="hover:bg-indigo-400/10" border="hover:border-indigo-400/30" onClick={() => handleCommand(COMMAND_TYPES.REVERSE)} />
          <CommandButton disabled={isCommandSending} icon={ArrowRight} label="Forward" color="text-indigo-400" bg="hover:bg-indigo-400/10" border="hover:border-indigo-400/30" onClick={() => handleCommand(COMMAND_TYPES.FORWARD)} />
          <CommandButton disabled={isCommandSending} icon={ShieldAlert} label="Clear Faults" color="text-orange-400" bg="hover:bg-orange-400/10" border="hover:border-orange-400/30" onClick={() => handleCommand(COMMAND_TYPES.CLEAR_FAULTS)} />
          <CommandButton disabled={isCommandSending} icon={Power} label="Reboot" color="text-purple-400" bg="hover:bg-purple-400/10" border="hover:border-purple-400/30" onClick={() => handleCommand(COMMAND_TYPES.REBOOT)} />
          <CommandButton disabled={isCommandSending} icon={HomeIcon} label="Home" color="text-[#027aad]" bg="hover:bg-[#027aad]/10" border="hover:border-[#027aad]/30" onClick={() => handleCommand(COMMAND_TYPES.HOME)} />
        </div>
      </div>

      {/* Faults Section */}
      {isFaulty && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 text-red-400 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-1">Device Fault Detected</h3>
              {hasFaults ? (
                <ul className="list-disc list-inside text-[#1a2b3c] space-y-1 mt-3">
                  {faultsList.map((fault, index) => (
                    <li key={index}>
                      {typeof fault === 'string' 
                        ? fault 
                        : fault?.faultName ? `${fault.faultName}` 
                        : fault?.message || 'Unknown fault'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#1a2b3c] mt-1">
                  The device is currently reporting a fault or error status. Please inspect the logs or use the 'Clear Faults' command.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Telemetry & Sensors */}
      <div>
        <h3 className="text-lg font-bold text-[#1a2b3c] mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#027aad]" />
          Sensor Telemetry
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

           <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Bat %</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.batteryPercent != null ? `${device.batteryPercent}%` : '--'}</p>
          </div>
          
          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Bat Volts</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.batteryVoltage != null ? `${device.batteryVoltage} V` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Sol Volts</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.solarVoltage != null ? `${device.solarVoltage} V` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Activity className="w-4 h-4 text-[#027aad]" />
              <span className="text-xs uppercase font-bold tracking-wider">Bat Curr</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.batteryCurrent != null ? `${device.batteryCurrent} A` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Cpu className="w-4 h-4 text-[#027aad]" />
              <span className="text-xs uppercase font-bold tracking-wider">Motor Status</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c] capitalize">
              {device.isRunning != null ? (device.isRunning ? 'Running' : 'Stopped') : '--'}
            </p>
          </div>

           <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Battery className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Rem mAh</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.remainingMah != null ? `${device.remainingMah} mAh` : '--'}</p>
          </div>

           <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Gauge className="w-4 h-4 text-pink-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Motor PWM</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.mpptDuty != null ? `${device.mpptDuty}%` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Motor 1 Current</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.motor1Current != null ? `${device.motor1Current} mA` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs uppercase font-bold tracking-wider">Motor 2 Current</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c]">{device.motor2Current != null ? `${device.motor2Current} mA` : '--'}</p>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Target className="w-4 h-4 text-[#1a2b3c]" />
              <span className="text-xs uppercase font-bold tracking-wider">Home Limit</span>
            </div>
            <div>
              {device.limitHome == 1 ? (
                <span className="text-xl font-bold text-[#1a2b3c] capitalize">Triggered</span>
              ) : (
                <span className="text-xl font-bold text-[#1a2b3c] capitalize">Normal</span>
              )}
            </div>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Target className="w-4 h-4 text-[#1a2b3c]" />
              <span className="text-xs uppercase font-bold tracking-wider">End Limit</span>
            </div>
            <div>
              {device.limitEnd == 1 ? (
                <span className="text-xl font-bold text-[#1a2b3c] capitalize">Triggered</span>
              ) : (
                <span className="text-xl font-bold text-[#1a2b3c] capitalize">Normal</span>
              )}
            </div>
          </div>

          <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#5a6b7c] mb-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span className="text-xs uppercase font-bold tracking-wider">State</span>
            </div>
            <p className="text-xl font-bold text-[#1a2b3c] capitalize">{device.state != null ? device.state : '--'}</p>
          </div>

        </div>
      </div>

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
      {otaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e2eaf0] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#1a2b3c] mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              OTA Update
            </h2>
            
            <form onSubmit={handleOtaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Target</label>
                <select
                  value={otaTarget}
                  onChange={e => setOtaTarget(e.target.value)}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="firmware">Firmware</option>
                  <option value="filesystem">Filesystem</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Select File (.bin, .elf)</label>
                <input
                  type="file"
                  accept=".bin,.elf"
                  onChange={e => setOtaFile(e.target.files[0])}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => {
                    setOtaModalOpen(false);
                    setOtaFile(null);
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-white hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading || !otaFile}
                  className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-indigo-500 hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
