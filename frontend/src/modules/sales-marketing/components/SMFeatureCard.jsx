import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineRight, AiOutlineLock, AiOutlineTool } from 'react-icons/ai';
import { useSM } from '../context/SMContext';

// ─── Toggle Switch (small) ────────────────────────────────────────

function ToggleSwitchSmall({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 h-5 w-9 ${
        enabled ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform duration-200 h-3.5 w-3.5 ${
          enabled ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────

function FeatureStatusBadge({ enabled }) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <AiOutlineLock size={9} />
      Disabled
    </span>
  );
}

// ─── Feature Card Component ─────────────────────────────────────────

/**
 * SMFeatureCard - Reusable feature card with toggle and navigation
 * 
 * @param {object} props
 * @param {object} props.feature - { id, label, description?, route, icon? }
 * @param {string} props.sectionId - Parent section ID
 * @param {boolean} [props.customEnabled] - Optional override for enabled state
 * @param {function} [props.customOnToggle] - Optional override for toggle handler
 * @param {boolean} [props.compact=false] - Use compact layout mode
 * @param {boolean} [props.sectionEnabled] - Whether the parent section is enabled (locks toggle if false)
 */
function SMFeatureCard({ 
  feature, 
  sectionId, 
  customEnabled, 
  customOnToggle,
  compact = false,
  sectionEnabled: sectionEnabledProp,
}) {
  const navigate = useNavigate();
  const { isFeatureEnabled, toggleFeature, isSectionEnabled } = useSM();

  // Use custom values if provided, otherwise use context
  const sectionOn = sectionEnabledProp !== undefined ? sectionEnabledProp : isSectionEnabled(sectionId);
  const featureEnabled = customEnabled !== undefined 
    ? customEnabled 
    : isFeatureEnabled(sectionId, feature.id);
  
  const isClickable = featureEnabled && sectionOn;
  // Feature toggle is locked when section is disabled
  const isToggleLocked = !sectionOn;

  const handleToggle = (e) => {
    e.stopPropagation();
    // Prevent toggle if section is disabled
    if (isToggleLocked) return;
    
    if (customOnToggle) {
      customOnToggle();
    } else {
      toggleFeature(sectionId, feature.id);
    }
  };

  const handleClick = () => {
    if (isClickable && feature.route) {
      navigate(feature.route);
    }
  };

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${
        isClickable
          ? 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm cursor-pointer group'
          : 'bg-gray-50 border-gray-200 cursor-not-allowed'
      } ${!featureEnabled ? 'opacity-75' : ''}`}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Header: Icon + Name + Toggle (always accessible, no overlay) */}
      <div className={`flex items-center justify-between gap-2 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b ${
        featureEnabled ? 'border-gray-100' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {feature.icon && (
            <div className="flex-shrink-0 text-gray-400">
              {feature.icon}
            </div>
          )}
          <h4 className={`text-sm font-semibold truncate ${
            featureEnabled ? 'text-gray-800' : 'text-gray-400'
          }`}>
            {feature.label}
          </h4>
        </div>
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isToggleLocked ? (
            // Locked state - show lock icon instead of toggle
            <div className="w-9 h-5 flex items-center justify-center text-gray-400" title="Enable the module first">
              <AiOutlineLock size={14} />
            </div>
          ) : (
            <ToggleSwitchSmall enabled={featureEnabled} onToggle={handleToggle} />
          )}
        </div>
      </div>

      {/* Content Area: Description + Status + Overlay */}
      <div className="relative p-3 sm:p-4">
        {/* Description (optional) */}
        {feature.description && (
          <p className={`text-xs mb-2 line-clamp-2 ${
            featureEnabled ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {feature.description}
          </p>
        )}

        {/* Disabled Overlay - only covers content area, NOT the toggle */}
        {!featureEnabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-gray-100/50 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1.5 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 pointer-events-none">
              {!sectionOn ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                    <AiOutlineLock size={12} className="text-red-500" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Module Disabled</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                    <AiOutlineLock size={12} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Under Maintenance</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <FeatureStatusBadge enabled={featureEnabled} />

        {/* Arrow indicator (visible only when enabled & clickable) */}
        {isClickable && feature.route && (
          <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Open <AiOutlineRight size={11} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SMFeatureCard;
