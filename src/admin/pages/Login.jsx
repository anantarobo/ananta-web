import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { postData } from '../services/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const data = await postData('/auth/admin-login', { email, password });
      
      if (data && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        toast.success('Successfully logged in!');
        onLogin(true);
        navigate('/dashboard');
      } else {
        toast.error(data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.error('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8fb] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#015a82]/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#014a6b]/20 blur-[120px] pointer-events-none"></div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full p-8 border border-[#e2eaf0] backdrop-blur-xl relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden shadow-lg shadow-lg transform transition-transform hover:scale-105">
            <img src="/logo.jpg" alt="AnantaRobo Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a2b3c] tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-[#5a6b7c] text-sm">
            Please sign in to your admin account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a2b3c] ml-1">Email Address</label>
            <div className="relative group">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50 focus:border-[#015a82] transition-all placeholder:text-slate-600"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-[#1a2b3c]">Password</label>
            </div>
            <div className="relative group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3 bg-white/50 border border-[#e2eaf0] text-[#1a2b3c] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#015a82]/50 focus:border-[#015a82] transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5a6b7c] hover:text-[#027aad] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full relative mt-6 inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#015a82] to-[#014a6b] p-4 text-white font-bold tracking-wide transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] focus:outline-none focus:ring-2 focus:ring-[#015a82] focus:ring-offset-2 focus:ring-offset-slate-900 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
