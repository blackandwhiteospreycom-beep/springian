import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../../api';
import { AiOutlineBarChart, AiOutlineDollar, AiOutlineUser, AiOutlineRise } from 'react-icons/ai';

const iconMap = {
  dollar: <AiOutlineDollar size={20} />,
  user: <AiOutlineUser size={20} />,
  rise: <AiOutlineRise size={20} />,
  chart: <AiOutlineBarChart size={20} />,
};

const AnalyticsStatsWidget = ({ config }) => {
  const { title = 'Analytics Overview', metrics = ['total_revenue', 'active_users', 'new_signups', 'churn_rate'] } = config;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    analyticsAPI.getMetrics()
      .then(res => {
        if (mounted) {
          const items = (res.data || []).filter(m => metrics.includes(m.metric_key));
          setData(items);
          setLoading(false);
        }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [metrics]);

  const metricIcons = {
    total_revenue: 'dollar',
    active_users: 'user',
    new_signups: 'rise',
    churn_rate: 'chart',
  };

  const metricColors = {
    total_revenue: '#16A34A',
    active_users: '#296374',
    new_signups: '#00AEEF',
    churn_rate: '#DC2626',
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading analytics...</div>;
  }

  return (
    <div className="analytics-stats-widget h-full">
      <h3 className="font-bold text-gray-800 font-primary text-sm mb-3">{title}</h3>
      {data.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs font-primary">No analytics data available</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {data.map(m => (
            <div key={m.metric_key} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-500 font-primary uppercase tracking-wider">{m.metric_key.replace(/_/g, ' ')}</span>
                <div style={{ color: metricColors[m.metric_key] || '#296374' }}>
                  {iconMap[metricIcons[m.metric_key]] || iconMap.chart}
                </div>
              </div>
              <p className="text-lg font-bold text-gray-800 font-primary">{m.metric_value}</p>
              {m.metric_change && (
                <p className={`text-[10px] font-primary mt-0.5 ${m.is_positive ? 'text-green-500' : 'text-red-500'}`}>
                  {m.metric_change}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsStatsWidget;
