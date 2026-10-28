import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Loader2, 
  LineChart as ChartIcon, 
  Calendar, 
  RefreshCw, 
  BatteryCharging, 
  Zap, 
  Sun, 
  Activity, 
  Info,
  ChevronDown
} from 'lucide-react'
import { postData } from '../services/api'
import { toast } from 'react-hot-toast'

const FIELD_OPTIONS = [
  { 
    id: 'batteryVoltage', 
    label: 'Battery Voltage', 
    unit: 'mV', 
    icon: BatteryCharging,
    color: '#0284c7', // Sky blue
    gradientStart: 'rgba(2, 132, 199, 0.35)',
    gradientEnd: 'rgba(2, 132, 199, 0.00)',
    description: 'Measured battery terminal voltage'
  },
  { 
    id: 'batteryCurrent', 
    label: 'Battery Current', 
    unit: 'mA', 
    icon: Zap,
    color: '#8b5cf6', // Violet
    gradientStart: 'rgba(139, 92, 246, 0.35)',
    gradientEnd: 'rgba(139, 92, 246, 0.00)',
    description: 'Current flowing in or out of battery'
  },
  { 
    id: 'solarCurrent', 
    label: 'Solar Current', 
    unit: 'mA', 
    icon: Sun,
    color: '#f59e0b', // Amber
    gradientStart: 'rgba(245, 158, 11, 0.35)',
    gradientEnd: 'rgba(245, 158, 11, 0.00)',
    description: 'Photovoltaic generation input current'
  },
  { 
    id: 'motor1Current', 
    label: 'Motor 1 Current', 
    unit: 'mA', 
    icon: Activity,
    color: '#10b981', // Emerald
    gradientStart: 'rgba(16, 185, 129, 0.35)',
    gradientEnd: 'rgba(16, 185, 129, 0.00)',
    description: 'Primary drive motor load current'
  },
  { 
    id: 'motor2Current', 
    label: 'Motor 2 Current', 
    unit: 'mA', 
    icon: Activity,
    color: '#ec4899', // Pink
    gradientStart: 'rgba(236, 72, 153, 0.35)',
    gradientEnd: 'rgba(236, 72, 153, 0.00)',
    description: 'Secondary drive motor load current'
  }
];

const PRESET_RANGES = [
  { label: 'Last 24 Hours', getDates: () => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return { start, end };
  }},
  { label: 'Last 7 Days', getDates: () => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }},
  { label: 'Last 30 Days', getDates: () => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start, end };
  }},
  { label: 'Custom', getDates: null }
];

// Helper to format ISO to HTML datetime-local input string (YYYY-MM-DDTHH:mm)
const toInputDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

export default function DeviceGraph() {
  const { id } = useParams();
  const navigate = useNavigate();
  const gradientId = useId();

  const [selectedField, setSelectedField] = useState('batteryVoltage');
  const [rangePreset, setRangePreset] = useState('Last 7 Days');
  
  // Default to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return toInputDateTime(d);
  });
  const [endDate, setEndDate] = useState(() => {
    return toInputDateTime(new Date());
  });

  const [graphData, setGraphData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const lastFetchKey = useRef('');

  const activeFieldConfig = FIELD_OPTIONS.find(f => f.id === selectedField) || FIELD_OPTIONS[0];

  const fetchGraphData = useCallback(async (force = false) => {
    if (!id) return;
    const fetchKey = `${id}_${selectedField}_${startDate}_${endDate}`;
    if (!force && lastFetchKey.current === fetchKey) {
      return;
    }
    lastFetchKey.current = fetchKey;

    setIsLoading(true);
    try {
      const payload = {
        deviceId: id,
        field: selectedField,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString()
      };

      const response = await postData('/devices/graph', payload);
      if (response && response.success !== false) {
        const rawPoints = response.data || (Array.isArray(response) ? response : []);
        // Normalize
        const formatted = rawPoints.map(pt => ({
          date: pt.date || pt.createdAt || pt.time,
          value: typeof pt.value === 'number' ? pt.value : Number(pt.value) || 0
        }));
        setGraphData(formatted);
      } else {
        toast.error(response?.message || 'Failed to fetch graph data');
      }
    } catch (err) {
      console.error('Error fetching graph:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Unable to load telemetry graph');
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedField, startDate, endDate]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleRefresh = () => {
    fetchGraphData(true);
  };

  const handlePresetSelect = (preset) => {
    setRangePreset(preset.label);
    if (preset.getDates) {
      const { start, end } = preset.getDates();
      setStartDate(toInputDateTime(start));
      setEndDate(toInputDateTime(end));
    }
  };

  // Calculations for SVG chart
  const values = graphData.map(d => d.value);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;
  const avgVal = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const latestVal = values.length > 0 ? values[values.length - 1] : 0;

  // Chart dimensions & coordinates
  const svgWidth = 1000;
  const svgHeight = 400;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const yRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;
  // Add 10% headroom above and below
  const yMinPadded = Math.max(0, minVal - yRange * 0.08);
  const yMaxPadded = maxVal + yRange * 0.08;
  const effectiveRange = yMaxPadded - yMinPadded || 1;

  const getX = (index) => {
    if (graphData.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (graphData.length - 1)) * chartW;
  };

  const getY = (val) => {
    return padding.top + chartH - ((val - yMinPadded) / effectiveRange) * chartH;
  };

  // Build SVG Path
  const points = graphData.map((d, i) => ({
    x: getX(i),
    y: getY(d.value),
    ...d
  }));

  const pathD = points.length > 0
    ? points.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        // Smooth bezier curve control points
        const prev = points[i - 1];
        const cx1 = prev.x + (pt.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (pt.x - prev.x) / 2;
        const cy2 = pt.y;
        return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
      }, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
    : '';

  // Generate 5 Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const val = yMinPadded + ratio * effectiveRange;
    return {
      val: Math.round(val),
      y: padding.top + chartH - ratio * chartH
    };
  });

  // Generate 5-6 X-axis ticks
  const xTickIndices = points.length > 0 
    ? [0, 0.25, 0.5, 0.75, 1].map(r => Math.min(points.length - 1, Math.round(r * (points.length - 1))))
    : [];
  const uniqueXTickIndices = [...new Set(xTickIndices)];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ChartIcon className="w-6 h-6 text-[#015a82]" />
              <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight">Telemetry Analytics</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#015a82]/20 bg-[#015a82]/10 text-[#027aad] hover:bg-[#015a82]/20 transition-all font-medium text-sm shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Field Selector Tabs */}
      <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-[#e2eaf0] shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {FIELD_OPTIONS.map((field) => {
            const Icon = field.icon;
            const isSelected = selectedField === field.id;
            return (
              <button
                key={field.id}
                onClick={() => setSelectedField(field.id)}
                className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-white border-[#015a82] shadow-sm ring-2 ring-[#015a82]/10'
                    : 'bg-transparent border-transparent hover:bg-slate-50 text-[#5a6b7c]'
                }`}
              >
                <div 
                  className="p-2.5 rounded-lg shrink-0 transition-transform"
                  style={{
                    backgroundColor: isSelected ? `${field.color}18` : '#f1f5f9',
                    color: isSelected ? field.color : '#64748b'
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-bold truncate ${isSelected ? 'text-[#1a2b3c]' : 'text-[#334155]'}`}>
                    {field.label}
                  </div>
                  <div className="text-xs text-[#64748b] flex items-center gap-1">
                    <span>Unit:</span>
                    <span className="font-mono font-medium">{field.unit}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range & Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2eaf0] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#5a6b7c] uppercase tracking-wider mr-1">Timeframe:</span>
            {PRESET_RANGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rangePreset === preset.label
                    ? 'bg-[#015a82] text-white shadow-sm'
                    : 'bg-slate-100 text-[#5a6b7c] hover:bg-slate-200 hover:text-[#1a2b3c]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-50 border border-[#e2eaf0] rounded-xl px-3 py-1.5 shadow-inner">
              <Calendar className="w-4 h-4 text-[#5a6b7c]" />
              <span className="text-xs text-[#5a6b7c] font-medium">From:</span>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setRangePreset('Custom');
                }}
                className="bg-transparent text-xs font-semibold text-[#1a2b3c] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-[#e2eaf0] rounded-xl px-3 py-1.5 shadow-inner">
              <Calendar className="w-4 h-4 text-[#5a6b7c]" />
              <span className="text-xs text-[#5a6b7c] font-medium">To:</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setRangePreset('Custom');
                }}
                className="bg-transparent text-xs font-semibold text-[#1a2b3c] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e2eaf0] shadow-sm">
          <span className="text-xs font-semibold text-[#5a6b7c] uppercase tracking-wider">Latest Recorded</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1a2b3c]">{latestVal.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#5a6b7c]">{activeFieldConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2eaf0] shadow-sm">
          <span className="text-xs font-semibold text-[#5a6b7c] uppercase tracking-wider">Average</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#027aad]">{avgVal.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#5a6b7c]">{activeFieldConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2eaf0] shadow-sm">
          <span className="text-xs font-semibold text-[#5a6b7c] uppercase tracking-wider">Minimum</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-700">{minVal.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#5a6b7c]">{activeFieldConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e2eaf0] shadow-sm">
          <span className="text-xs font-semibold text-[#5a6b7c] uppercase tracking-wider">Maximum</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{maxVal.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#5a6b7c]">{activeFieldConfig.unit}</span>
          </div>
        </div>
      </div>

      {/* Graph Visual Area */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2eaf0] shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1a2b3c] flex items-center gap-2">
              <span>{activeFieldConfig.label} Trend</span>
              <span className="text-xs font-normal text-[#5a6b7c]">({activeFieldConfig.description})</span>
            </h3>
            <p className="text-xs text-[#5a6b7c] mt-0.5">
              Showing {graphData.length} aggregated data buckets over selected window
            </p>
          </div>

          {hoveredPoint && (
            <div className="flex items-center gap-3 bg-slate-50 border border-[#e2eaf0] px-3.5 py-1.5 rounded-xl shadow-sm text-xs">
              <span className="text-[#5a6b7c]">
                {new Date(hoveredPoint.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}:
              </span>
              <span className="font-bold text-[#1a2b3c]" style={{ color: activeFieldConfig.color }}>
                {hoveredPoint.value.toLocaleString()} {activeFieldConfig.unit}
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#015a82]" />
            <p className="text-sm text-[#5a6b7c]">Loading telemetry points...</p>
          </div>
        ) : graphData.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-center">
            <Info className="w-10 h-10 text-slate-400" />
            <p className="text-base font-bold text-[#1a2b3c]">No telemetry records available</p>
            <p className="text-xs text-[#5a6b7c] max-w-sm">
              No logs found for {activeFieldConfig.label} within the chosen start and end date range.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none overflow-visible"
              style={{ minWidth: '600px' }}
            >
              <defs>
                <linearGradient id={`grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeFieldConfig.color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={activeFieldConfig.color} stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines and Y-axis labels */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={padding.left + chartW}
                    y2={tick.y}
                    stroke="#e2eaf0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 12}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {tick.val}
                  </text>
                </g>
              ))}

              {/* Shaded Area fill */}
              {areaD && (
                <path
                  d={areaD}
                  fill={`url(#grad-${gradientId})`}
                  className="transition-all duration-300"
                />
              )}

              {/* Trend Curve Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={activeFieldConfig.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Data Interactive Dots */}
              {points.map((pt, i) => {
                const isHovered = hoveredPoint && hoveredPoint.x === pt.x;
                return (
                  <g 
                    key={i} 
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Hover vertical line */}
                    {isHovered && (
                      <line
                        x1={pt.x}
                        y1={padding.top}
                        x2={pt.x}
                        y2={padding.top + chartH}
                        stroke={activeFieldConfig.color}
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Dot halo */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 7 : (points.length > 50 ? 2 : 4)}
                      fill={isHovered ? activeFieldConfig.color : '#ffffff'}
                      stroke={activeFieldConfig.color}
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />

                    {/* Larger hit target for mouse events */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill="transparent"
                    />
                  </g>
                );
              })}

              {/* Bottom X-axis line */}
              <line
                x1={padding.left}
                y1={padding.top + chartH}
                x2={padding.left + chartW}
                y2={padding.top + chartH}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />

              {/* X-axis time marks */}
              {uniqueXTickIndices.map((idx) => {
                const pt = points[idx];
                if (!pt) return null;
                const d = new Date(pt.date);
                const timeStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <text
                    key={idx}
                    x={pt.x}
                    y={padding.top + chartH + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {timeStr}
                  </text>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
