import { LayoutDashboard, MonitorSmartphone, LogOut, Search, Users, X, ChevronDown, User, Loader2, Menu } from 'lucide-react'
import { Outlet, NavLink } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { postData } from '../../services/api'

export default function DashboardLayout({ onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);

  const fetchedAdminRef = useRef(false);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const data = await postData('/users/detail', {});
        if (data && data.success && data.user) {
          setAdminUser(data.user);
          setEditFormData({
            name: data.user.name || '',
            phone: data.user.phone || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin details", err);
      }
    };
    
    if (!fetchedAdminRef.current) {
      fetchAdminDetails();
      fetchedAdminRef.current = true;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
  }

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const toastId = toast.loading('Updating profile...');
    try {
      const data = await postData('/users/update', {
        name: editFormData.name,
        phone: editFormData.phone
      });
      if (data && data.success !== false) {
        toast.success('Profile updated successfully', { id: toastId });
        setIsEditProfileModalOpen(false);
        setAdminUser(prev => ({
          ...prev,
          name: editFormData.name,
          phone: editFormData.phone
        }));
      } else {
        toast.error(data?.message || 'Failed to update profile', { id: toastId });
      }
    } catch (err) {
      toast.error('Unable to update profile', { id: toastId });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#e2eaf0] flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[#e2eaf0] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm shadow-lg" />
            <span className="text-lg font-bold tracking-tight text-[#1a2b3c]">Ananta Robotics</span>
          </div>
          <button className="md:hidden text-[#5a6b7c] hover:text-[#1a2b3c]" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-4 space-y-2">
          <NavLink 
            to="/dashboard/devices" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                ? 'bg-[#015a82]/10 text-[#027aad]' 
                : 'text-[#5a6b7c] hover:bg-[#f4f8fb] hover:text-[#015a82]'
              }`
            }
          >
            <MonitorSmartphone className="w-5 h-5" />
            Devices
          </NavLink>
          <NavLink 
            to="/dashboard/users" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive 
                ? 'bg-[#015a82]/10 text-[#027aad]' 
                : 'text-[#5a6b7c] hover:bg-[#f4f8fb] hover:text-[#015a82]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            Users
          </NavLink>
        </div>
        <div className="p-4 border-t border-[#e2eaf0]">
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsLogoutModalOpen(true);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#5a6b7c] hover:bg-red-500/10 hover:text-red-400 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        {/* Header */}
        <header className="h-20 bg-white/50 border-b border-[#e2eaf0] flex items-center justify-between px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-[#5a6b7c] hover:text-[#1a2b3c] rounded-xl hover:bg-white/50 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-[200px] sm:w-96 hidden sm:block">
              {/* Search removed as requested */}
            </div>
          </div>
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#1a2b3c]">{adminUser?.name || 'Admin User'}</p>
              <p className="text-xs text-[#5a6b7c]">{adminUser?.email || 'admin@anantarobo.com'}</p>
            </div>
            
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#015a82] to-[#015a82] flex items-center justify-center shadow-lg shadow-lg hover:ring-2 hover:ring-[#015a82]/50 transition-all">
                <span className="text-white font-bold text-sm">{getInitials(adminUser?.name)}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#5a6b7c]" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-[#e2eaf0] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsEditProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#1a2b3c] hover:text-[#1a2b3c] hover:bg-slate-100/50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>
                <div className="h-px bg-slate-100/50 my-1"></div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-slate-100/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area - Renders Child Routes */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)}></div>
          <div className="relative bg-white border border-[#e2eaf0] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#1a2b3c] mb-2">Confirm Logout</h3>
              <p className="text-[#5a6b7c] text-sm mb-6">
                Are you sure you want to log out of your admin account? You will need to sign in again to access the dashboard.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2eaf0] text-[#1a2b3c] hover:bg-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-[#1a2b3c] font-bold transition-colors shadow-lg shadow-red-500/20"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={() => setIsEditProfileModalOpen(false)}></div>
          <div className="relative bg-white border border-[#e2eaf0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h2 className="text-xl font-bold text-[#1a2b3c] mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#027aad]" />
              Edit Profile
            </h2>
            
            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-[#015a82]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5a6b7c] mb-1">Phone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={e => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white border border-[#e2eaf0] rounded-xl px-4 py-2 text-[#1a2b3c] focus:outline-none focus:border-[#015a82]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl text-[#1a2b3c] bg-white hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl text-white bg-[#015a82] hover:bg-[#027aad] font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
