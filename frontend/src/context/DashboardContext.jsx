import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

const WIDGET_TYPES = {
  STATS_CARD: 'statsCard',
  CHART: 'chart',
  TABLE: 'table',
  TEXT: 'text',
  IMAGE: 'image',
  METRIC: 'metric',
  LINK: 'link',
};

const DEFAULT_WIDGET_CONFIG = {
  [WIDGET_TYPES.STATS_CARD]: {
    title: 'Stats Card',
    value: 0,
    label: 'Total',
    color: '#296374',
    icon: 'trend',
  },
  [WIDGET_TYPES.CHART]: {
    title: 'Chart Widget',
    chartType: 'bar',
    data: [],
    showLegend: true,
  },
  [WIDGET_TYPES.TABLE]: {
    title: 'Table Widget',
    columns: [],
    data: [],
    searchable: true,
    sortable: true,
  },
  [WIDGET_TYPES.TEXT]: {
    title: 'Text Widget',
    content: 'Edit this text...',
    fontSize: 'medium',
  },
  [WIDGET_TYPES.IMAGE]: {
    title: 'Image Widget',
    src: '',
    alt: 'Image',
    fit: 'cover',
  },
  [WIDGET_TYPES.METRIC]: {
    title: 'Metric',
    value: 0,
    suffix: '',
    prefix: '',
    trend: 'neutral',
    comparison: 0,
  },

  [WIDGET_TYPES.LINK]: {
    title: 'Navigation Link',
    url: '#',
    description: '',
    icon: 'link',
    color: '#296374',
    openInNewTab: false,
  },
  settingsSection: {
    title: 'Settings Section',
    section: 'general',
  },
  settingsToggle: {
    title: 'Setting Toggle',
    settingKey: 'email_notifications',
    label: 'Email Notifications',
    description: 'Receive email updates',
  },
  usersTable: {
    title: 'Users',
    limit: 5,
  },
  servicesTable: {
    title: 'Services',
    limit: 10,
  },
  analyticsStats: {
    title: 'Analytics Overview',
    metrics: ['total_revenue', 'active_users', 'new_signups', 'churn_rate'],
  },
  settingsProfile: {
    title: 'Profile Settings',
  },
  settingsSecurity: {
    title: 'Security Settings',
  },
  settingsNotifications: {
    title: 'Notifications',
  },
  settingsBilling: {
    title: 'Billing',
  },
  serviceQuickStats: {
    title: 'Service Overview',
  },
  userStats: {
    title: 'User Stats',
  },
};

const GRID_CONFIG = {
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 80,
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
};

export const DashboardProvider = ({ children }) => {
  const [pageLayouts, setPageLayouts] = useState({});
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [navItems, setNavItems] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('My Dashboard');

  // Computed: widgets for current page
  const widgets = pageLayouts[currentPage] || [];

  // Load from localStorage on mount
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard_page_layouts');
    const savedNavItems = localStorage.getItem('dashboard_nav');
    const savedTitle = localStorage.getItem('dashboard_title');

    if (savedLayouts) {
      try {
        setPageLayouts(JSON.parse(savedLayouts));
      } catch (e) {
        console.error('Failed to parse saved layouts:', e);
      }
    }

    if (savedNavItems) {
      try {
        setNavItems(JSON.parse(savedNavItems));
      } catch (e) {
        console.error('Failed to parse saved nav items:', e);
      }
    }

    if (savedTitle) {
      setDashboardTitle(savedTitle);
    }
  }, []);

  // Save all page layouts to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_page_layouts', JSON.stringify(pageLayouts));
  }, [pageLayouts]);

  // Save nav items to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard_nav', JSON.stringify(navItems));
  }, [navItems]);

  // Save dashboard title
  useEffect(() => {
    localStorage.setItem('dashboard_title', dashboardTitle);
  }, [dashboardTitle]);

  // Set current page (called from DashboardBuilder based on route)
  const setPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const setWidgetsForPage = useCallback((page, newWidgets) => {
    setPageLayouts(prev => ({ ...prev, [page]: newWidgets }));
  }, []);

  const addWidget = useCallback((type, position = null, configOverrides = null) => {
    const newWidget = {
      id: uuidv4(),
      type,
      config: { ...DEFAULT_WIDGET_CONFIG[type], ...configOverrides },
      layout: position || {
        i: `widget-${Date.now()}`,
        x: 0,
        y: Infinity,
        w: 4,
        h: 4,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    };

    setPageLayouts(prev => {
      const currentWidgets = prev[currentPage] || [];
      return { ...prev, [currentPage]: [...currentWidgets, newWidget] };
    });
    return newWidget;
  }, [currentPage]);

  const updateWidget = useCallback((id, updates) => {
    setPageLayouts(prev => {
      const currentWidgets = prev[currentPage] || [];
      return {
        ...prev,
        [currentPage]: currentWidgets.map(widget =>
          widget.id === id ? { ...widget, ...updates } : widget
        ),
      };
    });
  }, [currentPage]);

  const updateWidgetConfig = useCallback((id, configUpdates) => {
    setPageLayouts(prev => {
      const currentWidgets = prev[currentPage] || [];
      return {
        ...prev,
        [currentPage]: currentWidgets.map(widget =>
          widget.id === id
            ? { ...widget, config: { ...widget.config, ...configUpdates } }
            : widget
        ),
      };
    });
  }, [currentPage]);

  const removeWidget = useCallback((id) => {
    setPageLayouts(prev => {
      const currentWidgets = prev[currentPage] || [];
      return { ...prev, [currentPage]: currentWidgets.filter(widget => widget.id !== id) };
    });
    if (selectedWidget?.id === id) {
      setSelectedWidget(null);
      setShowSettingsPanel(false);
    }
  }, [currentPage, selectedWidget]);

  const updateWidgetLayout = useCallback((layoutUpdates) => {
    setPageLayouts(prev => {
      const currentWidgets = prev[currentPage] || [];
      return {
        ...prev,
        [currentPage]: currentWidgets.map(widget => {
          const updatedLayout = layoutUpdates.find(l => l.i === widget.layout.i);
          return updatedLayout ? { ...widget, layout: updatedLayout } : widget;
        }),
      };
    });
  }, [currentPage]);

  const addNavItem = useCallback((item) => {
    const newItem = {
      id: uuidv4(),
      label: item.label || 'New Link',
      url: item.url || '#',
      icon: item.icon || 'link',
      order: navItems.length,
      ...item,
    };
    setNavItems(prev => [...prev, newItem]);
    return newItem;
  }, [navItems.length]);

  const updateNavItem = useCallback((id, updates) => {
    setNavItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const removeNavItem = useCallback((id) => {
    setNavItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const reorderNavItems = useCallback((reorderedItems) => {
    setNavItems(reorderedItems.map((item, index) => ({ ...item, order: index })));
  }, []);

  const openSettings = useCallback((widget) => {
    setSelectedWidget(widget);
    setShowSettingsPanel(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSelectedWidget(null);
    setShowSettingsPanel(false);
  }, []);

  const resetDashboard = useCallback(() => {
    setPageLayouts({});
    setNavItems([]);
    setDashboardTitle('My Dashboard');
    localStorage.removeItem('dashboard_page_layouts');
    localStorage.removeItem('dashboard_nav');
    localStorage.removeItem('dashboard_title');
  }, []);

  const exportLayout = useCallback(() => {
    const exportData = {
      title: dashboardTitle,
      pageLayouts,
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
  }, [dashboardTitle, pageLayouts, navItems]);

  const importLayout = useCallback((importedData) => {
    if (importedData.pageLayouts) setPageLayouts(importedData.pageLayouts);
    else if (importedData.widgets) setPageLayouts({ dashboard: importedData.widgets });
    if (importedData.navItems) setNavItems(importedData.navItems);
    if (importedData.title) setDashboardTitle(importedData.title);
  }, []);

  const value = {
    widgets,
    pageLayouts,
    currentPage,
    setPage,
    setWidgetsForPage,
    navItems,
    isEditMode,
    selectedWidget,
    showSettingsPanel,
    dashboardTitle,
    gridConfig: GRID_CONFIG,
    widgetTypes: WIDGET_TYPES,
    setIsEditMode,
    setSelectedWidget,
    setShowSettingsPanel,
    setDashboardTitle,
    addWidget,
    updateWidget,
    updateWidgetConfig,
    removeWidget,
    updateWidgetLayout,
    addNavItem,
    updateNavItem,
    removeNavItem,
    reorderNavItems,
    openSettings,
    closeSettings,
    resetDashboard,
    exportLayout,
    importLayout,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export { WIDGET_TYPES, GRID_CONFIG, DEFAULT_WIDGET_CONFIG };
