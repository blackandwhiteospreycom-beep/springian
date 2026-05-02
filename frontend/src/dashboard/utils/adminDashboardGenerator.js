/**
 * Super Admin Dashboard Generator — Creates a predefined platform overview
 * dashboard layout for super admins. Unlike regular users who get onboarding-
 * generated dashboards, super admins get a fixed predefined layout.
 */

/**
 * Generate the super admin predefined dashboard layout.
 * Returns the pageLayouts object to store in localStorage.
 */
export function generateAdminDashboard() {
  const pageLayouts = {};
  const now = Date.now();

  // ─── Admin Main Page (Platform Overview) ───
  pageLayouts.dashboard = [
    {
      id: crypto.randomUUID(),
      type: 'text',
      config: {
        title: '🏢 Platform Overview',
        content: 'Welcome to the Super Admin dashboard. Monitor organizations, users, and platform health from here.',
        fontSize: 'medium',
      },
      layout: {
        i: `admin-welcome-${now}`,
        x: 0,
        y: 0,
        w: 12,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'statsCard',
      config: {
        title: 'Total Organizations',
        value: 0,
        label: 'Organizations',
        color: '#296374',
        icon: 'trend',
      },
      layout: {
        i: `admin-orgs-${now}`,
        x: 0,
        y: 3,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'statsCard',
      config: {
        title: 'Total Users',
        value: 0,
        label: 'Users',
        color: '#25A8E1',
        icon: 'trend',
      },
      layout: {
        i: `admin-users-${now}`,
        x: 3,
        y: 3,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'statsCard',
      config: {
        title: 'Active Services',
        value: 0,
        label: 'Subscriptions',
        color: '#16A34A',
        icon: 'trend',
      },
      layout: {
        i: `admin-services-${now}`,
        x: 6,
        y: 3,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'statsCard',
      config: {
        title: 'Active Organizations',
        value: 0,
        label: 'Active',
        color: '#00AEEF',
        icon: 'trend',
      },
      layout: {
        i: `admin-active-${now}`,
        x: 9,
        y: 3,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'chart',
      config: {
        title: 'Platform Growth',
        chartType: 'line',
        data: [],
      },
      layout: {
        i: `admin-chart-${now}`,
        x: 0,
        y: 6,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'table',
      config: {
        title: 'Recent Organizations',
        columns: [],
        data: [],
      },
      layout: {
        i: `admin-table-${now}`,
        x: 6,
        y: 6,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    },
  ];

  // ─── Settings page ───
  pageLayouts.settings = [
    {
      id: crypto.randomUUID(),
      type: 'settingsSection',
      config: { title: 'General Settings', section: 'general' },
      layout: { i: 'settings-general', x: 0, y: 0, w: 6, h: 6, minW: 2, minH: 2, maxW: 12, maxH: 20 },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'settingsProfile',
      config: { title: 'Profile Settings' },
      layout: { i: 'settings-profile', x: 6, y: 0, w: 6, h: 5, minW: 2, minH: 2, maxW: 12, maxH: 20 },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'settingsSecurity',
      config: { title: 'Security Settings' },
      layout: { i: 'settings-security', x: 0, y: 6, w: 6, h: 7, minW: 2, minH: 2, maxW: 12, maxH: 20 },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'settingsNotifications',
      config: { title: 'Notifications' },
      layout: { i: 'settings-notifications', x: 6, y: 5, w: 6, h: 4, minW: 2, minH: 2, maxW: 12, maxH: 20 },
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      type: 'settingsBilling',
      config: { title: 'Billing' },
      layout: { i: 'settings-billing', x: 6, y: 9, w: 6, h: 5, minW: 2, minH: 2, maxW: 12, maxH: 20 },
      createdAt: new Date().toISOString(),
    },
  ];

  return pageLayouts;
}
