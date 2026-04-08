import { useState } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import {
  AiOutlineDashboard,
  AiOutlineAppstore,
  AiOutlineTeam,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineLogout,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
  AiOutlineBell,
  AiOutlineSearch,
  AiOutlineDown,
  AiOutlineDollar
} from 'react-icons/ai'

function SuperAdminDashboard() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Check if user is logged in as super admin (for demo, always true)
  const isAdmin = localStorage.getItem('isAdmin') === 'true'

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: AiOutlineDashboard },
    { path: '/admin/services', label: 'Services', icon: AiOutlineAppstore },
    { path: '/admin/users', label: 'Users', icon: AiOutlineTeam },
    { path: '/admin/analytics', label: 'Analytics', icon: AiOutlineBarChart },
    { path: '/admin/settings', label: 'Settings', icon: AiOutlineSetting },
  ]

  const services = [
    { name: 'CRM', icon: AiOutlineAppstore, color: '#296374', status: 'active', users: 1250 },
    { name: 'ERP', icon: AiOutlineBarChart, color: '#714B67', status: 'active', users: 890 },
    { name: 'HR', icon: AiOutlineTeam, color: '#25A8E1', status: 'active', users: 654 },
    { name: 'Projects', icon: AiOutlineAppstore, color: '#00AEEF', status: 'active', users: 523 },
    { name: 'Accounting', icon: AiOutlineDollar, color: '#16A34A', status: 'active', users: 445 },
    { name: 'Inventory', icon: AiOutlineAppstore, color: '#DC2626', status: 'active', users: 378 },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white transition-all duration-300 fixed sm:relative h-screen sm:h-auto z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary font-primary">
              Master App
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <AiOutlineMenuFold className="text-xl" />
            ) : (
              <AiOutlineMenuUnfold className="text-xl" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="text-xl flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium font-primary">{item.label}</span>
                )}
              </a>
            )
          })}
        </nav>

        {/* Services Section */}
        {sidebarOpen && (
          <div className="mt-8 px-4">
            <h3 className="text-xs text-gray-500 uppercase font-primary mb-3">
              Active Services
            </h3>
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.name}
                  className="flex items-center gap-3 px-4 py-2 mb-2 bg-gray-800 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: service.color }}
                  >
                    <Icon className="text-white text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium font-primary">{service.name}</p>
                    <p className="text-xs text-gray-400">{service.users} users</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )
            })}
          </div>
        )}

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <a
            href="/login"
            onClick={() => localStorage.removeItem('isAdmin')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            <AiOutlineLogout className="text-xl flex-shrink-0" />
            {sidebarOpen && (
              <span className="font-medium font-primary">Logout</span>
            )}
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64 sm:ml-64' : 'ml-20 sm:ml-0'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 sticky top-0 z-40">
          <div className="h-full px-3 sm:px-6 flex items-center justify-between">
            {/* Search */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="relative w-full sm:w-96">
                <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search users, services, analytics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-primary"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <AiOutlineBell className="text-xl text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="font-medium font-primary">Admin</span>
                      <AiOutlineDown className="text-sm" />
                    </>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <a
                      href="#"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 font-primary"
                    >
                      <AiOutlineUser className="text-lg" />
                      Profile
                    </a>
                    <a
                      href="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 font-primary"
                    >
                      <AiOutlineSetting className="text-lg" />
                      Settings
                    </a>
                    <hr className="my-2" />
                    <a
                      href="/login"
                      onClick={() => localStorage.removeItem('isAdmin')}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 font-primary"
                    >
                      <AiOutlineLogout className="text-lg" />
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
