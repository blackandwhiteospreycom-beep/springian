import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Responsive } from 'react-grid-layout';
import { useDrop, useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard, WIDGET_TYPES } from '../../context/DashboardContext';
import { useAuth } from '../../context/AuthContext';
import WidgetFactory from '../components/WidgetFactory';
import SettingsPanel from '../components/SettingsPanel';
import { widgetRegistry, widgetCategories } from '../utils/widgetRegistry';
import WidgetManagement from '../pages/WidgetManagement';
import SalesMarketingPage from '../pages/SalesMarketingPage';
import {
  AiOutlinePlus,
  AiOutlineSave,
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlineUpload,
  AiOutlineEdit,
  AiOutlineAppstore,
  AiOutlineLayout,
  AiOutlineSetting,
  AiOutlineTeam,
  AiOutlineBarChart,
  AiOutlineHome,
  AiOutlineLogout,
} from 'react-icons/ai';

const NAV_ITEM_TYPE = 'NAV_ITEM';
const EXISTING_ROUTE_TYPE = 'EXISTING_ROUTE';
const SERVICE_TYPE = 'SERVICE_WIDGET';

// Draggable Nav Item Card (for side panel)
const DraggableNavItemCard = ({ navItem }) => {
  const [{ isDragging }, drag] = useDrag({
    type: NAV_ITEM_TYPE,
    item: { type: NAV_ITEM_TYPE, item: navItem },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const IconComp = navItem.icon || AiOutlineAppstore;

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 sm:gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <IconComp className="text-primary text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{navItem.label}</div>
        <div className="text-xs text-gray-500 truncate">{navItem.url}</div>
      </div>
      <div className="hidden sm:block text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
        Drag to add
      </div>
    </div>
  );
};

// Draggable Service Card
const ServiceCard = ({ service, onAdd }) => {
  const { widgets } = useDashboard();
  const [added, setAdded] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: SERVICE_TYPE,
    item: { type: SERVICE_TYPE, service },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleAdd = () => {
    const existing = widgets.find(
      (w) => w.type === WIDGET_TYPES.LINK && w.config.title === service.label
    );
    if (existing) return;

    onAdd('link', {
      i: `widget-${service.id}-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: 3,
      h: 3,
      minW: 2,
      minH: 2,
      maxW: 6,
      maxH: 6,
    }, {
      title: service.label,
      url: `/dashboard/${service.id}`,
      description: `${service.label} module`,
      icon: 'link',
      color: service.color,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 sm:gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: service.color }}>
        <AiOutlineAppstore className="text-white text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{service.label}</div>
        <div className="text-xs text-gray-500">{service.users} users</div>
      </div>
      <button
        onClick={handleAdd}
        disabled={added}
        className={`sm:hidden flex-shrink-0 px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
          added
            ? 'bg-green-100 text-green-700'
            : 'bg-primary text-white'
        }`}
      >
        {added ? '✓ Added' : '+ Add'}
      </button>
      <div className="hidden sm:block text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
        Drag to add
      </div>
    </div>
  );
};

const ResponsiveGridLayout = Responsive;

// Draggable Widget Card (for side panel)
const DraggableWidgetCard = ({ widgetInfo, onAdd }) => {
  const { widgets } = useDashboard();
  const [{ isDragging }, drag] = useDrag({
    type: SERVICE_TYPE,
    item: { type: 'WIDGET_ITEM', widgetInfo },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (added) return;
    // Check for duplicate widget of same type on this page
    const existing = widgets.find(w => w.type === widgetInfo.type);
    if (existing) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      return;
    }

    const configOverrides = {};
    if (widgetInfo.section) configOverrides.section = widgetInfo.section;
    if (widgetInfo.settingKey) configOverrides.settingKey = widgetInfo.settingKey;
    if (widgetInfo.label) configOverrides.title = widgetInfo.label;

    onAdd(widgetInfo.type, {
      i: `widget-${widgetInfo.type}-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: widgetInfo.defaultSize?.w || 3,
      h: widgetInfo.defaultSize?.h || 3,
      minW: 2,
      minH: 2,
      maxW: 6,
      maxH: 6,
    }, configOverrides);

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const catColors = {
    metrics: 'bg-blue-100',
    visualization: 'bg-purple-100',
    data: 'bg-green-100',
    content: 'bg-yellow-100',
    navigation: 'bg-gray-100',
  };

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 sm:gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-primary transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catColors[widgetInfo.category] || 'bg-primary/10'}`}>
        <AiOutlinePlus className="text-primary text-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{widgetInfo.label}</div>
        <div className="text-xs text-gray-500">{widgetInfo.description}</div>
      </div>
      <button
        onClick={handleAdd}
        disabled={added}
        className={`sm:hidden flex-shrink-0 px-2 py-1.5 text-xs rounded-lg font-medium transition-all ${
          added
            ? 'bg-green-100 text-green-700'
            : 'bg-primary text-white'
        }`}
      >
        {added ? '✓ Added' : '+ Add'}
      </button>
      <div className="hidden sm:block text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
        Drag to add
      </div>
    </div>
  );
};

// Hook to get container width
const useContainerWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

const DashboardBuilderContent = ({ hideToolbar = false }) => {
  const containerWidth = useContainerWidth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    widgets,
    currentPage: contextPage,
    setPage,
    isEditMode,
    setIsEditMode,
    addWidget,
    removeWidget,
    updateWidgetLayout,
    openSettings,
    exportLayout,
    importLayout,
    resetDashboard,
    dashboardTitle,
    setDashboardTitle,
    gridConfig,
  } = useDashboard();
  const { user, logout } = useAuth();
  // Note: super_admin has their own /admin route, so here we check org-level admins + super_admin
  const isAdmin = ['org_admin', 'manager', 'super_admin'].includes(user?.role);
  const hasAdminAccess = user?.role === 'super_admin';

  // Get user's organization services from localStorage or user object
  const userServices = React.useMemo(() => {
    // Try to get from user context first
    if (user?.services && user.services.length > 0) {
      return user.services;
    }
    // Fallback: get from dashboard layouts keys (service slugs)
    const layouts = JSON.parse(localStorage.getItem('dashboard_page_layouts') || '{}');
    const knownServices = ['crm', 'erp', 'hr', 'projects', 'accounting', 'inventory', 'finance', 'sales'];
    return Object.keys(layouts)
      .filter(key => knownServices.includes(key))
      .map(slug => ({ slug, name: slug.charAt(0).toUpperCase() + slug.slice(1) }));
  }, [user?.services]);

  // Sync page from route to context
  const adminPages = ['/dashboard/services', '/dashboard/users', '/dashboard/analytics', '/dashboard/settings', '/dashboard/widgets', '/dashboard/sales-marketing'];
  const isSMRoute = location.pathname.startsWith('/sm/');
  // Add service-specific pages to the list of valid pages
  const servicePages = userServices.map(svc => `/dashboard/${svc.slug}`);
  // Super admin uses /admin route instead of /dashboard
  const isAdminRoute = location.pathname.startsWith('/admin');
  const allValidPages = [...adminPages, ...servicePages, '/sm/core-crm/contacts'];
  const isDashboardPage = !allValidPages.includes(location.pathname) && !isAdminRoute;
  const routePage = isAdminRoute ? 'dashboard' : (isDashboardPage ? 'dashboard' : location.pathname.replace('/dashboard/', ''));
  const isSalesMarketingPage = location.pathname === '/dashboard/sales-marketing' || isSMRoute;

  React.useEffect(() => {
    if (contextPage !== routePage) {
      setPage(routePage);
    }
  }, [routePage, contextPage, setPage]);

  // Redirect non-admin users away from admin pages (but allow super_admin and org_admin)
  React.useEffect(() => {
    if (!isAdmin && adminPages.includes(location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, location.pathname, navigate, adminPages]);

  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isImporting, setIsImporting] = useState(false);

  // Page-aware navigation items — different for admin vs regular users
  const navPages = hasAdminAccess ? [
    // Super admin sees platform management pages at /admin
    { path: '/admin', label: 'Platform Overview', icon: AiOutlineHome },
    { path: '/dashboard/services', label: 'Services', icon: AiOutlineAppstore },
    { path: '/dashboard/users', label: 'Users', icon: AiOutlineTeam },
    { path: '/dashboard/analytics', label: 'Analytics', icon: AiOutlineBarChart },
    { path: '/dashboard/settings', label: 'Settings', icon: AiOutlineSetting },
    { path: '/dashboard/widgets', label: 'Widgets', icon: AiOutlineLayout },
  ] : [
    // Org admin/manager and regular users see org-level pages at /dashboard
    { path: '/dashboard', label: 'Dashboard', icon: AiOutlineHome },
    ...(isAdmin
      ? [
          { path: '/dashboard/services', label: 'Services', icon: AiOutlineAppstore },
          { path: '/dashboard/users', label: 'Users', icon: AiOutlineTeam },
          { path: '/dashboard/analytics', label: 'Analytics', icon: AiOutlineBarChart },
          { path: '/dashboard/settings', label: 'Settings', icon: AiOutlineSetting },
          { path: '/dashboard/widgets', label: 'Widgets', icon: AiOutlineLayout },
        ]
      : [
          // Regular user sees service-specific pages
          ...userServices.slice(0, 4).map(svc => ({
            path: `/dashboard/${svc.slug}`,
            label: svc.name || svc.slug.charAt(0).toUpperCase() + svc.slug.slice(1),
            icon: AiOutlineAppstore,
          })),
          { path: '/dashboard/settings', label: 'Settings', icon: AiOutlineSetting },
        ]
    ),
  ];

  const isActivePage = (path) => {
    if (path === '/dashboard') return !adminPages.includes(location.pathname) && !isAdminRoute;
    if (path === '/admin') return isAdminRoute;
    return location.pathname === path;
  };

  // Drop handler for navigation items onto dashboard
  const [{ isOver }, drop] = useDrop({
    accept: [NAV_ITEM_TYPE, EXISTING_ROUTE_TYPE, SERVICE_TYPE],
    drop: (data) => {
      // Handle widget item drag from side panel
      if (data.type === 'WIDGET_ITEM') {
        const wi = data.widgetInfo;
        // Check for duplicate widget of same type on this page
        const existing = widgets.find(w => w.type === wi.type);
        if (existing) return; // Already exists on this page

        addWidget(wi.type, {
          i: `widget-${wi.type}-${Date.now()}`,
          x: 0,
          y: Infinity,
          w: wi.defaultSize?.w || 3,
          h: wi.defaultSize?.h || 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 6,
        });
        return;
      }

      // Handle service drag
      if (data.type === SERVICE_TYPE && data.service) {
        const service = data.service;
        const existing = widgets.find(
          (w) => w.type === WIDGET_TYPES.LINK && w.config.title === service.label
        );
        if (existing) return;

        addWidget(WIDGET_TYPES.LINK, {
          i: `widget-${service.id}-${Date.now()}`,
          x: 0,
          y: Infinity,
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 6,
        }, {
          title: service.label,
          url: `/dashboard/${service.id}`,
          description: `${service.label} module`,
          icon: 'link',
          color: service.color,
        });
        return;
      }

      const isRoute = data.type === EXISTING_ROUTE_TYPE;
      const sourceData = isRoute ? data.route : data.item;
      const targetUrl = isRoute ? sourceData.path : sourceData.url;

      // Check if widget with same URL already exists
      const existing = widgets.find(
        (w) => w.type === WIDGET_TYPES.LINK && w.config.url === targetUrl
      );

      if (existing) {
        // Bring existing widget into view (no duplicate)
        return;
      }

      const config = {
        title: sourceData.label,
        url: targetUrl,
        description: isRoute ? `Navigate to ${sourceData.label}` : (sourceData.description || ''),
        icon: sourceData.icon || 'link',
        color: sourceData.color || '#296374',
        openInNewTab: sourceData.openInNewTab || false,
      };

      addWidget(WIDGET_TYPES.LINK, {
        i: `widget-${Date.now()}`,
        x: 0,
        y: Infinity,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      }, config);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleLayoutChange = useCallback((layout, layouts) => {
    const currentLayout = layout;
    updateWidgetLayout(currentLayout);
  }, [updateWidgetLayout]);

  const handleAddWidget = (type, configOverrides = null) => {
    const widgetInfo = widgetRegistry[type];
    addWidget(type, {
      i: `widget-${Date.now()}`,
      x: 0,
      y: Infinity,
      w: widgetInfo.defaultSize.w,
      h: widgetInfo.defaultSize.h,
      minW: 2,
      minH: 2,
      maxW: 12,
      maxH: 20,
    }, configOverrides);
    setShowWidgetPanel(false);
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      importLayout(file)
        .then(() => {
          setIsImporting(false);
        })
        .catch((error) => {
          console.error('Import failed:', error);
          alert('Failed to import layout: ' + error.message);
        });
    }
  };

  const filteredWidgets = activeCategory === 'all'
    ? Object.entries(widgetRegistry)
    : Object.entries(widgetRegistry).filter(([_, info]) => info.category === activeCategory);
  // Adaptive side panel content based on current page
  const currentPage = routePage;

  // Determine if this is super admin viewing admin pages
  const isAdminView = hasAdminAccess && isAdminRoute;

  const sidePanelContent = {
    dashboard: {
      title: isAdminView ? 'Platform Widgets' : (isAdmin ? 'Widgets & Services' : 'Add Widgets'),
      tip: isAdminView ? 'Drag items to build the platform dashboard' : (isAdmin ? 'Drag items to build your dashboard' : 'Drag widgets to customize your dashboard'),
      sections: isAdminView ? [
        {
          label: 'Platform Stats',
          tip: 'Drag to add platform overview widgets',
          items: [
            { type: 'statsCard', label: 'Organizations', description: 'Total orgs on platform', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'statsCard', label: 'Total Users', description: 'All platform users', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'statsCard', label: 'Active Services', description: 'Service subscriptions', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'chart', label: 'Growth Chart', description: 'Platform growth trend', defaultSize: { w: 6, h: 5 }, category: 'visualization' },
            { type: 'table', label: 'Recent Orgs', description: 'Latest organizations', defaultSize: { w: 6, h: 5 }, category: 'data' },
          ],
          type: 'widget',
        },
      ] : isAdmin ? [
        {
          label: 'Services',
          tip: 'Drag services onto the dashboard to add them as widgets',
          items: [
            { id: 'sales-marketing', label: 'Sales & Marketing', color: '#E11D48', users: 0 },
            { id: 'crm', label: 'CRM', color: '#296374', users: 1250 },
            { id: 'erp', label: 'ERP', color: '#714B67', users: 890 },
            { id: 'hr', label: 'HR', color: '#25A8E1', users: 654 },
            { id: 'projects', label: 'Projects', color: '#00AEEF', users: 523 },
            { id: 'accounting', label: 'Accounting', color: '#16A34A', users: 445 },
            { id: 'inventory', label: 'Inventory', color: '#DC2626', users: 378 },
          ],
          type: 'service',
        },
        {
          label: 'Widget Library',
          tip: 'Click or drag to add widgets',
          items: filteredWidgets.map(([type, info]) => ({ type, ...info })),
          type: 'widget',
        },
      ] : [
        {
          label: 'Widgets',
          tip: 'Drag to add',
          items: filteredWidgets.map(([type, info]) => ({ type, ...info })),
          type: 'widget',
        },
      ],
    },
    services: {
      title: 'Service Widgets',
      tip: 'Drag widgets to build your services page',
      sections: [
        {
          label: 'Service Stats',
          tip: 'Drag to add',
          items: [
            { type: 'serviceQuickStats', label: 'Service Overview', description: 'Services, revenue, customers', defaultSize: { w: 6, h: 4 }, category: 'services' },
          ],
          type: 'widget',
        },
        {
          label: 'Service Data',
          tip: 'Drag to add',
          items: [
            { type: 'servicesTable', label: 'Services List', description: 'Live services list', defaultSize: { w: 5, h: 5 }, category: 'services' },
            { type: 'statsCard', label: 'Total Services', description: 'Service count card', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'link', label: 'Quick Link', description: 'Link to any page', defaultSize: { w: 3, h: 3 }, category: 'navigation' },
          ],
          type: 'widget',
        },
      ],
    },
    users: {
      title: 'User Widgets',
      tip: 'Drag widgets to build your users page',
      sections: [
        {
          label: 'User Stats',
          tip: 'Drag to add',
          items: [
            { type: 'userStats', label: 'User Stats', description: 'Total, active, inactive', defaultSize: { w: 4, h: 3 }, category: 'users' },
          ],
          type: 'widget',
        },
        {
          label: 'User Data',
          tip: 'Drag to add',
          items: [
            { type: 'usersTable', label: 'Users Table', description: 'Live users table with search', defaultSize: { w: 6, h: 5 }, category: 'users' },
            { type: 'metric', label: 'Active Users', description: 'Currently active users', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'metric', label: 'Churn Rate', description: 'User retention metric', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
          ],
          type: 'widget',
        },
      ],
    },
    analytics: {
      title: 'Analytics Widgets',
      tip: 'Drag widgets to build your analytics page',
      sections: [
        {
          label: 'Analytics Overview',
          tip: 'Drag to add',
          items: [
            { type: 'analyticsStats', label: 'Analytics Stats', description: 'Real analytics metrics', defaultSize: { w: 6, h: 4 }, category: 'analytics' },
            { type: 'statsCard', label: 'Revenue Stats', description: 'Display revenue metric', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
            { type: 'metric', label: 'Growth Rate', description: 'Month over month growth', defaultSize: { w: 3, h: 3 }, category: 'metrics' },
          ],
          type: 'widget',
        },
        {
          label: 'Data Widgets',
          tip: 'Drag to add',
          items: [
            { type: 'table', label: 'Data Table', description: 'Sortable data table', defaultSize: { w: 8, h: 6 }, category: 'data' },
            { type: 'chart', label: 'Revenue Chart', description: 'Revenue over time', defaultSize: { w: 6, h: 6 }, category: 'visualization' },
            { type: 'text', label: 'Notes', description: 'Add analysis notes', defaultSize: { w: 4, h: 3 }, category: 'content' },
          ],
          type: 'widget',
        },
      ],
    },
    settings: {
      title: 'Settings Widgets',
      tip: 'Drag widgets to build your settings page',
      sections: [
        {
          label: 'Settings Panels',
          tip: 'Each one is a unique settings panel',
          items: [
            { type: 'settingsSection', label: 'General Settings', description: 'App name, language, timezone', defaultSize: { w: 6, h: 6 }, category: 'settings', section: 'general' },
            { type: 'settingsProfile', label: 'Profile Panel', description: 'Avatar, site name, email', defaultSize: { w: 5, h: 5 }, category: 'settings' },
            { type: 'settingsSecurity', label: 'Security Panel', description: 'Password, 2FA, sessions', defaultSize: { w: 6, h: 7 }, category: 'settings' },
            { type: 'settingsNotifications', label: 'Notifications', description: 'Email & push toggles', defaultSize: { w: 5, h: 4 }, category: 'settings' },
            { type: 'settingsBilling', label: 'Billing Panel', description: 'Plan selector, billing email', defaultSize: { w: 5, h: 5 }, category: 'settings' },
          ],
          type: 'widget',
        },
        {
          label: 'Quick Toggles',
          tip: 'Single setting switches',
          items: [
            { type: 'settingsToggle', label: 'Email Notifications', description: 'Toggle email alerts', defaultSize: { w: 4, h: 2 }, category: 'settings', settingKey: 'email_notifications' },
            { type: 'settingsToggle', label: 'Push Notifications', description: 'Toggle push alerts', defaultSize: { w: 4, h: 2 }, category: 'settings', settingKey: 'push_notifications' },
            { type: 'settingsToggle', label: 'Two-Factor Auth', description: 'Enable 2FA', defaultSize: { w: 4, h: 2 }, category: 'settings', settingKey: 'two_factor' },
          ],
          type: 'widget',
        },
      ],
    },
    // Widgets management page — shows full library for admins (super_admin + org_admin)
    widgets: isAdmin ? {
      title: 'Widgets & Services',
      tip: 'Drag services, nav links, and widgets onto the dashboard to add them',
      sections: [
        {
          label: 'Navigation Links',
          tip: 'Drag nav links onto the widget library page to add them as widgets',
          items: navPages.map((page) => ({
            type: 'nav_item',
            label: page.label,
            url: page.path,
            icon: page.name,
          })),
          type: 'nav_item',
        },
        {
          label: 'Services',
          tip: 'Drag services onto the dashboard to add them as widgets',
          items: [
            { id: 'sales-marketing', label: 'Sales & Marketing', color: '#E11D48', users: 0 },
            { id: 'crm', label: 'CRM', color: '#296374', users: 1250 },
            { id: 'erp', label: 'ERP', color: '#714B67', users: 890 },
            { id: 'hr', label: 'HR', color: '#25A8E1', users: 654 },
            { id: 'projects', label: 'Projects', color: '#00AEEF', users: 523 },
            { id: 'accounting', label: 'Accounting', color: '#16A34A', users: 445 },
            { id: 'inventory', label: 'Inventory', color: '#DC2626', users: 378 },
          ],
          type: 'service',
        },
        {
          label: 'Widget Library',
          tip: 'Click or drag to add widgets',
          items: filteredWidgets.map(([type, info]) => ({ type, ...info })),
          type: 'widget',
        },
      ],
    } : {
      title: 'Widget Library',
      tip: 'Drag to add',
      sections: [
        {
          label: 'Widgets',
          tip: 'Drag to add',
          items: filteredWidgets.map(([type, info]) => ({ type, ...info })),
          type: 'widget',
        },
      ],
    },
  };

  const currentPanel = sidePanelContent[currentPage] || sidePanelContent.dashboard;

  return (
    <div className={`dashboard-builder ${hideToolbar ? '' : 'min-h-screen'} bg-gray-100`}>
      {/* Top Toolbar */}
      {!hideToolbar && !isSalesMarketingPage && (
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2">
          {/* Left: Adaptive Page Navigation + Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <nav className="flex items-center gap-1 flex-wrap">
              {navPages.map((page) => {
                const Icon = page.icon;
                const active = isActivePage(page.path);
                return (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{page.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="hidden sm:flex items-center gap-2 min-w-0 ml-2">
              <AiOutlineLayout className="text-primary flex-shrink-0" size={20} />
              <input
                type="text"
                value={dashboardTitle}
                onChange={(e) => setDashboardTitle(e.target.value)}
                className="text-sm font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent truncate max-w-[140px]"
                placeholder="Dashboard Title"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile: Add + Edit + Logout */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                onClick={() => setShowWidgetPanel(!showWidgetPanel)}
                className="p-2 bg-primary text-white rounded-lg"
                title="Add Widget"
              >
                <AiOutlinePlus size={18} />
              </button>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2 rounded-lg transition-all ${
                  isEditMode ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                title="Edit Mode"
              >
                <AiOutlineEdit size={18} />
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                title="Logout"
              >
                <AiOutlineLogout size={18} />
              </button>
            </div>

            {/* Desktop: Add Widget, Edit, Export, Import, Reset */}
            <button
              onClick={() => setShowWidgetPanel(!showWidgetPanel)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm"
            >
              <AiOutlinePlus size={16} />
              Add Widget
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <AiOutlineEdit size={16} />
              {isEditMode ? 'Editing' : 'Edit'}
            </button>

            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            <button
              onClick={exportLayout}
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Export Layout"
            >
              <AiOutlineDownload size={18} />
            </button>

            <label className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer" title="Import Layout">
              <AiOutlineUpload size={18} />
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={resetDashboard}
              className="hidden sm:flex p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              title="Reset Dashboard"
            >
              <AiOutlineDelete size={18} />
            </button>

            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors text-gray-600 hover:text-red-600 text-sm font-medium"
              title="Logout"
            >
              <AiOutlineLogout size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Adaptive Side Panel */}
        {showWidgetPanel && !isSalesMarketingPage && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setShowWidgetPanel(false)}
          />
          <div className="bg-white overflow-y-auto z-50 fixed inset-y-0 left-0 w-full sm:w-80 sm:relative sm:inset-auto sm:border-r sm:border-gray-200 sm:min-h-[calc(100vh-64px)] sm:sticky sm:top-16 shadow-2xl sm:shadow-none">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AiOutlineAppstore size={18} />
                  {currentPanel.title}
                </h3>
                <button
                  onClick={() => setShowWidgetPanel(false)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {currentPanel.tip && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800">
                    <strong>Mobile:</strong> Tap the "+ Add" button. <strong>Desktop:</strong> Drag items onto the grid.
                  </p>
                </div>
              )}

              {currentPanel.sections.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">{section.tip}</p>
                  <div className="space-y-2">
                    {section.items.map((item, iIdx) => {
                      // Nav item
                      if (item.type === 'nav_item') {
                        return <DraggableNavItemCard key={`nav-${iIdx}`} navItem={item} />;
                      }
                      // Service item
                      if (item.id && !item.type) {
                        return <ServiceCard key={item.id} service={item} onAdd={addWidget} />;
                      }
                      // Widget item — draggable
                      if (item.type) {
                        return <DraggableWidgetCard key={iIdx} widgetInfo={item} onAdd={addWidget} />;
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
        )}

        {/* Main Dashboard Area */}
        <div className={`flex-1 transition-all ${isSalesMarketingPage ? 'p-0' : 'p-3 sm:p-6'}`}>
          {isSalesMarketingPage ? (
            <SalesMarketingPage />
          ) : isAdmin && routePage === 'widgets' ? (
            <WidgetManagement />
          ) : (
          <div ref={drop} className={isOver ? 'bg-primary bg-opacity-5' : ''}>
          {widgets.length === 0 ? (
            <div className={`flex items-center justify-center min-h-[60vh] sm:h-96 bg-white rounded-lg border-2 border-dashed transition-all ${
              isOver ? 'border-primary bg-opacity-20' : 'border-gray-300'
            }`}>
              <div className="text-center p-4">
                {isOver ? (
                  <>
                    <AiOutlineAppstore size={48} className="mx-auto mb-4 text-primary animate-bounce" />
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      Drop here to add widget
                    </h3>
                  </>
                ) : (
                  <>
                    <AiOutlineAppstore size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {isAdminRoute ? 'Your admin dashboard is empty' : routePage === 'dashboard' ? (isAdmin ? 'Your dashboard is empty' : 'Your dashboard') : `Build your ${routePage} page`}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {isAdminRoute ? 'Drag widgets to build your admin dashboard' : routePage === 'dashboard' ? (isAdmin ? 'Click the side panel button or drag items to start building' : 'Your personalized dashboard appears here') : `Drag widgets to build this page`}
                    </p>
                    <button
                      onClick={() => setShowWidgetPanel(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Open Widget Panel
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: widgets.map(w => w.layout) }}
              breakpoints={gridConfig.breakpoints}
              cols={gridConfig.cols}
              rowHeight={gridConfig.rowHeight}
              width={containerWidth}
              onLayoutChange={handleLayoutChange}
              isDraggable={isEditMode}
              isResizable={isEditMode}
              draggableHandle=".react-grid-item-drag-handle"
              resizeHandle={<div className="absolute right-4 bottom-4 w-4 h-4 cursor-se-resize" />}
              margin={[16, 16]}
              containerPadding={[16, 16]}
              useCSSTransforms={true}
              compactType="vertical"
              preventCollision={false}
              animate={true}
            >
              {widgets.map((widget) => (
                <div key={widget.layout.i} data-grid={widget.layout}>
                  <WidgetFactory
                    widget={widget}
                    isEditMode={isEditMode}
                    onSettings={openSettings}
                    onRemove={removeWidget}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          )}

          {/* Drag Overlay */}
          {isOver && widgets.length > 0 && (
            <div className="hidden sm:flex fixed inset-0 bg-primary bg-opacity-5 pointer-events-none z-50 items-center justify-center">
              <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-dashed border-primary">
                <AiOutlineAppstore size={48} className="mx-auto mb-4 text-primary animate-bounce" />
                <h3 className="text-xl font-semibold text-primary text-center">
                  Drop to add as widget
                </h3>
              </div>
            </div>
          )}
          </div>
          )}
        </div>
      </div>

      {/* Settings Panel Modal */}
      <SettingsPanel />
    </div>
  );
};

const DashboardBuilder = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DashboardBuilderContent />
    </DndProvider>
  );
};

export default DashboardBuilder;
