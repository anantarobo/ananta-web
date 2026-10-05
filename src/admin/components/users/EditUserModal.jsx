import { useState, useEffect } from 'react';
import { X, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { postData } from '../../services/api';

export default function EditUserModal({ user, onClose, onRefresh }) {
  const [editingUser, setEditingUser] = useState({ ...user });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEditingUser({ ...user });
  }, [user]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
      };
      if (editingUser.password) {
        payload.password = editingUser.password;
      }
      
      const data = await postData('/users/update', payload);

      if (data && data.success) {
        toast.success('User updated successfully!');
        if (onRefresh) onRefresh();
        onClose();
      } else {
        toast.error(data?.message || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Error while updating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border border-[#e2eaf0] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-[#e2eaf0] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#1a2b3c]">Edit User</h2>
            <p className="text-sm text-[#5a6b7c] mt-1">Update the user details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-[#5a6b7c] hover:text-[#1a2b3c] hover:bg-white rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleUpdateUser} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Full Name</label>
              <input 
                type="text" required
                value={editingUser.name || ''}
                onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Email Address</label>
              <input 
                type="email" required
                value={editingUser.email || ''}
                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Phone Number</label>
              <input 
                type="tel" required
                value={editingUser.phone || ''}
                onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a2b3c] mb-1.5">Password <span className="text-xs text-[#5a6b7c] font-normal">(Leave blank to keep same)</span></label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({...editingUser, password: e.target.value})}
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
                  value={editingUser.role || 'user'}
                  onChange={e => setEditingUser({...editingUser, role: e.target.value})}
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
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[#e2eaf0] text-[#1a2b3c] hover:bg-white font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 flex items-center justify-center rounded-xl bg-[#015a82] hover:bg-[#027aad] text-white font-bold transition-all disabled:opacity-50 min-w-[140px]">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
