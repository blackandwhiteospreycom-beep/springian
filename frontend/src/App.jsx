import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { DashboardProvider } from './context/DashboardContext'
import LauncherGrid from './components/LauncherGrid'
import Login from './pages/Login'
import Signup from './pages/Signup'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import DashboardHome from './components/DashboardHome'
import Services from './components/Services'
import Users from './components/Users'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import DashboardBuilder from './dashboard/pages/DashboardBuilder'

function App() {
  return (
    <Router>
      <DashboardProvider>
        <Routes>
          <Route path="/" element={<LauncherGrid />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Drag-and-Drop Dashboard */}
          <Route path="/dashboard" element={<DashboardBuilder />} />

          {/* Super Admin Dashboard Routes */}
          <Route path="/admin" element={<SuperAdminDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="services" element={<Services />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </DashboardProvider>
    </Router>
  )
}

export default App
