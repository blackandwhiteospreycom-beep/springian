import { useState } from 'react'
import {
  AiOutlineSetting,
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineBell,
  AiOutlineCreditCard,
  AiOutlineApi,
  AiOutlineSave,
  AiOutlineCheck,
  AiOutlineGlobal,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineHome
} from 'react-icons/ai'

function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'general', label: 'General', icon: AiOutlineSetting },
    { id: 'profile', label: 'Profile', icon: AiOutlineUser },
    { id: 'security', label: 'Security', icon: AiOutlineLock },
    { id: 'notifications', label: 'Notifications', icon: AiOutlineBell },
    { id: 'billing', label: 'Billing', icon: AiOutlineCreditCard },
    { id: 'api', label: 'API', icon: AiOutlineApi },
  ]

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-primary">Settings</h1>
          <p className="text-gray-500 font-primary mt-1">Manage your account and preferences</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <AiOutlineCheck className="text-lg" />
            <span className="font-primary font-medium">Settings saved successfully!</span>
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-primary transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="text-lg" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">General Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                      Application Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Master App"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      defaultValue="admin@masterapp.com"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>CET (Central European Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">Maintenance Mode</p>
                    <p className="text-sm text-gray-500 font-primary">Disable access to the application</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 font-primary font-medium"
                >
                  <AiOutlineSave className="text-lg" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Profile Settings</h2>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  A
                </div>
                <div>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary text-sm">
                    Change Avatar
                  </button>
                  <p className="text-sm text-gray-500 font-primary mt-2">JPG, GIF or PNG. Max 1MB.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Admin"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      defaultValue="admin@masterapp.com"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <AiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      defaultValue="+1 234 567 8900"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary resize-none"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 font-primary font-medium"
                >
                  <AiOutlineSave className="text-lg" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter current password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 font-primary mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-gray-800 font-primary">Enable 2FA</p>
                      <p className="text-sm text-gray-500 font-primary">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AiOutlineGlobal className="text-xl text-primary" />
                        <div>
                          <p className="font-medium text-gray-800 font-primary">Chrome on Windows</p>
                          <p className="text-sm text-gray-500 font-primary">Last active: 2 minutes ago</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-primary">
                        Current
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AiOutlineGlobal className="text-xl text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800 font-primary">Safari on MacOS</p>
                          <p className="text-sm text-gray-500 font-primary">Last active: 2 days ago</p>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-primary text-sm">
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 font-primary font-medium"
                >
                  <AiOutlineSave className="text-lg" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">Email Notifications</p>
                    <p className="text-sm text-gray-500 font-primary">Receive email updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">New User Registration</p>
                    <p className="text-sm text-gray-500 font-primary">Get notified when new users sign up</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">Payment Alerts</p>
                    <p className="text-sm text-gray-500 font-primary">Receive payment and billing notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">System Updates</p>
                    <p className="text-sm text-gray-500 font-primary">Get notified about system maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium text-gray-800 font-primary">Security Alerts</p>
                    <p className="text-sm text-gray-500 font-primary">Critical security notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 font-primary font-medium"
                >
                  <AiOutlineSave className="text-lg" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">Billing & Subscription</h2>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-primary to-teal-500 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Current Plan</p>
                      <h3 className="text-2xl font-bold font-primary mt-1">Enterprise</h3>
                      <p className="text-sm opacity-80 mt-2">$499/month - All services included</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-primary rounded-lg font-primary font-medium hover:bg-gray-100">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Payment Method</h3>
                  <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">VISA</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 font-primary">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500 font-primary">Expires 12/2025</p>
                    </div>
                    <button className="text-primary hover:text-primary/80 font-primary text-sm">
                      Edit
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Mar 1, 2025', amount: '$499.00', status: 'Paid' },
                      { date: 'Feb 1, 2025', amount: '$499.00', status: 'Paid' },
                      { date: 'Jan 1, 2025', amount: '$499.00', status: 'Paid' },
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800 font-primary">{invoice.date}</p>
                          <p className="text-sm text-gray-500 font-primary">Enterprise Plan</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-primary">
                            {invoice.status}
                          </span>
                          <span className="font-semibold text-gray-800 font-primary">{invoice.amount}</span>
                          <button className="text-primary hover:text-primary/80 font-primary text-sm">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 font-primary mb-6">API Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">API Keys</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 font-primary">Production Key</span>
                      <button className="text-primary hover:text-primary/80 font-primary text-sm">
                        Regenerate
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 rounded border border-gray-200 text-sm font-mono text-gray-600">
                        {/* API key hidden */}
                      </code>
                      <button className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300">
                        <AiOutlineLock className="text-lg text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">API Usage</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-800 font-primary">24,589</p>
                      <p className="text-sm text-gray-500 font-primary mt-1">Requests Today</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-800 font-primary">750,234</p>
                      <p className="text-sm text-gray-500 font-primary mt-1">Requests This Month</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600 font-primary">99.9%</p>
                      <p className="text-sm text-gray-500 font-primary mt-1">Uptime</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-primary mb-4">Documentation</h3>
                  <p className="text-sm text-gray-500 font-primary mb-4">
                    Access our comprehensive API documentation to integrate with your applications.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary"
                  >
                    View API Docs
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
