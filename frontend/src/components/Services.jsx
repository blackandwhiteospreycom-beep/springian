import { useState } from 'react'
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineAppstore,
  AiOutlineSetting,
  AiOutlineEye,
  AiOutlineDown,
  AiOutlineCloud,
  AiOutlineBarChart,
  AiOutlineTeam,
  AiOutlineDollar
} from 'react-icons/ai'

function Services() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const services = [
    {
      id: 1,
      name: 'CRM',
      description: 'Customer Relationship Management',
      icon: AiOutlineAppstore,
      color: '#296374',
      status: 'active',
      customers: 1250,
      revenue: '$18,500',
      uptime: '99.9%',
      lastUpdate: '2 hours ago',
      features: ['Lead Management', 'Sales Pipeline', 'Contact Management', 'Email Integration', 'Reports'],
      pricing: '$14.99/user/mo'
    },
    {
      id: 2,
      name: 'ERP',
      description: 'Enterprise Resource Planning',
      icon: AiOutlineBarChart,
      color: '#714B67',
      status: 'active',
      customers: 890,
      revenue: '$15,200',
      uptime: '99.8%',
      lastUpdate: '5 hours ago',
      features: ['Finance', 'Procurement', 'Manufacturing', 'Supply Chain', 'Analytics'],
      pricing: '$19.99/user/mo'
    },
    {
      id: 3,
      name: 'HR Management',
      description: 'Human Resources & Payroll',
      icon: AiOutlineTeam,
      color: '#25A8E1',
      status: 'active',
      customers: 654,
      revenue: '$11,580',
      uptime: '99.7%',
      lastUpdate: '1 day ago',
      features: ['Recruitment', 'Payroll', 'Attendance', 'Performance', 'Training'],
      pricing: '$12.99/user/mo'
    },
    {
      id: 4,
      name: 'Project Management',
      description: 'Tasks, Projects & Collaboration',
      icon: AiOutlineAppstore,
      color: '#00AEEF',
      status: 'active',
      customers: 523,
      revenue: '$9,840',
      uptime: '99.9%',
      lastUpdate: '3 hours ago',
      features: ['Task Tracking', 'Gantt Charts', 'Time Tracking', 'Team Collaboration', 'Reports'],
      pricing: '$11.99/user/mo'
    },
    {
      id: 5,
      name: 'Accounting',
      description: 'Financial Management & Invoicing',
      icon: AiOutlineDollar,
      color: '#16A34A',
      status: 'active',
      customers: 445,
      revenue: '$8,920',
      uptime: '99.8%',
      lastUpdate: '6 hours ago',
      features: ['Invoicing', 'Expenses', 'Bank Reconciliation', 'Tax Management', 'Financial Reports'],
      pricing: '$15.99/user/mo'
    },
    {
      id: 6,
      name: 'Inventory',
      description: 'Stock & Warehouse Management',
      icon: AiOutlineAppstore,
      color: '#DC2626',
      status: 'active',
      customers: 378,
      revenue: '$7,560',
      uptime: '99.7%',
      lastUpdate: '1 day ago',
      features: ['Stock Tracking', 'Warehouse Management', 'Barcode Scanning', 'Reordering', 'Reports'],
      pricing: '$13.99/user/mo'
    },
    {
      id: 7,
      name: 'E-Commerce',
      description: 'Online Store & Sales',
      icon: AiOutlineAppstore,
      color: '#9333EA',
      status: 'beta',
      customers: 215,
      revenue: '$4,300',
      uptime: '99.5%',
      lastUpdate: '12 hours ago',
      features: ['Online Store', 'Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management'],
      pricing: '$24.99/user/mo'
    },
    {
      id: 8,
      name: 'Help Desk',
      description: 'Customer Support & Ticketing',
      icon: AiOutlineSetting,
      color: '#EA580C',
      status: 'active',
      customers: 312,
      revenue: '$6,240',
      uptime: '99.8%',
      lastUpdate: '4 hours ago',
      features: ['Ticketing System', 'Live Chat', 'Knowledge Base', 'SLA Management', 'Reports'],
      pricing: '$10.99/user/mo'
    }
  ]

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-primary">Services Management</h1>
          <p className="text-gray-500 font-primary mt-1">Manage all integrated services and applications</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 font-primary"
        >
          <AiOutlinePlus className="text-lg" />
          Add Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Total Services</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">4</p>
          <p className="text-sm text-green-500 font-primary mt-2">3 Active</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">2,794</p>
          <p className="text-sm text-green-500 font-primary mt-2">+12% this month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">$45,280</p>
          <p className="text-sm text-green-500 font-primary mt-2">+8% this month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Avg Uptime</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">99.8%</p>
          <p className="text-sm text-gray-400 font-primary mt-2">Excellent</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-primary"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
            <option>Sort by Name</option>
            <option>Sort by Users</option>
            <option>Sort by Revenue</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: service.color }}
                    >
                      <Icon className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 font-primary">{service.name}</h3>
                      <p className="text-sm text-gray-500 font-primary">{service.pricing}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium font-primary ${
                      service.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {service.status}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 font-primary">{service.customers}</p>
                    <p className="text-xs text-gray-500 font-primary mt-1">Customers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 font-primary">{service.revenue}</p>
                    <p className="text-xs text-gray-500 font-primary mt-1">Revenue</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 font-primary">{service.uptime}</p>
                    <p className="text-xs text-gray-500 font-primary mt-1">Uptime</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 font-primary mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-primary"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 font-primary">Last updated: {service.lastUpdate}</p>
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600" title="View">
                    <AiOutlineEye className="text-lg" />
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600" title="Edit">
                    <AiOutlineEdit className="text-lg" />
                  </button>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-red-600" title="Delete">
                    <AiOutlineDelete className="text-lg" />
                  </button>
                </div>
                <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600" title="Settings">
                  <AiOutlineSetting className="text-lg" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 font-primary">Add New Service</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AiOutlineClose className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  placeholder="Enter service name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Pricing
                </label>
                <input
                  type="text"
                  placeholder="e.g., $14.99/user/mo"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Color
                </label>
                <input
                  type="color"
                  className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="CRM, ERP, etc."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-primary"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary">
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Services
