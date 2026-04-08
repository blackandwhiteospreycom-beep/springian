import {
  AiOutlineUser,
  AiOutlineAppstore,
  AiOutlineDollar,
  AiOutlineRise,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineClockCircle,
  AiOutlineBarChart,
  AiOutlineTeam
} from 'react-icons/ai'

function DashboardHome() {
  const stats = [
    {
      title: 'Total Users',
      value: '15,847',
      change: '+12.5%',
      isPositive: true,
      icon: AiOutlineUser,
      color: '#296374',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Active Services',
      value: '3',
      change: '+1',
      isPositive: true,
      icon: AiOutlineAppstore,
      color: '#714B67',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Revenue (MTD)',
      value: '$45,280',
      change: '+8.2%',
      isPositive: true,
      icon: AiOutlineDollar,
      color: '#25A8E1',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Growth Rate',
      value: '23.4%',
      change: '-2.1%',
      isPositive: false,
      icon: AiOutlineRise,
      color: '#00AEEF',
      bgColor: 'bg-cyan-50'
    }
  ]

  const services = [
    {
      name: 'CRM',
      description: 'Customer Relationship Management',
      icon: AiOutlineAppstore,
      color: '#296374',
      status: 'active',
      customers: 1250,
      uptime: '99.9%',
      revenue: '$18,500'
    },
    {
      name: 'ERP',
      description: 'Enterprise Resource Planning',
      icon: AiOutlineBarChart,
      color: '#714B67',
      status: 'active',
      customers: 890,
      uptime: '99.8%',
      revenue: '$15,200'
    },
    {
      name: 'HR Management',
      description: 'Human Resources & Payroll',
      icon: AiOutlineTeam,
      color: '#25A8E1',
      status: 'active',
      customers: 654,
      uptime: '99.7%',
      revenue: '$11,580'
    }
  ]

  const recentActivities = [
    { user: 'John Doe', action: 'Subscribed to Odoo', time: '5 min ago', type: 'subscription' },
    { user: 'Sarah Smith', action: 'Upgraded to Premium', time: '12 min ago', type: 'upgrade' },
    { user: 'Mike Johnson', action: 'New registration', time: '25 min ago', type: 'registration' },
    { user: 'Emily Brown', action: 'Cancelled Bitrix24', time: '1 hour ago', type: 'cancellation' },
    { user: 'David Wilson', action: 'Added 5 team members', time: '2 hours ago', type: 'team' },
  ]

  const topUsers = [
    { name: 'Acme Corporation', service: 'Odoo', users: 245, revenue: '$4,850' },
    { name: 'TechStart Inc', service: 'Bitrix24', users: 189, revenue: '$3,920' },
    { name: 'Global Solutions', service: 'Zoho', users: 156, revenue: '$3,240' },
    { name: 'Innovation Labs', service: 'Odoo', users: 134, revenue: '$2,890' },
    { name: 'Digital Dynamics', service: 'Bitrix24', users: 98, revenue: '$2,150' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-primary">Dashboard Overview</h1>
          <p className="text-gray-500 font-primary mt-1">Welcome back, Super Admin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AiOutlineClockCircle className="text-lg" />
          <span className="font-primary">Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-primary">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 font-primary mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.isPositive ? (
                      <AiOutlineArrowUp className="text-green-500" />
                    ) : (
                      <AiOutlineArrowDown className="text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.isPositive ? 'text-green-500' : 'text-red-500'
                      } font-primary`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-400 font-primary">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-xl`}>
                  <Icon className="text-2xl" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Services Overview & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 font-primary">Services Overview</h2>
            <a href="/admin/services" className="text-primary font-medium hover:underline font-primary text-sm">
              View all
            </a>
          </div>
          <div className="space-y-4">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: service.color }}
                  >
                    <Icon className="text-white text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800 font-primary">{service.name}</h3>
                        <p className="text-xs text-gray-500 font-primary">{service.description}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-primary capitalize">
                        {service.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="font-primary">{service.customers} customers</span>
                      <span className="font-primary">Uptime: {service.uptime}</span>
                      <span className="font-primary font-medium text-gray-700">{service.revenue}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-primary">{activity.action}</p>
                  <p className="text-xs text-gray-500 font-primary">
                    <span className="font-medium">{activity.user}</span> • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary">Top Customers</h2>
          <a href="/admin/users" className="text-primary font-medium hover:underline font-primary text-sm">
            View all users
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Company
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Users
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Revenue
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 font-primary">
                    {user.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-primary">
                      {user.service}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-primary">{user.users}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800 font-primary">
                    {user.revenue}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-primary">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
