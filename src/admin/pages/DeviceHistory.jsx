import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, History as HistoryIcon, MonitorSmartphone } from 'lucide-react'
import { postData } from '../services/api'
import { toast } from 'react-hot-toast'

export default function DeviceHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  const fetchedPage = useRef(0);
  
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

  const fetchHistory = async (pageNum) => {
    if (fetchedPage.current === pageNum) return;
    fetchedPage.current = pageNum;

    setIsLoading(true);
    try {
      const data = await postData('/device/command/history', {
        deviceId: id,
        page: pageNum,
        limit: 20
      });
      
      const newItems = data?.data || data?.history || (Array.isArray(data) ? data : []);
      
      if (data && data.success !== false) {
        setHistory(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const filtered = newItems.filter(i => !existingIds.has(i.id));
          return [...prev, ...filtered];
        });
        
        if (newItems.length < 20) {
          setHasMore(false);
        }
      } else {
        toast.error(data?.message || 'Failed to fetch history');
        setHasMore(false);
      }
    } catch (err) {
      toast.error('Unable to fetch history');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
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

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('fail') || s.includes('error') || s.includes('timeout')) return 'bg-red-500/10 border-red-500/20 text-red-400';
    if (s.includes('success') || s.includes('done')) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (s.includes('pending') || s.includes('progress')) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-white border-[#e2eaf0] text-[#1a2b3c]';
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl border border-[#e2eaf0] bg-white/50 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-[#027aad]" />
            Command History
          </h1>
        </div>
      </div>

      <div className="bg-white/40 border border-[#e2eaf0] rounded-2xl overflow-hidden shadow-xl">
        {history.length === 0 && !isLoading ? (
          <div className="p-12 text-center">
            <MonitorSmartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-[#5a6b7c] text-base">No history records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {history.map((item, index) => {
              const isLast = history.length === index + 1;
              return (
                <div 
                  key={item.id || index} 
                  ref={isLast ? lastElementRef : null}
                  className="p-6 hover:bg-white/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-lg font-bold text-[#1a2b3c] mb-1">{item.command || 'Unknown Command'}</h4>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <span className="text-sm text-[#5a6b7c] font-medium">
                      {item.createdAt ? formatDate(item.createdAt) : '--'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#015a82]" />
          </div>
        )}
      </div>

    </div>
  );
}
