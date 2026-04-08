const STORAGE_KEY = 'dashboard_layout';
const NAV_STORAGE_KEY = 'dashboard_nav';
const TITLE_STORAGE_KEY = 'dashboard_title';

export const saveLayout = (layout) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    return true;
  } catch (error) {
    console.error('Failed to save layout:', error);
    return false;
  }
};

export const loadLayout = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load layout:', error);
    return null;
  }
};

export const saveNavItems = (navItems) => {
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(navItems));
    return true;
  } catch (error) {
    console.error('Failed to save nav items:', error);
    return false;
  }
};

export const loadNavItems = () => {
  try {
    const saved = localStorage.getItem(NAV_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load nav items:', error);
    return [];
  }
};

export const saveDashboardTitle = (title) => {
  try {
    localStorage.setItem(TITLE_STORAGE_KEY, title);
    return true;
  } catch (error) {
    console.error('Failed to save dashboard title:', error);
    return false;
  }
};

export const loadDashboardTitle = () => {
  try {
    return localStorage.getItem(TITLE_STORAGE_KEY) || 'My Dashboard';
  } catch (error) {
    console.error('Failed to load dashboard title:', error);
    return 'My Dashboard';
  }
};

export const clearAll = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NAV_STORAGE_KEY);
    localStorage.removeItem(TITLE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
};

export const exportLayout = (widgets, navItems, title) => {
  const exportData = {
    version: '1.0.0',
    title,
    widgets,
    navItems,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importLayout = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.widgets || !Array.isArray(data.widgets)) {
          reject(new Error('Invalid layout file: missing widgets array'));
          return;
        }
        resolve({
          widgets: data.widgets,
          navItems: data.navItems || [],
          title: data.title || 'Imported Dashboard',
        });
      } catch (error) {
        reject(new Error('Failed to parse layout file: ' + error.message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
