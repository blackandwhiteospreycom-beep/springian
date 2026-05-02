import React from 'react';
import SMStatsCard from '../../components/shared/SMStatsCard';
import { FaBuilding, FaCheckCircle, FaUserTie, FaClock } from 'react-icons/fa';
import { useDataLayer } from '../data-layer/useDataLayer';

const AccountStats = () => {
  const { getCRMStats } = useDataLayer();

  const stats = [
    {
      label: 'Total Accounts',
      value: getCRMStats.totalAccounts,
      icon: <FaBuilding />,
      color: 'blue'
    },
    {
      label: 'Active Customers',
      value: getCRMStats.customerAccounts,
      icon: <FaCheckCircle />,
      color: 'green'
    },
    {
      label: 'Prospects',
      value: getCRMStats.prospectAccounts,
      icon: <FaUserTie />,
      color: 'purple'
    },
    {
      label: 'Active This Month',
      value: getCRMStats.activeAccounts,
      icon: <FaClock />,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <SMStatsCard
          key={idx}
          title={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default AccountStats;
