import React, { useMemo } from 'react';

const ChartWidget = ({ config }) => {
  const { chartType = 'bar', data = [], showLegend = true } = config;

  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    // Default mock data
    return [
      { label: 'Jan', value: 65 },
      { label: 'Feb', value: 59 },
      { label: 'Mar', value: 80 },
      { label: 'Apr', value: 81 },
      { label: 'May', value: 56 },
      { label: 'Jun', value: 95 },
    ];
  }, [data]);

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  const renderBarChart = () => (
    <div className="flex items-end justify-around h-full gap-1 sm:gap-2 px-1 sm:px-2">
      {chartData.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
          <div className="text-[10px] sm:text-xs text-gray-600 mb-1">{item.value}</div>
          <div
            className="w-full bg-primary rounded-t transition-all hover:bg-opacity-80 min-h-[4px]"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <div className="text-[10px] sm:text-xs text-gray-600 mt-1 truncate w-full text-center">{item.label}</div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    const points = chartData.map((item, index) => ({
      x: (index / (chartData.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 100,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="h-full flex flex-col justify-between py-4">
        <svg viewBox="0 0 100 100" className="w-full flex-1" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#296374"
            strokeWidth="2"
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="#296374" />
          ))}
        </svg>
        <div className="flex justify-around mt-2">
          {chartData.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 truncate">{item.label}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const slices = chartData.map((item, index) => {
      const percent = (item.value / total) * 100;
      const startAngle = (cumulativePercent / 100) * 2 * Math.PI;
      cumulativePercent += percent;
      const endAngle = (cumulativePercent / 100) * 2 * Math.PI;
      
      const x1 = 50 + 40 * Math.cos(startAngle);
      const y1 = 50 + 40 * Math.sin(startAngle);
      const x2 = 50 + 40 * Math.cos(endAngle);
      const y2 = 50 + 40 * Math.sin(endAngle);
      
      const largeArcFlag = percent > 50 ? 1 : 0;
      
      const colors = ['#296374', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      
      return {
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length],
        label: item.label,
        percent: percent.toFixed(1),
      };
    });

    return (
      <div className="h-full flex gap-4">
        <svg viewBox="0 0 100 100" className="flex-1">
          {slices.map((slice, i) => (
            <path key={i} d={slice.path} fill={slice.color} className="hover:opacity-80" />
          ))}
        </svg>
        {showLegend && (
          <div className="flex flex-col gap-1 justify-center">
            {slices.map((slice, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: slice.color }} />
                <span>{slice.label} ({slice.percent}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAreaChart = () => {
    const points = chartData.map((item, index) => ({
      x: (index / (chartData.length - 1)) * 100,
      y: 100 - (item.value / maxValue) * 100,
    }));

    const areaD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fullAreaD = `${areaD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

    return (
      <div className="h-full flex flex-col justify-between py-4">
        <svg viewBox="0 0 100 100" className="w-full flex-1" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#296374" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#296374" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d={fullAreaD} fill="url(#areaGradient)" />
          <polyline
            fill="none"
            stroke="#296374"
            strokeWidth="2"
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
          />
        </svg>
        <div className="flex justify-around mt-2">
          {chartData.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 truncate">{item.label}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-widget h-full">
      {chartType === 'bar' && renderBarChart()}
      {chartType === 'line' && renderLineChart()}
      {chartType === 'pie' && renderPieChart()}
      {chartType === 'area' && renderAreaChart()}
    </div>
  );
};

export default ChartWidget;
