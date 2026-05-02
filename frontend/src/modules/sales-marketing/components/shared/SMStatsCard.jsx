import React from 'react';

function SMStatsCard({ title, value, change, changeType = 'positive', icon, color = '#296374', onClick }) {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-400',
  };

  const changeBg = {
    positive: 'bg-green-50',
    negative: 'bg-red-50',
    neutral: 'bg-gray-50',
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
      }`}
      style={gradientStyle}
    >
      <div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
        style={{ backgroundColor: color }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-1.5">{value}</p>
          {change !== undefined && (
            <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${changeBg[changeType]} ${changeColors[changeType]}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
            </span>
          )}
        </div>
        {icon && (
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: color + '25' }}
          >
            {React.cloneElement(icon, { size: 18 })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SMStatsCard;
