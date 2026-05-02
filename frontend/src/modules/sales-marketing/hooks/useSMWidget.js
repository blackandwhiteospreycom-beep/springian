import { useCallback } from 'react';
import { useSM } from '../context/SMContext';

/**
 * useSMWidget - Hook for widget integration with Sales & Marketing toggle system
 * 
 * This hook allows dashboard widgets to:
 * - Check if their associated SM section/feature is enabled
 * - React to toggle changes in real-time
 * - Display appropriate disabled/enabled states
 * 
 * Usage:
 * const { isEnabled, isSectionEnabled, isFeatureEnabled, sectionId, featureId } = useSMWidget({
 *   sectionId: 'core-crm',
 *   featureId: 'contacts' // optional
 * });
 */
export function useSMWidget({ sectionId, featureId }) {
  const { isSectionEnabled: checkSection, isFeatureEnabled: checkFeature, state } = useSM();

  const sectionEnabled = checkSection(sectionId);
  const featureEnabled = featureId ? checkFeature(sectionId, featureId) : true;
  const isEnabled = sectionEnabled && featureEnabled;

  const getStatus = useCallback(() => {
    if (!sectionEnabled) {
      return {
        status: 'disabled',
        reason: 'section_disabled',
        message: 'This module is disabled',
      };
    }
    if (featureId && !featureEnabled) {
      return {
        status: 'maintenance',
        reason: 'feature_disabled',
        message: 'Under Maintenance',
      };
    }
    return {
      status: 'active',
      reason: null,
      message: 'Active',
    };
  }, [sectionEnabled, featureEnabled, featureId]);

  return {
    isEnabled,
    isSectionEnabled: sectionEnabled,
    isFeatureEnabled: featureEnabled,
    sectionId,
    featureId,
    status: getStatus(),
    // Raw state for advanced usage
    rawState: state,
  };
}

/**
 * useSMWidgetList - Hook for checking multiple widgets/sections at once
 * 
 * Usage:
 * const widgets = useSMWidgetList([
 *   { sectionId: 'core-crm', featureId: 'contacts', label: 'Contact Management' },
 *   { sectionId: 'lead-management', label: 'Lead Management' },
 * ]);
 */
export function useSMWidgetList(widgetConfigs) {
  const { isSectionEnabled, isFeatureEnabled } = useSM();

  return widgetConfigs.map((config) => {
    const { sectionId, featureId, label } = config;
    const sectionOn = isSectionEnabled(sectionId);
    const featureOn = featureId ? isFeatureEnabled(sectionId, featureId) : true;
    const enabled = sectionOn && featureOn;

    return {
      ...config,
      label,
      enabled,
      sectionEnabled: sectionOn,
      featureEnabled: featureOn,
      status: !sectionOn
        ? 'disabled'
        : featureId && !featureOn
        ? 'maintenance'
        : 'active',
    };
  });
}

export default useSMWidget;
