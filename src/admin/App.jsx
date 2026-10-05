import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './App.css'

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import Login from './pages/Login'
import Devices from './pages/Devices'
import Users from './pages/Users'
import UserDetails from './pages/UserDetails'
import UserSchedules from './pages/UserSchedules'
import DeviceDetails from './pages/DeviceDetails'
import DeviceHistory from './pages/DeviceHistory'
import DeviceSettings from './pages/DeviceSettings'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#015a82]" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155'
        }
      }} />
      <BrowserRouter basename="/admin">
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={setIsAuthenticated} /> : <Navigate to="/dashboard/devices" replace />} 
          />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardLayout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" replace />} 
          >
            {/* Default redirect inside dashboard */}
            <Route index element={<Navigate to="/dashboard/devices" replace />} />
            
            {/* Sub-pages */}
            <Route path="devices" element={<Devices />} />
            <Route path="devices/:id" element={<DeviceDetails />} />
            <Route path="devices/:id/history" element={<DeviceHistory />} />
            <Route path="devices/:id/settings" element={<DeviceSettings />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="users/:id/schedules" element={<UserSchedules />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard/devices" : "/login"} replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
