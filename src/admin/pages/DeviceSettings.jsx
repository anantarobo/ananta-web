import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Loader2, 
  Settings as SettingsIcon,
  Battery, Zap, Shield, Timer, Gauge, Repeat, Settings2, Cloud, Server, Hash, RefreshCcw, Sun, ArrowLeftRight, Edit2, Save
} from 'lucide-react'
import { postData } from '../services/api'
import { toast } from 'react-hot-toast'

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-xs font-bold text-[#5a6b7c] uppercase tracking-wider mb-4 px-2">{title}</h3>
    <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-700/50">
      {children}
    </div>
  </div>
);

const SettingRow = ({ icon: Icon, label, description, unit, isToggle, fieldKey, value, onChange }) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/30 transition-colors">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="p-2 bg-white rounded-lg text-[#5a6b7c]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-[#1a2b3c]">{label}</h4>
          {description && <p className="text-xs text-[#5a6b7c] mt-0.5">{description}</p>}
        </div>
      </div>
      <div>
        {isToggle ? (
          <div 
            onClick={() => onChange(fieldKey, !value)}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${value ? 'bg-[#015a82]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 group w-32">
            <input 
              type="text"
              value={value !== undefined && value !== null ? value : ''}
              onChange={(e) => onChange(fieldKey, e.target.value)}
              className="w-full bg-transparent text-right text-sm font-bold text-[#027aad] focus:outline-none focus:border-b border-[#015a82]/50"
            />
            {unit && <span className="text-xs text-[#5a6b7c] shrink-0">{unit}</span>}
            <Edit2 className="w-3 h-3 text-slate-600 group-hover:text-[#027aad] transition-colors shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

export default function DeviceSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedId = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving settings...');
    try {
      const payload = {
        deviceId: id,
        ...settings,
      };
      
      const numberFields = ['battery_uv', 'battery_ov', 'batt_capacity_mah', 'batt_full_v', 'batt_empty_v', 'max_travel_sec', 'max_pwm', 'auto_cycle_pwm', 'manual_pwm', 'motor_ramp_step', 'cloud_port', 'cloud_interval'];
      numberFields.forEach(k => {
        if (payload[k] !== undefined && payload[k] !== '') {
          payload[k] = Number(payload[k]);
        }
      });

      const data = await postData('/settings', payload);
      if (data && data.success !== false) {
        toast.success('Settings saved successfully', { id: toastId });
      } else {
        toast.error(data?.message || 'Failed to save settings', { id: toastId });
      }
    } catch (err) {
      toast.error('Unable to save settings', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (fetchedId.current === id) return;
    fetchedId.current = id;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const data = await postData('/get/setting', { deviceId: id });
        if (data && data.success !== false) {
          setSettings(data.data || data.setting || data);
        } else {
          toast.error(data?.message || 'Failed to fetch settings');
        }
      } catch (err) {
        toast.error('Unable to fetch settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [id]);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#015a82]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white/50 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight">Device Settings</h1>
        </div>
        <div className="text-center p-12 bg-white/40 border border-[#e2eaf0] rounded-2xl">
          <SettingsIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-[#5a6b7c]">Failed to load settings data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white/50 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-[#027aad]" />
              Device Configuration
            </h1>
            {/* <p className="text-[#5a6b7c] mt-1 font-mono text-sm">Device: {id}</p> */}
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#015a82] text-white font-bold hover:bg-[#027aad] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lg"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save
        </button>
      </div>

      <Section title="Battery Profile">
        <SettingRow icon={Battery} label="Capacity" fieldKey="batt_capacity_mah" unit="mAh" value={settings.batt_capacity_mah} onChange={handleChange} />
        <SettingRow icon={Zap} label="Full Voltage Charge Limit" fieldKey="batt_full_v" unit="V" value={settings.batt_full_v} onChange={handleChange} />
        <SettingRow icon={Zap} label="Empty Voltage Cutoff" fieldKey="batt_empty_v" unit="V" value={settings.batt_empty_v} onChange={handleChange} />
        <SettingRow icon={Shield} label="Under-Voltage Protection (UV)" fieldKey="battery_uv" unit="V" value={settings.battery_uv} onChange={handleChange} />
        <SettingRow icon={Shield} label="Over-Voltage Protection (OV)" fieldKey="battery_ov" unit="V" value={settings.battery_ov} onChange={handleChange} />
      </Section>

      <Section title="Motor & Travel Tuning">
        <SettingRow icon={Timer} label="Maximum Travel Timeout" fieldKey="max_travel_sec" unit="s" value={settings.max_travel_sec} onChange={handleChange} />
        <SettingRow icon={Gauge} label="Maximum Bound PWM Limit" fieldKey="max_pwm" unit="%" value={settings.max_pwm} onChange={handleChange} />
        <SettingRow icon={Repeat} label="Automatic Duty Cycle PWM" fieldKey="auto_cycle_pwm" unit="%" value={settings.auto_cycle_pwm} onChange={handleChange} />
        <SettingRow icon={Settings2} label="Manual Mode Speed PWM" fieldKey="manual_pwm" unit="%" value={settings.manual_pwm} onChange={handleChange} />
        <SettingRow icon={Settings2} label="Motor Soft Start" fieldKey="motor_ramp_step" unit="Second" value={settings.motor_ramp_step} onChange={handleChange} />
      </Section>

      <Section title="Cloud Connectivity">
        <SettingRow icon={Cloud} label="Cloud Communications" description="Stream metrics to target server infrastructure" isToggle={true} fieldKey="cloud_enabled" value={settings.cloud_enabled} onChange={handleChange} />
        <SettingRow icon={Server} label="Target Endpoint Host Address" fieldKey="cloud_ip" value={settings.cloud_ip} onChange={handleChange} />
        <SettingRow icon={Hash} label="Port Gateway Location" fieldKey="cloud_port" value={settings.cloud_port} onChange={handleChange} />
        <SettingRow icon={RefreshCcw} label="Telemetry Stream Sync Interval" fieldKey="cloud_interval" unit="second" value={settings.cloud_interval} onChange={handleChange} />
      </Section>

      <Section title="Hardware Signal Inversions">
        <SettingRow icon={ArrowLeftRight} label="Invert Home Sensor" description="Flips logic high/low readings" isToggle={true} fieldKey="invert_home" value={settings.invert_home} onChange={handleChange} />
        <SettingRow icon={ArrowLeftRight} label="Invert End Limit Sensor" description="Flips target boundary terminal states" isToggle={true} fieldKey="invert_end" value={settings.invert_end} onChange={handleChange} />
        <SettingRow icon={ArrowLeftRight} label="Invert Motor 1 Orientation" description="Swaps clockwise and counter-clockwise wiring direction" isToggle={true} fieldKey="invert_motor1" value={settings.invert_motor1} onChange={handleChange} />
        <SettingRow icon={ArrowLeftRight} label="Invert Motor 2 Orientation" description="Swaps secondary motor phasing" isToggle={true} fieldKey="invert_motor2" value={settings.invert_motor2} onChange={handleChange} />
      </Section>


    </div>
  );
}
