import { useState, useCallback, useEffect } from 'react';

const ACCOUNT_FIELDS_STORAGE_KEY = 'sm_account_fields';

// Load custom field groups from storage
export function loadAccountFieldGroups() {
  try {
    const raw = localStorage.getItem(ACCOUNT_FIELDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save custom field groups to storage
export function saveAccountFieldGroups(groups) {
  try {
    // Strip non-serializable properties before saving
    const clean = groups.map((g) => ({
      ...g,
      onLabelChange: undefined,
    }));
    localStorage.setItem(ACCOUNT_FIELDS_STORAGE_KEY, JSON.stringify(clean));
  } catch {}
}

// Hook for custom account field groups
export function useAccountFieldGroups(defaultGroups) {
  const [groups, setGroups] = useState(() => {
    const stored = loadAccountFieldGroups();
    if (stored) {
      // Restore onLabelChange callbacks
      return stored.map((g) => ({
        ...g,
        onLabelChange: (newLabel) => {
          setGroups((prev) =>
            prev.map((pg) => (pg.id === g.id ? { ...pg, label: newLabel } : pg))
          );
        },
      }));
    }
    return defaultGroups;
  });

  // Auto-persist
  useEffect(() => {
    saveAccountFieldGroups(groups);
  }, [groups]);

  return { groups, setGroups };
}
