import React from 'react';
import { AiOutlineRise, AiOutlineFall, AiOutlineArrowsAlt } from 'react-icons/ai';

const StatsCardWidget = ({ config }) => {
  const { value, label, color = '#296374', icon = 'trend' } = config;

  const getIcon = () => {
    switch (icon) {
      case 'up': return <AiOutlineRise size={24} />;
      case 'down': return <AiOutlineFall size={24} />;
      default: return <AiOutlineArrowsAlt size={24} />;
    }
  };

  return (
    <div className="stats-card h-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {getIcon()}
        </div>
      </div>
      
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-xs sm:text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
};

export default StatsCardWidget;
