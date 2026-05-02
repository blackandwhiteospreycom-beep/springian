import React, { useState, useEffect } from 'react';
import { servicesAPI } from '../../../api';
import { AiOutlineAppstore, AiOutlineDollar, AiOutlineTeam, AiOutlineRise } from 'react-icons/ai';

const ServiceQuickStatsWidget = ({ config }) => {
  const { title = 'Service Overview' } = config;
  const [stats, setStats] = useState({ total: 0, totalCustomers: 0, totalRevenue: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    servicesAPI.getAll()
      .then(res => {
        if (mounted) {
          const services = res.data || [];
          const totalCustomers = services.reduce((sum, s) => sum + (s.customers || 0), 0);
          const revenueValues = services.map(s => {
            const match = String(s.revenue || '0').match(/[\d,]+/);
            return match ? parseInt(match[0].replace(/,/g, ''), 10) : 0;
          });
          const totalRevenue = revenueValues.reduce((a, b) => a + b, 0);
          setStats({
            total: services.length,
            totalCustomers,
            totalRevenue,
            active: services.filter(s => s.status === 'active').length,
          });
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="service-quick-stats-widget h-full">
      <h3 className="font-bold text-gray-800 font-primary text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AiOutlineAppstore size={14} className="text-primary" />
            <span className="text-[10px] text-primary font-primary uppercase tracking-wider">Services</span>
          </div>
          <p className="text-lg font-bold text-gray-800 font-primary">{stats.total}</p>
          <p className="text-[10px] text-green-500 font-primary">{stats.active} active</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AiOutlineDollar size={14} className="text-green-600" />
            <span className="text-[10px] text-green-500 font-primary uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-lg font-bold text-gray-800 font-primary">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AiOutlineTeam size={14} className="text-purple-600" />
            <span className="text-[10px] text-purple-500 font-primary uppercase tracking-wider">Customers</span>
          </div>
          <p className="text-lg font-bold text-gray-800 font-primary">{stats.totalCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AiOutlineRise size={14} className="text-yellow-600" />
            <span className="text-[10px] text-yellow-500 font-primary uppercase tracking-wider">Avg/Service</span>
          </div>
          <p className="text-lg font-bold text-gray-800 font-primary">${stats.total > 0 ? Math.round(stats.totalRevenue / stats.total).toLocaleString() : 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceQuickStatsWidget;
