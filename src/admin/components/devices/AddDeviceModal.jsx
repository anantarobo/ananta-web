import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2, MonitorSmartphone, ChevronDown, Search, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { postData } from '../../services/api';

export default function AddDeviceModal({ isOpen, onClose, onSuccess, userId }) {
  const [deviceData, setDeviceData] = useState({
    deviceId: '',
    deviceName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Selection States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDeviceData({ deviceId: '', deviceName: '' });
      setSelectedUser(null);
      setSearchQuery('');
      setUsersPage(1);
      setUsers([]);
      setHasMoreUsers(true);
      setIsDropdownOpen(false);
      if (!userId) {
        fetchUsers(1, '');
      }
    }
  }, [isOpen, userId]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async (page = 1, search = '') => {
    if (isUsersLoading || (!hasMoreUsers && page !== 1)) return;
    
    setIsUsersLoading(true);
    try {
      const data = await postData('/users/list', {
        page,
        limit: 20,
        search
      });
      
      if (data && data.success) {
        const fetchedUsers = data.users || [];
        if (page === 1) {
          setUsers(fetchedUsers);
        } else {
          setUsers(prev => [...prev, ...fetchedUsers]);
        }
        setHasMoreUsers(fetchedUsers.length === 20); // assuming limit is 20
        setUsersPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      setHasMoreUsers(true);
      fetchUsers(1, val);
    }, 500);
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    // Load more when user scrolls near the bottom
    if (scrollHeight - scrollTop <= clientHeight + 10 && !isUsersLoading && hasMoreUsers) {
      fetchUsers(usersPage + 1, searchQuery);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build payload. Add userId if it's provided via props (from User Details page),
      // otherwise use the selected user from dropdown (from Devices page).
      const payload = {
        ...deviceData,
      };
      
      if (userId) {
        payload.userId = userId;
      } else if (selectedUser) {
        payload.userId = selectedUser.id;
      }

      const data = await postData('/devices/create', payload);

      if (data && data.success) {
        toast.success('Device added successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data?.message || 'Failed to add device');
      }
    } catch (err) {
      toast.error('Error while adding device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border border-[#e2eaf0] rounded-3xl shadow-2xl w-full max-w-lg overflow-visible animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-[#e2eaf0] flex justify-between items-center bg-white rounded-t-3xl relative z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#015a82]/10 text-[#027aad] rounded-xl">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a2b3c]">Add New Device</h2>
              <p className="text-sm text-[#5a6b7c] mt-0.5">Register a new device to the system</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 bg-white rounded-b-3xl relative z-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-2">Device Name</label>
              <input 
                type="text" required
                value={deviceData.deviceName}
                onChange={e => setDeviceData({...deviceData, deviceName: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
                placeholder="Enter device name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-2">Device ID / Serial Number</label>
              <input 
                type="text" required
                value={deviceData.deviceId}
                onChange={e => setDeviceData({...deviceData, deviceId: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
                placeholder="Enter device ID"
              />
            </div>

            {/* Custom User Dropdown - Only show if userId prop is not provided */}
            {!userId && (
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-[#1a2b3c] mb-2">Assign to User (Optional)</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50 cursor-pointer flex justify-between items-center transition-colors hover:border-slate-600"
                >
                  <span className={selectedUser ? "text-[#1a2b3c]" : "text-[#5a6b7c]"}>
                    {selectedUser ? selectedUser.name : "Select a user"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#5a6b7c] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-[#e2eaf0] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-[#e2eaf0] bg-white/95 sticky top-0 z-10">
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#5a6b7c] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#015a82] transition-colors"
                        />
                      </div>
                    </div>
                    <ul 
                      className="max-h-[200px] overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
                      onScroll={handleScroll}
                    >
                      <li 
                        onClick={() => {
                          setSelectedUser(null);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm flex items-center justify-between hover:bg-slate-100/50 transition-colors mb-1 ${!selectedUser ? 'text-[#027aad] font-medium bg-[#027aad]/5' : 'text-[#1a2b3c]'}`}
                      >
                        Unassigned (No User)
                        {!selectedUser && <Check className="w-4 h-4" />}
                      </li>
                      
                      {users.map(u => (
                        <li 
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm flex items-center justify-between hover:bg-slate-100/50 transition-colors ${selectedUser?.id === u.id ? 'text-[#027aad] font-medium bg-[#027aad]/5' : 'text-[#1a2b3c]'}`}
                        >
                          <div className="flex flex-col">
                            <span className="truncate">{u.name || 'Unknown User'}</span>
                            {u.email && <span className="text-xs text-[#5a6b7c] truncate">{u.email}</span>}
                          </div>
                          {selectedUser?.id === u.id && <Check className="w-4 h-4 shrink-0" />}
                        </li>
                      ))}
                      
                      {isUsersLoading && (
                        <li className="p-4 flex justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[#015a82]" />
                        </li>
                      )}
                      
                      {!isUsersLoading && users.length === 0 && (
                        <li className="p-6 text-center text-[#5a6b7c] text-sm">
                          No users found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[#e2eaf0] text-[#1a2b3c] hover:bg-white font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 flex items-center justify-center rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-bold transition-all disabled:opacity-50 min-w-[130px] shadow-lg shadow-lg">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
