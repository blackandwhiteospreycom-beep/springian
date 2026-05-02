import { useState, useCallback, useEffect, useRef } from 'react';

const CONTACTS_STORAGE_KEY = 'sm_contacts';
const FIELDS_STORAGE_KEY = 'sm_contact_fields';

// Load contacts from storage
export function loadContacts() {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save contacts to storage
export function saveContacts(contacts) {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch {}
}

// Load custom field groups from storage
export function loadFieldGroups() {
  try {
    const raw = localStorage.getItem(FIELDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Save custom field groups to storage
export function saveFieldGroups(groups) {
  try {
    // Strip non-serializable properties before saving
    const clean = groups.map((g) => ({
      ...g,
      onLabelChange: undefined,
    }));
    localStorage.setItem(FIELDS_STORAGE_KEY, JSON.stringify(clean));
  } catch {}
}

// Hook for contact CRUD
export function useContacts(initialData = []) {
  const [contacts, setContacts] = useState(() => {
    const stored = loadContacts();
    return stored.length > 0 ? stored : initialData;
  });
  const autoSaveTimer = useRef(null);

  // Auto-persist
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveContacts(contacts);
    }, 500);
    return () => clearTimeout(autoSaveTimer.current);
  }, [contacts]);

  const createContact = useCallback((data) => {
    const contact = {
      id: `contact-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts((prev) => [contact, ...prev]);
    return contact;
  }, []);

  const updateContact = useCallback((id, data) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const deleteContact = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const bulkDelete = useCallback((ids) => {
    setContacts((prev) => prev.filter((c) => !ids.includes(c.id)));
  }, []);

  const bulkUpdate = useCallback((ids, data) => {
    setContacts((prev) =>
      prev.map((c) =>
        ids.includes(c.id) ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  return { contacts, setContacts, createContact, updateContact, deleteContact, bulkDelete, bulkUpdate };
}

// Hook for custom field groups
export function useFieldGroups(defaultGroups) {
  const [groups, setGroups] = useState(() => {
    const stored = loadFieldGroups();
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
    saveFieldGroups(groups);
  }, [groups]);

  return { groups, setGroups };
}
