import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api'
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
  const [metrics, setMetrics] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [servicePerformance, setServicePerformance] = useState([])
  const [userActivityData, setUserActivityData] = useState([])
  const [topFeatures, setTopFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [metricsRes, revenueRes, servicePerfRes, activityRes, featuresRes] = await Promise.all([
        analyticsAPI.getMetrics(),
        analyticsAPI.getRevenue(),
        analyticsAPI.getServicePerformance(),
        analyticsAPI.getUserActivity(),
        analyticsAPI.getTopFeatures(),
      ])
      setMetrics(metricsRes.data)
      setRevenueData(revenueRes.data)
      setServicePerformance(servicePerfRes.data)
      setUserActivityData(activityRes.data)
      setTopFeatures(featuresRes.data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const metricIcons = {
    total_revenue: AiOutlineBarChart,
    active_users: AiOutlineLineChart,
    new_signups: AiOutlinePieChart,
    churn_rate: AiOutlineLineChart,
  }

  const metricColors = {
    total_revenue: '#296374',
    active_users: '#714B67',
    new_signups: '#25A8E1',
    churn_rate: '#00AEEF',
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data, height = 200 }) => {
    if (!data.length) return <div className="text-center text-gray-400 py-8">No data</div>
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
        {loading ? (
          <div className="col-span-4 text-center py-12 text-gray-500 font-primary">Loading analytics...</div>
        ) : metrics.length === 0 ? (
          <div className="col-span-4 text-center py-12 text-gray-500 font-primary">No analytics data available.</div>
        ) : (
          metrics.map((metric, index) => {
            const Icon = metricIcons[metric.metric_key] || AiOutlineBarChart
            const color = metricColors[metric.metric_key] || '#296374'
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-primary">{metric.metric_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-2xl font-bold text-gray-800 font-primary mt-1">
                      {metric.metric_value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.is_positive ? (
                        <AiOutlineArrowUp className="text-green-500" />
                      ) : (
                        <AiOutlineArrowDown className="text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          metric.is_positive ? 'text-green-500' : 'text-red-500'
                        } font-primary`}
                      >
                        {metric.metric_change}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <Icon className="text-2xl" style={{ color }} />
                  </div>
                </div>
              </div>
            )
          })
        )}
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
              const Icon = service.name === 'CRM' ? AiOutlineAppstore :
                           service.name === 'ERP' ? AiOutlineBarChart :
                           service.name === 'HR Management' ? AiOutlineAppstore : AiOutlineAppstore
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
                        <span className="font-primary">{service.customers?.toLocaleString()} customers</span>
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
                    {day.active_users?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-green-600 font-medium font-primary">
                      +{day.new_signups}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-red-600 font-medium font-primary">
                      -{day.churned}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold font-primary ${
                      day.new_signups - day.churned >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {day.new_signups - day.churned >= 0 ? '+' : ''}{day.new_signups - day.churned}
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
