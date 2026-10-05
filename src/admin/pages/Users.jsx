import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, Plus, Search, Mail, Phone, ShieldCheck, X, ChevronLeft, ChevronRight, Loader2, Eye, EyeOff, Pencil, Trash2, MonitorSmartphone } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { postData } from '../services/api'
import EditUserModal from '../components/users/EditUserModal'
import DeleteUserModal from '../components/users/DeleteUserModal'

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  
  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: '', 
    role: 'user' 
  });

  const abortControllerRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== debouncedSearch) {
        setDebouncedSearch(searchTerm);
        setCurrentPage(1); // Reset to page 1 on search
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  const fetchUsers = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const data = await postData('/users/list', { 
        page: currentPage, 
        limit: limit, 
        search: debouncedSearch 
      }, {
        signal: abortControllerRef.current.signal
      });
      if (data && data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.total || 0);
      } else {
        toast.error(data?.message || 'Failed to fetch users');
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Unable to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, debouncedSearch]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchUsers();
    
    return () => {
      if (abortControllerRef.current) {
         abortControllerRef.current.abort();
      }
    };
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = await postData('/users/create', newUser);

      if (data && data.success) {
        toast.success('User added successfully!');
        setNewUser({ name: '', email: '', phone: '', password: '', role: 'user' });
        setIsAdding(false);
        fetchUsers(); // Refresh current page
      } else {
        toast.error(data?.message || 'Failed to add user');
      }
    } catch (err) {
      toast.error('Error while adding user');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Shimmer Loader Component
  const TableShimmer = () => (
    <>
      {[...Array(limit < 10 ? limit : 5)].map((_, i) => (
        <tr key={i} className="border-b border-[#e2eaf0]">
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100/50 animate-pulse shrink-0"></div>
              <div className="h-4 w-32 bg-slate-100/50 rounded animate-pulse"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-40 bg-slate-100/50 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-28 bg-slate-100/50 rounded animate-pulse"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex justify-end items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-100/50 animate-pulse"></div>
              <div className="h-4 w-16 bg-slate-100/50 rounded animate-pulse"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight flex items-center gap-3">
            Users Management
            <span className="text-sm font-medium bg-[#015a82]/10 text-[#027aad] px-3 py-1 rounded-full border border-[#015a82]/20">
              {totalUsers} Total
            </span>
          </h1>
          <p className="text-[#5a6b7c] mt-1">Manage admin and regular users for the platform.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 text-[#5a6b7c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#015a82]/50 focus:border-[#015a82] focus:outline-none placeholder:text-[#5a6b7c] transition-all"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-semibold transition-colors shadow-lg shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-white border border-[#e2eaf0] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-[#e2eaf0] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1a2b3c]">Register New User</h2>
                <p className="text-sm text-[#5a6b7c] mt-1">Fill in the details below to create an account.</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Full Name</label>
                  <input 
                    type="text" required
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Email Address</label>
                  <input 
                    type="email" required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Phone Number</label>
                  <input 
                    type="tel" required
                    value={newUser.phone}
                    onChange={e => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} required
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50 pr-10"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5a6b7c] hover:text-[#027aad] focus:outline-none transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Role</label>
                  <div className="relative">
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50 appearance-none"
                    >
                      <option value="user">Standard User</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <ShieldCheck className="w-5 h-5 text-[#5a6b7c]" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-xl border border-[#e2eaf0] text-[#1a2b3c] hover:bg-white font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 flex items-center justify-center rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-bold transition-all disabled:opacity-50 min-w-[140px]">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal 
        user={editingUser} 
        onClose={() => setEditingUser(null)} 
        onRefresh={fetchUsers} 
      />

      {/* Delete Confirmation Modal */}
      <DeleteUserModal 
        user={deletingUser} 
        onClose={() => setDeletingUser(null)} 
        onRefresh={fetchUsers} 
      />

      {/* Users Table */}
      <div className="bg-white border border-[#e2eaf0] rounded-2xl overflow-hidden shadow-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#1a2b3c]">
            <thead className="text-xs uppercase bg-white/50 text-[#5a6b7c] border-b border-[#e2eaf0]">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">User</th>
                <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                <th scope="col" className="px-6 py-4 font-semibold">Phone</th>
                <th scope="col" className="px-6 py-4 font-semibold">Devices</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableShimmer />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-[#5a6b7c] text-base">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => navigate(`/dashboard/users/${user.id}`)}
                    className="border-b border-[#e2eaf0] hover:bg-slate-100/20 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#015a82]/20 to-[#015a82]/20 border border-[#015a82]/30 flex items-center justify-center text-[#027aad] font-bold shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="text-[#1a2b3c] font-medium text-base">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
                        <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{user.phone || 'Not provided'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-[#e2eaf0]">
                        <MonitorSmartphone className="w-3.5 h-3.5 text-[#027aad]" />
                        <span className="text-xs font-semibold text-[#1a2b3c]">{user.deviceCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`text-sm font-medium capitalize ${user.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {user.status || 'inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                          className="p-2 text-slate-500 hover:text-[#015a82] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingUser(user); }}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-[#e2eaf0] bg-white/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[#5a6b7c]">
              <span>Show</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-lg px-2 py-1 focus:outline-none focus:border-[#015a82]"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#5a6b7c]">
                Page <span className="font-medium text-[#1a2b3c]">{currentPage}</span> of <span className="font-medium text-[#1a2b3c]">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[#e2eaf0] text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
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
  )
}
