import React from 'react';
import { SMStatsCard } from '../../components/shared';
import { AiOutlineUser, AiOutlineUserAdd, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const LeadMetrics = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SMStatsCard 
        title="Total Leads" 
        value={stats.total} 
        icon={<AiOutlineUser />} 
        color="#296374"
        change="+12.5%"
        changeType="positive"
      />
      <SMStatsCard 
        title="Open Opportunities" 
        value={stats.open} 
        icon={<AiOutlineUserAdd />} 
        color="#3b82f6"
        change="+5.2%"
        changeType="positive"
      />
      <SMStatsCard 
        title="Conversion Rate" 
        value={`${stats.conversionRate}%`} 
        icon={<AiOutlineCheckCircle />} 
        color="#10b981"
        change="-1.4%"
        changeType="negative"
      />
      <SMStatsCard 
        title="Lost Leads" 
        value={stats.lost} 
        icon={<AiOutlineCloseCircle />} 
        color="#ef4444"
        change="+0.5%"
        changeType="neutral"
      />
    </div>
  );
};

export default LeadMetrics;
