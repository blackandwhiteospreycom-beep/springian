import React from 'react';
import { AiOutlinePhone, AiOutlineMail, AiOutlineEdit, AiOutlineClockCircle, AiOutlineContacts, AiOutlineUser, AiOutlineTeam, AiOutlineSetting } from 'react-icons/ai';

function RightSidePanel({ stats, recentActivity = [], onCustomizeFields }) {
  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          {onCustomizeFields && (
            <button
              onClick={onCustomizeFields}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <AiOutlineSetting size={16} className="text-primary" />
              </div>
              <span className="font-medium">Customize Fields</span>
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <AiOutlinePhone size={16} className="text-green-600" />
            </div>
            <span className="font-medium">Log a Call</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <AiOutlineMail size={16} className="text-blue-600" />
            </div>
            <span className="font-medium">Send Email</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <AiOutlineEdit size={16} className="text-purple-600" />
            </div>
            <span className="font-medium">Add Note</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            Summary
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AiOutlineContacts size={14} className="text-gray-400" />
                Total Contacts
              </div>
              <span className="text-sm font-semibold text-gray-800">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AiOutlineUser size={14} className="text-green-500" />
                Active
              </div>
              <span className="text-sm font-semibold text-green-600">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AiOutlineUser size={14} className="text-blue-500" />
                Leads
              </div>
              <span className="text-sm font-semibold text-blue-600">{stats.leads}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AiOutlineTeam size={14} className="text-amber-500" />
                Customers
              </div>
              <span className="text-sm font-semibold text-amber-600">{stats.customers}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 4).map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{activity.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 py-2">
            <AiOutlineClockCircle size={14} />
            <span className="text-xs">No recent activity</span>
          </div>
        )}
      </div>

      {/* Insights Placeholder */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 p-5">
        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
          💡 AI Insights
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          AI-powered insights and suggestions will appear here based on your contact data.
        </p>
      </div>
    </div>
  );
}

export default RightSidePanel;
