import React from 'react';
import { AiOutlineSearch, AiOutlineFilter, AiOutlineReload, AiOutlineSetting, AiOutlineExport, AiOutlineDownload } from 'react-icons/ai';

function SMFilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onFilterChange,
  onReset,
  actions,
  segmentOptions,
  onSegmentChange,
  onCustomizeFields,
  onExport,
  onImport,
}) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
      {/* Row 1: Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-0">
            <AiOutlineSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white shadow-sm transition-all duration-200 focus:shadow-md"
            />
          </div>
        )}

        {/* Filter Dropdowns */}
        {filters.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
              <AiOutlineFilter size={12} />
              <span className="font-medium">Filter</span>
            </div>
            {filters.map((filter, idx) => (
              <select
                key={idx}
                value={filter.value}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-300 cursor-pointer"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        {/* Segment / Grouping Dropdown */}
        {segmentOptions && onSegmentChange && (
          <select
            value={segmentOptions.currentValue || ''}
            onChange={(e) => onSegmentChange(e.target.value)}
            className="px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 hover:border-gray-300 cursor-pointer"
          >
            {segmentOptions.values.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Row 2: Action Buttons — wraps on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {onCustomizeFields && (
          <button
            onClick={onCustomizeFields}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200"
            title="Customize Fields"
          >
            <AiOutlineSetting size={13} />
            <span className="font-medium">Fields</span>
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200"
            title="Export"
          >
            <AiOutlineExport size={13} />
            <span className="font-medium">Export</span>
          </button>
        )}
        {onImport && (
          <button
            onClick={onImport}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200"
            title="Import"
          >
            <AiOutlineDownload size={13} />
            <span className="font-medium">Import</span>
          </button>
        )}

        {/* Reset */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200"
          >
            <AiOutlineReload size={13} />
            Reset
          </button>
        )}

        {/* Custom actions */}
        {actions}
      </div>
    </div>
  );
}

export default SMFilterBar;
