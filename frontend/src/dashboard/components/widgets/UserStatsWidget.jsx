import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../../api';
import { AiOutlineUser, AiOutlineCheck, AiOutlineStop } from 'react-icons/ai';

const UserStatsWidget = ({ config }) => {
  const { title = 'User Stats' } = config;
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    usersAPI.getAll()
      .then(res => {
        if (mounted) {
          const users = res.data || [];
          setStats({
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            inactive: users.filter(u => u.status !== 'active').length,
          });
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="user-stats-widget h-full">
      <h3 className="font-bold text-gray-800 font-primary text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <AiOutlineUser size={16} className="text-primary" />
          </div>
          <p className="text-lg font-bold text-gray-800 font-primary">{stats.total}</p>
          <p className="text-[10px] text-gray-400 font-primary">Total</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <AiOutlineCheck size={14} className="text-green-500" />
          </div>
          <p className="text-lg font-bold text-green-600 font-primary">{stats.active}</p>
          <p className="text-[10px] text-green-400 font-primary">Active</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <AiOutlineStop size={14} className="text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-600 font-primary">{stats.inactive}</p>
          <p className="text-[10px] text-gray-400 font-primary">Inactive</p>
        </div>
      </div>
    </div>
  );
};

export default UserStatsWidget;
