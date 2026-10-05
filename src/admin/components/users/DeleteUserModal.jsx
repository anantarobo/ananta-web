import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { postData } from '../../services/api';

export default function DeleteUserModal({ user, onClose, onRefresh, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const data = await postData('/users/delete', { id: user.id });
      if (data && data.success) {
        toast.success('User deleted successfully!');
        if (onRefresh) onRefresh();
        if (onDeleteSuccess) onDeleteSuccess();
        onClose();
      } else {
        toast.error(data?.message || 'Failed to delete user');
      }
    } catch (err) {
      toast.error('Error while deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#f4f8fb]/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border border-[#e2eaf0] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2b3c] mb-2">Delete User?</h2>
          <p className="text-[#5a6b7c] mb-8">
            Are you sure you want to delete <span className="text-[#1a2b3c] font-medium">{user.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-[#e2eaf0] text-[#1a2b3c] hover:bg-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="px-6 py-2.5 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-400 text-[#1a2b3c] font-bold transition-all disabled:opacity-50 min-w-[120px]"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
