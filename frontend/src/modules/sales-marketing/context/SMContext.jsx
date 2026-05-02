import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Create the context
export const SMContext = createContext();

// Hierarchical toggle state structure:
// {
//   masterEnabled: true,  // Master toggle for entire Sales & Marketing
//   sectionEnabled: { 'core-crm': true, 'lead-management': false, ... },
//   featureEnabled: { 'core-crm': { 'contacts': true, 'leads': false, ... }, ... }
// }

const STORAGE_KEY = 'sm_service_toggles_v2';

// Default: master and all sections/features enabled
const DEFAULT_MASTER_ENABLED = true;
const DEFAULT_SECTION_ENABLED = {};
const DEFAULT_FEATURE_ENABLED = {};

// ─── Toast Event Bus (for cross-component communication) ────────────

// Simple event bus for toast notifications
const toastListeners = [];

function publishToast(message, type = 'info', duration = 2500) {
  toastListeners.forEach((listener) => {
    try {
      listener({ message, type, duration, id: Date.now().toString() });
    } catch (e) {
      // Ignore listener errors
    }
  });
}

export function useSMToastListener(callback) {
  useEffect(() => {
    if (callback) {
      toastListeners.push(callback);
      return () => {
        const idx = toastListeners.indexOf(callback);
        if (idx > -1) toastListeners.splice(idx, 1);
      };
    }
  }, [callback]);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function SMProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = loadFromStorage();
    if (stored) return stored;
    return {
      masterEnabled: DEFAULT_MASTER_ENABLED,
      sectionEnabled: DEFAULT_SECTION_ENABLED,
      featureEnabled: DEFAULT_FEATURE_ENABLED,
    };
  });

  // Ref to track if we're in a toggle operation (for toast triggering)
  const toggleOperationRef = useRef(null);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Helper to show toast via event bus
  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    publishToast(message, type, duration);
  }, []);

  // ─── Master Toggle ──────────────────────────────────────────────────

  // Toggle master on/off (controls ALL sections)
  const toggleMaster = useCallback(() => {
    setState((prev) => {
      const newMaster = !prev.masterEnabled;

      showToast(
        `Sales & Marketing ${newMaster ? 'enabled' : 'disabled'}`,
        newMaster ? 'success' : 'warning'
      );

      if (!newMaster) {
        // If turning master OFF, disable ALL sections and features
        return {
          masterEnabled: false,
          sectionEnabled: {}, // All sections default to true, but master is false so they're locked
          featureEnabled: {},
        };
      }

      // If turning master ON, restore sections to default (all enabled)
      return {
        ...prev,
        masterEnabled: true,
        sectionEnabled: {},
      };
    });
  }, [showToast]);

  // Set master to a specific value
  const setMaster = useCallback((enabled) => {
    setState((prev) => {
      showToast(
        `Sales & Marketing ${enabled ? 'enabled' : 'disabled'}`,
        enabled ? 'success' : 'warning'
      );

      if (!enabled) {
        return {
          masterEnabled: false,
          sectionEnabled: {},
          featureEnabled: {},
        };
      }

      return {
        ...prev,
        masterEnabled: true,
        sectionEnabled: {},
      };
    });
  }, [showToast]);

  // Check if master is enabled
  const isMasterEnabled = useCallback(() => {
    return state.masterEnabled !== false;
  }, [state.masterEnabled]);

  // ─── Section Toggle ─────────────────────────────────────────────────

  // Toggle an entire section on/off
  const toggleSection = useCallback((sectionId) => {
    setState((prev) => {
      // Prevent section toggle when master is OFF
      if (!prev.masterEnabled) {
        showToast('Enable Sales & Marketing first', 'warning');
        return prev;
      }

      const currentlyEnabled = prev.sectionEnabled[sectionId] !== false; // default true
      const newSection = { ...prev.sectionEnabled, [sectionId]: !currentlyEnabled };
      const toggledOn = !currentlyEnabled;

      // Show toast
      showToast(`${sectionId} ${toggledOn ? 'enabled' : 'disabled'}`, toggledOn ? 'success' : 'warning');

      // If turning section off, also turn off all its features
      if (!currentlyEnabled) {
        const newFeature = { ...prev.featureEnabled };
        delete newFeature[sectionId];
        return { ...prev, sectionEnabled: newSection, featureEnabled: newFeature };
      }

      return { ...prev, sectionEnabled: newSection, featureEnabled: prev.featureEnabled };
    });
  }, [showToast]);

  // Toggle a specific feature within a section
  const toggleFeature = useCallback((sectionId, featureId) => {
    setState((prev) => {
      // Prevent feature toggle when master is OFF
      if (!prev.masterEnabled) {
        showToast('Enable Sales & Marketing first', 'warning');
        return prev;
      }

      const sectionFeatures = prev.featureEnabled[sectionId] || {};
      const currentlyEnabled = sectionFeatures[featureId] !== false; // default true
      const toggledOn = !currentlyEnabled;

      // Show toast
      showToast(`${featureId} ${toggledOn ? 'enabled' : 'disabled'}`, toggledOn ? 'success' : 'warning');

      return {
        ...prev,
        featureEnabled: {
          ...prev.featureEnabled,
          [sectionId]: {
            ...sectionFeatures,
            [featureId]: !currentlyEnabled,
          },
        },
      };
    });
  }, [showToast]);

  // Set a section to a specific value
  const setSection = useCallback((sectionId, enabled) => {
    setState((prev) => {
      // Prevent section change when master is OFF
      if (!prev.masterEnabled) {
        showToast('Enable Sales & Marketing first', 'warning');
        return prev;
      }

      const newSection = { ...prev.sectionEnabled, [sectionId]: enabled };

      // Show toast
      showToast(`${sectionId} ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'warning');

      if (!enabled) {
        const newFeature = { ...prev.featureEnabled };
        delete newFeature[sectionId];
        return { sectionEnabled: newSection, featureEnabled: newFeature };
      }
      return { sectionEnabled: newSection, featureEnabled: prev.featureEnabled };
    });
  }, [showToast]);

  // Set a feature to a specific value
  const setFeature = useCallback((sectionId, featureId, enabled) => {
    setState((prev) => {
      // Prevent feature change when master is OFF
      if (!prev.masterEnabled) {
        showToast('Enable Sales & Marketing first', 'warning');
        return prev;
      }

      return {
        ...prev,
        featureEnabled: {
          ...prev.featureEnabled,
          [sectionId]: {
            ...(prev.featureEnabled[sectionId] || {}),
            [featureId]: enabled,
          },
        },
      };
    });

    // Show toast
    showToast(`${featureId} ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'warning');
  }, [showToast]);

  // Check if a section is enabled (default: true, but requires master to be ON)
  const isSectionEnabled = useCallback((sectionId) => {
    // If master is OFF, all sections are locked
    if (!state.masterEnabled) return false;
    return state.sectionEnabled[sectionId] !== false;
  }, [state.masterEnabled, state.sectionEnabled]);

  // Check if a feature is enabled (default: true, but inherits from section and master)
  const isFeatureEnabled = useCallback((sectionId, featureId) => {
    // If master is OFF, all features are locked
    if (!state.masterEnabled) return false;
    // If section is off, feature is automatically off
    if (!isSectionEnabled(sectionId)) return false;
    const sectionFeatures = state.featureEnabled[sectionId] || {};
    return sectionFeatures[featureId] !== false;
  }, [state.masterEnabled, state.featureEnabled, isSectionEnabled]);

  // Get count of enabled sections
  const enabledSectionCount = useCallback(() => {
    // All sections are enabled by default unless explicitly disabled
    return Object.values(state.sectionEnabled).filter(Boolean).length;
  }, [state.sectionEnabled]);

  // Get count of enabled features in a section
  const enabledFeatureCount = useCallback((sectionId, totalFeatures) => {
    if (!isSectionEnabled(sectionId)) return 0;
    const sectionFeatures = state.featureEnabled[sectionId] || {};
    return Object.values(sectionFeatures).filter(Boolean).length;
  }, [state.featureEnabled, isSectionEnabled]);

  const value = {
    state,
    // Master toggle functions
    masterEnabled: state.masterEnabled,
    toggleMaster,
    setMaster,
    isMasterEnabled,
    // Section/feature functions
    toggles: state.sectionEnabled,       // backwards compat
    toggleService: toggleSection,         // backwards compat
    toggleSection,
    toggleFeature,
    setSection,
    setFeature,
    isEnabled: isSectionEnabled,          // backwards compat
    isSectionEnabled,
    isFeatureEnabled,
    enabledSectionCount,
    enabledFeatureCount,
    services: [],                         // backwards compat placeholder
  };

  return <SMContext.Provider value={value}>{children}</SMContext.Provider>;
}

export function useSM() {
  const ctx = useContext(SMContext);
  if (!ctx) throw new Error('useSM must be used within SMProvider');
  return ctx;
}
