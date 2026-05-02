import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard, WIDGET_TYPES } from '../context/DashboardContext'
import {
  AiOutlineAppstore,
  AiOutlineTeam,
  AiOutlineBarChart,
  AiOutlineSetting,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold,
  AiOutlineBell,
  AiOutlineSearch,
  AiOutlineDown,
  AiOutlineUser,
  AiOutlineHome,
  AiOutlineLogout,
  AiOutlineDollar,
  AiOutlinePlus,
  AiOutlineCheck
} from 'react-icons/ai'
import AIIntegration from './AIChat/AIIntegration'

const SERVICE_WIDGETS = {
  crm: {
    id: 'crm',
    label: 'CRM',
    icon: AiOutlineAppstore,
    color: '#296374',
    users: 1250,
    status: 'active',
    widgetTypes: ['crm-stats', 'crm-leads', 'crm-pipeline'],
  },
  erp: {
    id: 'erp',
    label: 'ERP',
    icon: AiOutlineBarChart,
    color: '#714B67',
    users: 890,
    status: 'active',
    widgetTypes: ['erp-overview'],
  },
  hr: {
    id: 'hr',
    label: 'HR',
    icon: AiOutlineTeam,
    color: '#25A8E1',
    users: 654,
    status: 'active',
    widgetTypes: ['hr-employees', 'hr-attendance'],
  },
  projects: {
    id: 'projects',
    label: 'Projects',
    icon: AiOutlineAppstore,
    color: '#00AEEF',
    users: 523,
    status: 'active',
    widgetTypes: ['project-tasks', 'project-board'],
  },
  accounting: {
    id: 'accounting',
    label: 'Accounting',
    icon: AiOutlineDollar,
    color: '#16A34A',
    users: 445,
    status: 'active',
    widgetTypes: ['accounting-journal', 'accounting-reports'],
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    icon: AiOutlineAppstore,
    color: '#DC2626',
    users: 378,
    status: 'active',
    widgetTypes: ['inventory-products', 'inventory-stock'],
  },
}

function SuperAdminDashboard({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { addWidget } = useDashboard()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeServices, setActiveServices] = useState(
    JSON.parse(localStorage.getItem('activeServices') || '["crm","erp","hr","projects","accounting","inventory"]')
  )
  const [searchQuery, setSearchQuery] = useState('')

  const toggleService = (serviceId) => {
    setActiveServices(prev => {
      const next = prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
      localStorage.setItem('activeServices', JSON.stringify(next))
      return next
    })
  }

  const addServiceWidget = (serviceId) => {
    const service = SERVICE_WIDGETS[serviceId]
    if (service && addWidget) {
      addWidget('link', {
        i: `widget-${serviceId}-${Date.now()}`,
        x: 0,
        y: 0,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      }, {
        title: service.label,
        url: `/dashboard`,
        description: `${service.label} module`,
        icon: 'link',
        color: service.color,
      })
    }
  }

  const allServices = Object.values(SERVICE_WIDGETS)
  const filteredServices = searchQuery
    ? allServices.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allServices

  // Navigation for Super Admin
  const adminNavItems = [
    { path: '/admin', label: 'Platform Overview', icon: AiOutlineHome },
    { path: '/dashboard/services', label: 'Services', icon: AiOutlineAppstore },
    { path: '/dashboard/users', label: 'Users', icon: AiOutlineTeam },
    { path: '/dashboard/analytics', label: 'Analytics', icon: AiOutlineBarChart },
    { path: '/dashboard/settings', label: 'Settings', icon: AiOutlineSetting },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar — Widget/Service Controller */}
      <aside
        className={`bg-gray-900 text-white transition-all duration-300 fixed sm:relative h-screen sm:h-auto z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen && (
            <span className="text-xl font-bold text-primary font-primary">Master App</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? <AiOutlineMenuFold className="text-xl" /> : <AiOutlineMenuUnfold className="text-xl" />}
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="px-3 mt-3">
            <div className="relative">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Services List */}
        <nav className="mt-3 px-2">
          {sidebarOpen && (
            <h3 className="text-xs text-gray-500 uppercase font-primary mb-2 px-2">Services</h3>
          )}
          {filteredServices.map((service) => {
            const Icon = service.icon
            const isActive = activeServices.includes(service.id)
            return (
              <div
                key={service.id}
                className={`flex items-center gap-3 px-3 py-2 mb-1 rounded-lg transition-colors ${
                  isActive ? 'bg-gray-800' : 'bg-gray-800/50 opacity-60'
                }`}
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: service.color }}
                >
                  <Icon className="text-white text-sm" />
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium font-primary truncate">{service.name || service.label}</p>
                      <button
                        onClick={() => toggleService(service.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                          isActive ? 'bg-green-500' : 'bg-gray-600'
                        }`}
                      >
                        {isActive && <AiOutlineCheck size={12} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{service.users} users</p>
                  </div>
                )}
                {sidebarOpen && (
                  <button
                    onClick={() => addServiceWidget(service.id)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                    title="Add to dashboard"
                  >
                    <AiOutlinePlus size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </nav>

        {/* Quick Nav */}
        {sidebarOpen && (
          <div className="mt-6 px-3">
            <h3 className="text-xs text-gray-500 uppercase font-primary mb-2 px-2">Quick Links</h3>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-1 w-full text-left"
            >
              <AiOutlineAppstore className="text-lg flex-shrink-0" />
              <span className="font-medium font-primary text-sm">Organization Dashboard</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-1 w-full text-left"
            >
              <AiOutlineSetting className="text-lg flex-shrink-0" />
              <span className="font-medium font-primary text-sm">Landing Page</span>
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-600 hover:text-white transition-colors w-full text-left"
          >
            <AiOutlineLogout className="text-xl flex-shrink-0" />
            {sidebarOpen && <span className="font-medium font-primary">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content — Drag-and-Drop Dashboard */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 sticky top-0 z-40">
          <div className="h-full px-3 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-800">Super Admin Platform</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <AiOutlineBell className="text-xl text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium font-primary hidden sm:inline">{user?.name || 'Admin'}</span>
                  <AiOutlineDown className="text-sm" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 w-full text-left font-primary"
                    >
                      <AiOutlineLogout className="text-lg" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content — Children (DashboardBuilder) */}
        <main>
          {children}
        </main>
      </div>

      <AIIntegration />
    </div>
  )
}

export default SuperAdminDashboard
