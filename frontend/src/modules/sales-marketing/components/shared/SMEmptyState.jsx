import React from 'react';
import { AiOutlineAppstore } from 'react-icons/ai';

function SMEmptyState({
  title = 'No data yet',
  description = 'Get started by adding your first item',
  icon,
  actionLabel,
  onAction,
  color = '#296374',
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: color + '15' }}
      >
        {icon || <AiOutlineAppstore size={28} style={{ color }} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-5 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default SMEmptyState;
