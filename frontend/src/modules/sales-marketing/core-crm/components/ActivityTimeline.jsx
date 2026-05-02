import React from 'react';
import { FaPhone, FaEnvelope, FaStickyNote, FaUser, FaBuilding } from 'react-icons/fa';

const iconMap = {
  call: <FaPhone className="text-blue-500" />,
  email: <FaEnvelope className="text-green-500" />,
  note: <FaStickyNote className="text-yellow-500" />,
};

const ActivityTimeline = ({ activities, showEntity = false }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities found.
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 ml-[-1px]"></div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="relative flex items-start group">
            {/* Icon Circle */}
            <div className="absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 shadow-sm group-hover:border-blue-200 transition-colors">
              {iconMap[activity.type] || <FaStickyNote className="text-gray-400" />}
            </div>

            <div className="ml-12 flex-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-gray-800 capitalize">
                  {activity.type} logged
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(activity.created_at).toLocaleString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FaUser size={10} /> {activity.performer}
                </span>
                {showEntity && activity.account_id && (
                  <span className="flex items-center gap-1">
                    <FaBuilding size={10} /> Linked to Account
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
