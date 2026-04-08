import { useState } from 'react'
import {
  AiOutlineSearch,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineCalendar,
  AiOutlineFilter
} from 'react-icons/ai'

function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState('all')

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@acme.com',
      company: 'Acme Corporation',
      role: 'Admin',
      service: 'Odoo',
      status: 'active',
      joined: '2024-01-15',
      lastActive: '2 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@techstart.com',
      company: 'TechStart Inc',
      role: 'Manager',
      service: 'Bitrix24',
      status: 'active',
      joined: '2024-02-20',
      lastActive: '5 min ago',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@globalsolutions.com',
      company: 'Global Solutions',
      role: 'User',
      service: 'Zoho',
      status: 'active',
      joined: '2024-03-10',
      lastActive: '1 day ago',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily@innovationlabs.com',
      company: 'Innovation Labs',
      role: 'User',
      service: 'Odoo',
      status: 'inactive',
      joined: '2024-01-25',
      lastActive: '2 weeks ago',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david@digitaldynamics.com',
      company: 'Digital Dynamics',
      role: 'Manager',
      service: 'Bitrix24',
      status: 'active',
      joined: '2024-04-05',
      lastActive: '3 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      email: 'lisa@cloudtech.com',
      company: 'CloudTech',
      role: 'Admin',
      service: 'Zoho',
      status: 'active',
      joined: '2024-02-14',
      lastActive: '30 min ago',
      avatar: 'https://i.pravatar.cc/150?img=10'
    },
    {
      id: 7,
      name: 'Robert Taylor',
      email: 'robert@startup.io',
      company: 'Startup IO',
      role: 'User',
      service: 'Odoo',
      status: 'active',
      joined: '2024-03-22',
      lastActive: '1 hour ago',
      avatar: 'https://i.pravatar.cc/150?img=13'
    },
    {
      id: 8,
      name: 'Jennifer Martinez',
      email: 'jennifer@enterprise.com',
      company: 'Enterprise Co',
      role: 'Manager',
      service: 'Bitrix24',
      status: 'suspended',
      joined: '2024-01-08',
      lastActive: '1 month ago',
      avatar: 'https://i.pravatar.cc/150?img=15'
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase()
    return matchesSearch && matchesRole
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-gray-100 text-gray-700'
      case 'suspended': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700'
      case 'Manager': return 'bg-blue-100 text-blue-700'
      case 'User': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-primary">User Management</h1>
          <p className="text-gray-500 font-primary mt-1">Manage all users across services</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2 font-primary"
        >
          <AiOutlinePlus className="text-lg" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Total Users</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">15,847</p>
          <p className="text-sm text-green-500 font-primary mt-2">+12.5% this month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Active Users</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">14,230</p>
          <p className="text-sm text-gray-400 font-primary mt-2">89.8% of total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">New This Month</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">1,847</p>
          <p className="text-sm text-green-500 font-primary mt-2">+18% vs last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-primary">Suspended</p>
          <p className="text-3xl font-bold text-gray-800 font-primary mt-2">234</p>
          <p className="text-sm text-red-500 font-primary mt-2">1.5% of total</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-primary"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
            <option>All Services</option>
            <option>Odoo</option>
            <option>Bitrix24</option>
            <option>Zoho</option>
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary">
            <AiOutlineFilter className="text-lg" />
            More Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  User
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Company
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Role
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Service
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Last Active
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-800 font-primary">{user.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <AiOutlineMail className="text-xs" />
                          <span className="font-primary">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-primary">
                    {user.company}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium font-primary ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-primary">
                      {user.service}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium font-primary capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 font-primary">
                    {user.lastActive}
                  </td>
                  <td className="py-4 px-4">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-primary">
            Showing 1 to {filteredUsers.length} of {users.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary text-sm">
              Previous
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-primary text-sm">
              1
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary text-sm">
              2
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary text-sm">
              3
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800 font-primary">Add New User</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <AiOutlineClose className="text-xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Company
                </label>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Role
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                    <option>User</option>
                    <option>Manager</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Service
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                    <option>Odoo</option>
                    <option>Bitrix24</option>
                    <option>Zoho</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                  Status
                </label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-primary"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
