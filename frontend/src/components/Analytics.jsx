import { useState } from 'react'
import {
  AiOutlineBarChart,
  AiOutlineLineChart,
  AiOutlinePieChart,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
  AiOutlineDownload,
  AiOutlineCalendar,
  AiOutlineFilter,
  AiOutlineAppstore
} from 'react-icons/ai'

function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedService, setSelectedService] = useState('all')

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$542,847',
      change: '+12.5%',
      isPositive: true,
      icon: AiOutlineBarChart,
      color: '#296374'
    },
    {
      title: 'Active Users',
      value: '14,230',
      change: '+8.2%',
      isPositive: true,
      icon: AiOutlineLineChart,
      color: '#714B67'
    },
    {
      title: 'New Signups',
      value: '1,847',
      change: '+18.4%',
      isPositive: true,
      icon: AiOutlinePieChart,
      color: '#25A8E1'
    },
    {
      title: 'Churn Rate',
      value: '2.3%',
      change: '-0.5%',
      isPositive: true,
      icon: AiOutlineLineChart,
      color: '#00AEEF'
    }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 38000, users: 1200 },
    { month: 'Feb', revenue: 42000, users: 1350 },
    { month: 'Mar', revenue: 45000, users: 1450 },
    { month: 'Apr', revenue: 48000, users: 1580 },
    { month: 'May', revenue: 52000, users: 1720 },
    { month: 'Jun', revenue: 55000, users: 1850 },
    { month: 'Jul', revenue: 58000, users: 1950 },
    { month: 'Aug', revenue: 62000, users: 2100 },
    { month: 'Sep', revenue: 54280, users: 2794 },
  ]

  const servicePerformance = [
    {
      name: 'CRM',
      description: 'Customer Relationship Management',
      icon: AiOutlineAppstore,
      color: '#296374',
      revenue: '$245,800',
      customers: 5240,
      growth: '+15.2%',
      satisfaction: '94%'
    },
    {
      name: 'ERP',
      description: 'Enterprise Resource Planning',
      icon: AiOutlineBarChart,
      color: '#714B67',
      revenue: '$189,500',
      customers: 4120,
      growth: '+12.8%',
      satisfaction: '92%'
    },
    {
      name: 'HR Management',
      description: 'Human Resources & Payroll',
      icon: AiOutlineTeam,
      color: '#25A8E1',
      revenue: '$107,547',
      customers: 2890,
      growth: '+8.5%',
      satisfaction: '89%'
    },
    {
      name: 'Project Management',
      description: 'Tasks & Collaboration',
      icon: AiOutlineAppstore,
      color: '#00AEEF',
      revenue: '$85,200',
      customers: 2150,
      growth: '+10.2%',
      satisfaction: '91%'
    }
  ]

  const userActivityData = [
    { day: 'Mon', active: 4500, new: 120, churn: 15 },
    { day: 'Tue', active: 4800, new: 150, churn: 20 },
    { day: 'Wed', active: 5200, new: 180, churn: 25 },
    { day: 'Thu', active: 5100, new: 140, churn: 18 },
    { day: 'Fri', active: 5500, new: 200, churn: 22 },
    { day: 'Sat', active: 4200, new: 90, churn: 12 },
    { day: 'Sun', active: 3800, new: 75, churn: 10 },
  ]

  const topFeatures = [
    { name: 'CRM Module', usage: 89, trend: '+5%' },
    { name: 'Project Management', usage: 76, trend: '+12%' },
    { name: 'Accounting', usage: 68, trend: '+3%' },
    { name: 'HR Management', usage: 54, trend: '+8%' },
    { name: 'Inventory', usage: 45, trend: '-2%' },
  ]

  // Simple bar chart component
  const SimpleBarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.revenue))
    return (
      <div className="flex items-end gap-2 h-full" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-primary to-teal-400 rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(item.revenue / maxValue) * 100}%`,
                minHeight: '20px'
              }}
            ></div>
            <span className="text-xs text-gray-500 font-primary">{item.month}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-primary">Analytics & Reports</h1>
          <p className="text-gray-500 font-primary mt-1">Track performance and gain insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary">
            <AiOutlineDownload className="text-lg" />
            Export Report
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-primary">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-800 font-primary mt-1">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.isPositive ? (
                      <AiOutlineArrowUp className="text-green-500" />
                    ) : (
                      <AiOutlineArrowDown className="text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        metric.isPositive ? 'text-green-500' : 'text-red-500'
                      } font-primary`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <Icon className="text-2xl" style={{ color: metric.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary">Revenue Overview</h2>
          <div className="flex items-center gap-2">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary text-sm"
            >
              <option value="all">All Services</option>
              <option value="crm">CRM</option>
              <option value="erp">ERP</option>
              <option value="hr">HR Management</option>
              <option value="projects">Project Management</option>
            </select>
          </div>
        </div>
        <div className="h-64">
          <SimpleBarChart data={revenueData} height={200} />
        </div>
      </div>

      {/* Service Performance & User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Service Performance</h2>
          <div className="space-y-4">
            {servicePerformance.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
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
                        <span className="text-sm text-green-500 font-primary font-medium">
                          {service.growth}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="font-primary">{service.customers.toLocaleString()} customers</span>
                        <span className="font-primary">{service.revenue}</span>
                        <span className="font-primary">{service.satisfaction} satisfaction</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Top Features</h2>
          <div className="space-y-4">
            {topFeatures.map((feature, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 font-primary">{feature.name}</span>
                  <span className={`text-sm font-medium ${
                    feature.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  } font-primary`}>
                    {feature.trend}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${feature.usage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 font-primary mt-1">{feature.usage}% adoption</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 font-primary">Weekly User Activity</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-primary text-sm">
            <AiOutlineFilter className="text-lg" />
            Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Day
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Active Users
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  New Signups
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Churned
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 font-primary">
                  Net Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {userActivityData.map((day, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 font-primary">
                    {day.day}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 font-primary">
                    {day.active.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-green-600 font-medium font-primary">
                      +{day.new}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-red-600 font-medium font-primary">
                      -{day.churn}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold font-primary ${
                      day.new - day.churn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {day.new - day.churn >= 0 ? '+' : ''}{day.new - day.churn}
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

export default Analytics
