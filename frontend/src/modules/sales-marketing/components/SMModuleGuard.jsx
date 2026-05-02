import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSM } from '../context/SMContext';
import { AiOutlineLock, AiOutlineTool, AiOutlineSetting, AiOutlineHome } from 'react-icons/ai';

/**
 * SMModuleGuard - Gate component for section and feature-level access control
 * 
 * @param {object} props
 * @param {string} [props.sectionId] - Section/module ID to check
 * @param {string} [props.featureId] - Feature ID to check (optional, requires sectionId)
 * @param {React.ReactNode} children - Content to render when enabled
 * @param {React.ReactNode} [props.fallback] - Custom fallback when disabled
 * @param {string} [props.backRoute] - Custom back navigation route
 * @param {string} [props.settingsRoute='/dashboard/sales-marketing'] - Settings page route
 */
function SMModuleGuard({ 
  sectionId, 
  serviceId, 
  featureId,
  children, 
  fallback,
  backRoute,
  settingsRoute = '/dashboard/sales-marketing'
}) {
  const navigate = useNavigate();
  const { isSectionEnabled, isFeatureEnabled } = useSM();
  
  // Support both `sectionId` (new) and `serviceId` (legacy)
  const id = sectionId || serviceId;
  const sectionOn = isSectionEnabled(id);
  
  // If featureId is provided, check both section and feature level
  const featureOn = featureId 
    ? isFeatureEnabled(id, featureId)
    : true;
  
  const enabled = sectionOn && featureOn;

  if (enabled) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  // Determine disabled reason
  const isSectionDisabled = !sectionOn;
  const isFeatureDisabled = featureId && !featureOn;
  
  let disabledTitle = 'This Feature is Disabled';
  let disabledMessage = "This module is currently disabled.";
  let badgeText = 'Under Maintenance';
  
  if (isSectionDisabled) {
    disabledTitle = 'Module Disabled';
    disabledMessage = `The "${id}" module is currently disabled. Enable it to access all features.`;
    badgeText = 'Module Disabled';
  } else if (isFeatureDisabled) {
    disabledTitle = 'Feature Under Maintenance';
    disabledMessage = `This feature is currently under maintenance. Check back later or contact your administrator.`;
    badgeText = 'Under Maintenance';
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <AiOutlineLock size={36} className="text-gray-400" />
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4 border border-amber-200">
            <AiOutlineTool size={14} />
            {badgeText}
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            {disabledTitle}
          </h2>
          
          {/* Message */}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {disabledMessage}
          </p>
          
          {/* Actions */}
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
              onClick={() => navigate(backRoute || '/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium border border-gray-200"
            >
              <AiOutlineHome size={16} />
              Dashboard
            </button>
          </div>
        </div>
        
        {/* Helper Text */}
        <p className="text-xs text-gray-400 mt-6">
          Need access? Contact your system administrator to enable this feature.
        </p>
      </div>
    </div>
  );
}

export default SMModuleGuard;
