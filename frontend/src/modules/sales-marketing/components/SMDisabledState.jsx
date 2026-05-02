import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLock, AiOutlineTool, AiOutlineSetting, AiOutlineHome } from 'react-icons/ai';

/**
 * SMDisabledState - Reusable component for showing disabled/maintenance states
 * 
 * Can be used for:
 * - Full page disabled state
 * - Section disabled state
 * - Feature disabled state
 * - Tool/sub-feature disabled state
 * 
 * @param {object} props
 * @param {'section' | 'feature' | 'tool' | 'page'} [props.level='feature'] - Disabled level
 * @param {string} [props.title] - Custom title (auto-generated if not provided)
 * @param {string} [props.message] - Custom message (auto-generated if not provided)
 * @param {string} [props.name] - Name of the disabled section/feature/tool
 * @param {string} [props.settingsRoute='/dashboard/sales-marketing'] - Settings navigation route
 * @param {string} [props.backRoute='/dashboard'] - Back navigation route
 * @param {React.ReactNode} [props.icon] - Custom icon (defaults to lock)
 * @param {boolean} [props.showActions=true] - Show action buttons
 * @param {boolean} [props.compact=false] - Use compact inline layout
 */
function SMDisabledState({
  level = 'feature',
  title,
  message,
  name,
  settingsRoute = '/dashboard/sales-marketing',
  backRoute = '/dashboard',
  icon,
  showActions = true,
  compact = false,
}) {
  const navigate = useNavigate();

  // Auto-generate title and message based on level and name
  const defaults = {
    section: {
      icon: AiOutlineTool,
      title: name ? `"${name}" Module Disabled` : 'Module Disabled',
      message: name
        ? `The "${name}" module is currently disabled. Enable it to access all features.`
        : 'This module is currently disabled. Enable it from settings to access all features.',
      badge: 'Module Disabled',
    },
    feature: {
      icon: AiOutlineTool,
      title: name ? `"${name}" Under Maintenance` : 'Feature Under Maintenance',
      message: name
        ? `"${name}" is currently under maintenance. Check back later or contact your administrator.`
        : 'This feature is currently under maintenance. Check back later or contact your administrator.',
      badge: 'Under Maintenance',
    },
    tool: {
      icon: AiOutlineTool,
      title: name ? `"${name}" Unavailable` : 'Tool Unavailable',
      message: name
        ? `The "${name}" tool is not available at this time.`
        : 'This tool is not available at this time.',
      badge: 'Unavailable',
    },
    page: {
      icon: AiOutlineLock,
      title: 'This Feature is Disabled',
      message: 'This module is currently disabled. Enable it from the Sales & Marketing settings to access all features.',
      badge: 'Under Maintenance',
    },
  };

  const config = defaults[level] || defaults.feature;
  const Icon = icon || config.icon;

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const badgeText = config.badge;

  if (compact) {
    return (
      <div className="flex items-center justify-center py-12 px-6">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
            <Icon size={20} className="text-amber-500" />
          </div>
          <p className="text-xs font-semibold text-gray-600 mb-1">{displayTitle}</p>
          <p className="text-[10px] text-gray-400">{displayMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icon size={36} className="text-gray-400" />
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4 border border-amber-200">
            <AiOutlineTool size={14} />
            {badgeText}
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {displayTitle}
          </h2>
          
          {/* Message */}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {displayMessage}
          </p>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {/* Go to Settings Button */}
              <button
                onClick={() => navigate(settingsRoute)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium shadow-sm"
              >
                <AiOutlineSetting size={16} />
                Go to Settings
              </button>
              
              {/* Back Button */}
              <button
                onClick={() => navigate(backRoute)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium border border-gray-200"
              >
                <AiOutlineHome size={16} />
                Dashboard
              </button>
            </div>
          )}
        </div>
        
        {/* Helper Text */}
        <p className="text-xs text-gray-400 mt-6">
          Need access? Contact your system administrator to enable this feature.
        </p>
      </div>
    </div>
  );
}

export default SMDisabledState;
