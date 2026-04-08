import React from 'react';
import { AiOutlineRise, AiOutlineFall, AiOutlineArrowsAlt } from 'react-icons/ai';

const MetricWidget = ({ config }) => {
  const { value = 0, suffix = '', prefix = '', trend = 'neutral', comparison = 0 } = config;

  const TrendIcon = () => {
    switch (trend) {
      case 'up':
        return <AiOutlineRise className="text-green-500" size={16} />;
      case 'down':
        return <AiOutlineFall className="text-red-500" size={16} />;
      default:
        return <AiOutlineArrowsAlt className="text-gray-500" size={16} />;
    }
  };

  const trendColor = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  }[trend];

  return (
    <div className="metric-widget h-full flex flex-col justify-center">
      <div className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      
      {comparison !== 0 && (
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <TrendIcon />
          <span className={trendColor}>
            {comparison > 0 ? '+' : ''}{comparison}%
          </span>
          <span className="text-gray-500 hidden sm:inline">vs previous period</span>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;
