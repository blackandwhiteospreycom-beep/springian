import React, { useState, useEffect } from 'react';
import { useDashboard, WIDGET_TYPES } from '../../context/DashboardContext';
import { 
  widgetRegistry, 
  chartTypes, 
  textSizes, 
  imageFitOptions, 
  trendOptions 
} from '../utils/widgetRegistry';
import { AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';

const linkIconOptions = [
  { id: 'link', label: 'Link' },
  { id: 'home', label: 'Home' },
  { id: 'settings', label: 'Settings' },
  { id: 'team', label: 'Team' },
  { id: 'chart', label: 'Chart' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'user', label: 'User' },
  { id: 'shop', label: 'Shop' },
  { id: 'mail', label: 'Mail' },
  { id: 'phone', label: 'Phone' },
  { id: 'globe', label: 'Globe' },
];

const SettingsPanel = () => {
  const { 
    selectedWidget, 
    showSettingsPanel, 
    closeSettings, 
    updateWidgetConfig,
    updateWidget,
  } = useDashboard();

  const [localConfig, setLocalConfig] = useState(null);

  useEffect(() => {
    if (selectedWidget) {
      setLocalConfig({ ...selectedWidget.config });
    }
  }, [selectedWidget]);

  if (!showSettingsPanel || !selectedWidget || !localConfig) return null;

  const handleSave = () => {
    updateWidgetConfig(selectedWidget.id, localConfig);
    closeSettings();
  };

  const handleCancel = () => {
    setLocalConfig({ ...selectedWidget.config });
    closeSettings();
  };

  const updateConfig = (key, value) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Widget Title
        </label>
        <input
          type="text"
          value={localConfig.title || ''}
          onChange={(e) => updateConfig('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          placeholder="Enter widget title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Width</label>
            <input
              type="number"
              value={selectedWidget.layout.w}
              onChange={(e) => {
                const newLayout = { ...selectedWidget.layout, w: parseInt(e.target.value) || 2 };
                updateWidget(selectedWidget.id, { layout: newLayout });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min={selectedWidget.layout.minW || 2}
              max={selectedWidget.layout.maxW || 12}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Height</label>
            <input
              type="number"
              value={selectedWidget.layout.h}
              onChange={(e) => {
                const newLayout = { ...selectedWidget.layout, h: parseInt(e.target.value) || 2 };
                updateWidget(selectedWidget.id, { layout: newLayout });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              min={selectedWidget.layout.minH || 2}
              max={selectedWidget.layout.maxH || 20}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatsCardSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value
        </label>
        <input
          type="number"
          value={localConfig.value || 0}
          onChange={(e) => updateConfig('value', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={localConfig.label || ''}
          onChange={(e) => updateConfig('label', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g., Total Users"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={localConfig.color || '#296374'}
            onChange={(e) => updateConfig('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localConfig.color || '#296374'}
            onChange={(e) => updateConfig('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          value={localConfig.icon || 'trend'}
          onChange={(e) => updateConfig('icon', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="trend">Trend</option>
          <option value="up">Up Arrow</option>
          <option value="down">Down Arrow</option>
        </select>
      </div>
    </div>
  );

  const renderChartSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chart Type
        </label>
        <select
          value={localConfig.chartType || 'bar'}
          onChange={(e) => updateConfig('chartType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {chartTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showLegend"
          checked={localConfig.showLegend !== false}
          onChange={(e) => updateConfig('showLegend', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="showLegend" className="text-sm text-gray-700">
          Show Legend
        </label>
      </div>
    </div>
  );

  const renderTableSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="searchable"
            checked={localConfig.searchable !== false}
            onChange={(e) => updateConfig('searchable', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="searchable" className="text-sm text-gray-700">
            Searchable
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sortable"
            checked={localConfig.sortable !== false}
            onChange={(e) => updateConfig('sortable', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sortable" className="text-sm text-gray-700">
            Sortable
          </label>
        </div>
      </div>
    </div>
  );

  const renderTextSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={localConfig.content || ''}
          onChange={(e) => updateConfig('content', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
          rows={6}
          placeholder="Enter your text content here..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Font Size
        </label>
        <select
          value={localConfig.fontSize || 'medium'}
          onChange={(e) => updateConfig('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {textSizes.map(size => (
            <option key={size.id} value={size.id}>{size.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderImageSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={localConfig.src || ''}
          onChange={(e) => updateConfig('src', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={localConfig.alt || ''}
          onChange={(e) => updateConfig('alt', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fit Mode
        </label>
        <select
          value={localConfig.fit || 'cover'}
          onChange={(e) => updateConfig('fit', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {imageFitOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderMetricSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prefix
          </label>
          <input
            type="text"
            value={localConfig.prefix || ''}
            onChange={(e) => updateConfig('prefix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="$"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Suffix
          </label>
          <input
            type="text"
            value={localConfig.suffix || ''}
            onChange={(e) => updateConfig('suffix', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="%"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Value
        </label>
        <input
          type="number"
          value={localConfig.value || 0}
          onChange={(e) => updateConfig('value', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trend
        </label>
        <select
          value={localConfig.trend || 'neutral'}
          onChange={(e) => updateConfig('trend', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {trendOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comparison %
        </label>
        <input
          type="number"
          value={localConfig.comparison || 0}
          onChange={(e) => updateConfig('comparison', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderLinkSettings = () => (
    <div className="space-y-4">
      {renderGeneralSettings()}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL / Route
        </label>
        <input
          type="text"
          value={localConfig.url || '#'}
          onChange={(e) => updateConfig('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="/admin or https://example.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use relative paths for internal routes (e.g., /admin) or full URLs for external links
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={localConfig.description || ''}
          onChange={(e) => updateConfig('description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Brief description of this link"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon
        </label>
        <select
          value={localConfig.icon || 'link'}
          onChange={(e) => updateConfig('icon', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {linkIconOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={localConfig.color || '#296374'}
            onChange={(e) => updateConfig('color', e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={localConfig.color || '#296374'}
            onChange={(e) => updateConfig('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="openInNewTab"
          checked={localConfig.openInNewTab || false}
          onChange={(e) => updateConfig('openInNewTab', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="openInNewTab" className="text-sm text-gray-700">
          Open in new tab
        </label>
      </div>
    </div>
  );

  const renderWidgetSpecificSettings = () => {
    switch (selectedWidget.type) {
      case WIDGET_TYPES.STATS_CARD:
        return renderStatsCardSettings();
      case WIDGET_TYPES.CHART:
        return renderChartSettings();
      case WIDGET_TYPES.TABLE:
        return renderTableSettings();
      case WIDGET_TYPES.TEXT:
        return renderTextSettings();
      case WIDGET_TYPES.IMAGE:
        return renderImageSettings();
      case WIDGET_TYPES.METRIC:
        return renderMetricSettings();
      case WIDGET_TYPES.LINK:
        return renderLinkSettings();
      default:
        return renderGeneralSettings();
    }
  };

  const widgetInfo = widgetRegistry[selectedWidget.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] flex flex-col mt-16 sm:mt-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Widget Settings</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {widgetInfo?.label || 'Unknown'} Widget
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <AiOutlineClose size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderWidgetSpecificSettings()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-opacity-90 rounded-lg transition-colors flex items-center gap-2"
          >
            <AiOutlineCheck size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
