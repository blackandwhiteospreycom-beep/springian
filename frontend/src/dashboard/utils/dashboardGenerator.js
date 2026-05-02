/**
 * Dashboard Generator — Creates a personalized dashboard layout based on
 * user's onboarding answers and selected services.
 *
 * Called after onboarding to auto-populate the user's first dashboard.
 */

// Service color map
const SERVICE_COLORS = {
  crm: '#296374',
  erp: '#714B67',
  hr: '#25A8E1',
  projects: '#00AEEF',
  accounting: '#16A34A',
  inventory: '#DC2626',
  finance: '#16A34A',
  sales: '#714B67',
};

// Service-specific widget configurations for the main dashboard
const serviceDashboardWidgets = {
  crm: {
    stats: [
      { title: 'Total Leads', label: 'Leads', color: '#296374' },
      { title: 'Deals Won', label: 'Deals', color: '#16A34A' },
      { title: 'Pipeline Value', label: 'Pipeline', color: '#714B67' },
    ],
    metric: { title: 'Conversion Rate', suffix: '%' },
    chart: { title: 'Lead Pipeline', chartType: 'bar' },
    table: { title: 'Recent Leads' },
  },
  erp: {
    stats: [
      { title: 'Orders', label: 'Total Orders', color: '#714B67' },
      { title: 'Inventory', label: 'Items in Stock', color: '#25A8E1' },
      { title: 'Suppliers', label: 'Active Suppliers', color: '#00AEEF' },
    ],
    metric: { title: 'Fulfillment Rate', suffix: '%' },
    chart: { title: 'Order Trends', chartType: 'line' },
    table: { title: 'Recent Orders' },
  },
  hr: {
    stats: [
      { title: 'Employees', label: 'Total Staff', color: '#25A8E1' },
      { title: 'Departments', label: 'Departments', color: '#16A34A' },
      { title: 'Open Positions', label: 'Hiring', color: '#9333EA' },
    ],
    metric: { title: 'Attendance Rate', suffix: '%' },
    chart: { title: 'Headcount Trend', chartType: 'area' },
    table: { title: 'Recent Hires' },
  },
  projects: {
    stats: [
      { title: 'Active Projects', label: 'Projects', color: '#00AEEF' },
      { title: 'Tasks Due', label: 'Pending Tasks', color: '#DC2626' },
      { title: 'Team Members', label: 'Active Users', color: '#16A34A' },
    ],
    metric: { title: 'On Track', suffix: '%' },
    chart: { title: 'Task Completion', chartType: 'bar' },
    table: { title: 'Recent Tasks' },
  },
  accounting: {
    stats: [
      { title: 'Revenue', label: 'This Month', color: '#16A34A' },
      { title: 'Expenses', label: 'This Month', color: '#DC2626' },
      { title: 'Outstanding', label: 'Invoices', color: '#296374' },
    ],
    metric: { title: 'Profit Margin', suffix: '%' },
    chart: { title: 'Cash Flow', chartType: 'area' },
    table: { title: 'Recent Invoices' },
  },
  inventory: {
    stats: [
      { title: 'Total Items', label: 'SKU Count', color: '#DC2626' },
      { title: 'Low Stock', label: 'Alerts', color: '#EA580C' },
      { title: 'Warehouses', label: 'Locations', color: '#25A8E1' },
    ],
    metric: { title: 'Turnover', suffix: 'x' },
    chart: { title: 'Stock Levels', chartType: 'bar' },
    table: { title: 'Low Stock Alerts' },
  },
};

// Industry-specific widget ordering and emphasis
const industryConfigs = {
  'E-commerce': { primaryServices: ['crm', 'inventory', 'accounting'], emphasis: 'sales' },
  'IT/Technology': { primaryServices: ['projects', 'crm', 'accounting'], emphasis: 'projects' },
  'Healthcare': { primaryServices: ['hr', 'accounting'], emphasis: 'hr' },
  'Finance': { primaryServices: ['accounting', 'crm'], emphasis: 'finance' },
  'Manufacturing': { primaryServices: ['inventory', 'erp', 'accounting'], emphasis: 'operations' },
  'Education': { primaryServices: ['hr', 'projects'], emphasis: 'people' },
  'Retail': { primaryServices: ['crm', 'inventory', 'accounting'], emphasis: 'sales' },
  'Real Estate': { primaryServices: ['crm', 'accounting'], emphasis: 'sales' },
  'Marketing': { primaryServices: ['crm', 'projects'], emphasis: 'campaigns' },
};

/**
 * Helper to get answer from onboarding answers
 */
function getAnswer(answers, key) {
  const found = answers?.find(a => a.questionKey === key);
  return found?.answer || null;
}

/**
 * Generate a personalized welcome message based on onboarding answers
 */
function generateWelcomeMessage(orgName, answers) {
  const industry = getAnswer(answers, 'industry') || 'business';
  const goals = getAnswer(answers, 'primary_goals') || 'growth';
  const companySize = getAnswer(answers, 'company_size') || 'small';

  const messages = [
    `Welcome to ${orgName || 'Master App'}!`,
    `Your ${industry.toLowerCase()} dashboard is ready.`,
    `Focus: ${goals}. Team size: ${companySize}.`,
    'Drag widgets from the side panel to customize.',
  ];

  return {
    title: `Welcome to ${orgName || 'Master App'}!`,
    content: messages.join('\n\n'),
  };
}

/**
 * Determine which services to emphasize based on answers
 */
function getPriorityServices(serviceSlugs, answers) {
  const industry = getAnswer(answers, 'industry');
  const goals = getAnswer(answers, 'primary_goals');

  // Industry-based priority
  if (industry && industryConfigs[industry]) {
    const config = industryConfigs[industry];
    const priority = config.primaryServices;
    // Sort services by priority
    return [...serviceSlugs].sort((a, b) => {
      const aIdx = priority.indexOf(a);
      const bIdx = priority.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }

  // Goals-based priority
  if (goals) {
    if (goals.includes('sales') || goals.includes('Increase sales')) {
      return ['crm', ...serviceSlugs.filter(s => s !== 'crm')];
    }
    if (goals.includes('Employee') || goals.includes('employee')) {
      return ['hr', ...serviceSlugs.filter(s => s !== 'hr')];
    }
    if (goals.includes('reporting') || goals.includes('Reporting')) {
      return ['accounting', ...serviceSlugs.filter(s => s !== 'accounting')];
    }
    if (goals.includes('Automation') || goals.includes('automation')) {
      return ['projects', ...serviceSlugs.filter(s => s !== 'projects')];
    }
  }

  return serviceSlugs;
}

/**
 * Determine dashboard complexity based on onboarding answers
 */
function getDashboardComplexity(answers) {
  const preference = getAnswer(answers, 'dashboard_preference');
  if (preference?.includes('Simple')) return 'simple';
  if (preference?.includes('Analytics')) return 'analytics';
  return 'detailed'; // default
}

/**
 * Generate a dashboard layout based on selected services and onboarding answers.
 * Returns the pageLayouts object to store in localStorage.
 */
export function generateDashboard({ selectedServices, onboardingAnswers, orgName }) {
  const pageLayouts = {};
  const serviceSlugs = (selectedServices || []).map(s => s.slug || s);
  const priorityServices = getPriorityServices(serviceSlugs, onboardingAnswers);
  const complexity = getDashboardComplexity(onboardingAnswers);
  const enableAI = getAnswer(onboardingAnswers, 'enable_ai_assistant');

  // ─── Dashboard (main page) ───
  const dashboardWidgets = [];
  let yOffset = 0;

  // 1. Welcome widget (always first)
  const welcome = generateWelcomeMessage(orgName, onboardingAnswers);
  dashboardWidgets.push({
    id: crypto.randomUUID(),
    type: 'text',
    config: {
      title: welcome.title,
      content: welcome.content,
      fontSize: complexity === 'simple' ? 'large' : 'medium',
    },
    layout: {
      i: `welcome-${Date.now()}`,
      x: 0,
      y: yOffset,
      w: complexity === 'simple' ? 12 : 8,
      h: complexity === 'simple' ? 2 : 3,
      minW: 2,
      minH: 2,
      maxW: 12,
      maxH: 20,
    },
    createdAt: new Date().toISOString(),
  });

  // AI tip widget if AI is enabled
  if (enableAI === 'yes' && complexity !== 'simple') {
    dashboardWidgets.push({
      id: crypto.randomUUID(),
      type: 'text',
      config: {
        title: '🤖 AI Assistant Enabled',
        content: 'Press Ctrl+K or click the AI button anytime for intelligent insights and assistance.',
        fontSize: 'small',
      },
      layout: {
        i: `ai-tip-${Date.now()}`,
        x: 8,
        y: yOffset,
        w: 4,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });
  }

  yOffset += complexity === 'simple' ? 2 : 3;

  // 2. Stats row (up to 4 stat cards from priority services)
  const statCards = [];
  const maxStats = complexity === 'simple' ? 3 : 4;

  priorityServices.slice(0, maxStats).forEach((slug, i) => {
    const config = serviceDashboardWidgets[slug];
    if (!config) return;

    const statConfig = config.stats[0];
    statCards.push({
      id: crypto.randomUUID(),
      type: 'statsCard',
      config: {
        title: statConfig.title,
        value: 0,
        label: statConfig.label,
        color: SERVICE_COLORS[slug] || statConfig.color,
        icon: 'trend',
      },
      layout: {
        i: `${slug}-stat-${Date.now()}-${i}`,
        x: i * 3,
        y: yOffset,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 6,
      },
      createdAt: new Date().toISOString(),
    });
  });

  dashboardWidgets.push(...statCards);
  yOffset += 3;

  // 3. Additional stat row for detailed dashboards
  if (complexity === 'detailed' && priorityServices.length > 4) {
    const extraStats = [];
    priorityServices.slice(4, 8).forEach((slug, i) => {
      const config = serviceDashboardWidgets[slug];
      if (!config) return;

      const statConfig = config.stats[0];
      extraStats.push({
        id: crypto.randomUUID(),
        type: 'statsCard',
        config: {
          title: statConfig.title,
          value: 0,
          label: statConfig.label,
          color: SERVICE_COLORS[slug] || statConfig.color,
          icon: 'trend',
        },
        layout: {
          i: `${slug}-stat2-${Date.now()}-${i}`,
          x: i * 3,
          y: yOffset,
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 6,
        },
        createdAt: new Date().toISOString(),
      });
    });

    if (extraStats.length > 0) {
      dashboardWidgets.push(...extraStats);
      yOffset += 3;
    }
  }

  // 4. Charts and Tables (from top 2 priority services)
  const chartTableCount = complexity === 'simple' ? 1 : complexity === 'detailed' ? 2 : 3;
  const topServices = priorityServices.slice(0, chartTableCount);

  topServices.forEach((slug, idx) => {
    const config = serviceDashboardWidgets[slug];
    if (!config) return;

    const xPosition = idx % 2 === 0 ? 0 : 6;
    const yPosition = yOffset + Math.floor(idx / 2) * 5;

    // Chart widget
    dashboardWidgets.push({
      id: crypto.randomUUID(),
      type: 'chart',
      config: {
        title: config.chart.title,
        chartType: config.chart.chartType,
        data: [],
      },
      layout: {
        i: `${slug}-chart-${Date.now()}-${idx}`,
        x: xPosition,
        y: yPosition,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });

    // Table widget
    dashboardWidgets.push({
      id: crypto.randomUUID(),
      type: 'table',
      config: {
        title: config.table.title,
        columns: [],
        data: [],
      },
      layout: {
        i: `${slug}-table-${Date.now()}-${idx}`,
        x: xPosition === 0 ? 6 : 0,
        y: yPosition,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });
  });

  // 5. Metric widgets for detailed dashboards
  if (complexity === 'detailed') {
    const metricWidgets = [];
    priorityServices.slice(0, 2).forEach((slug, i) => {
      const config = serviceDashboardWidgets[slug];
      if (!config) return;

      metricWidgets.push({
        id: crypto.randomUUID(),
        type: 'metric',
        config: {
          title: config.metric.title,
          value: 0,
          suffix: config.metric.suffix,
          prefix: '',
          trend: 'neutral',
          comparison: 0,
        },
        layout: {
          i: `${slug}-metric-${Date.now()}-${i}`,
          x: i * 3,
          y: yOffset + (topServices.length > 0 ? 10 : 0),
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 20,
        },
        createdAt: new Date().toISOString(),
      });
    });

    dashboardWidgets.push(...metricWidgets);
  }

  pageLayouts.dashboard = dashboardWidgets;

  // ─── Service-specific pages ───
  serviceSlugs.forEach((slug) => {
    const config = serviceDashboardWidgets[slug];
    if (!config) return;

    const pageWidgets = [];
    let pageY = 0;

    // Stats row for service page
    config.stats.forEach((stat, i) => {
      pageWidgets.push({
        id: crypto.randomUUID(),
        type: 'statsCard',
        config: {
          title: stat.title,
          value: 0,
          label: stat.label,
          color: SERVICE_COLORS[slug] || stat.color,
          icon: 'trend',
        },
        layout: {
          i: `${slug}-page-stat-${i}-${Date.now()}`,
          x: i * 3,
          y: pageY,
          w: 3,
          h: 3,
          minW: 2,
          minH: 2,
          maxW: 6,
          maxH: 6,
        },
        createdAt: new Date().toISOString(),
      });
    });
    pageY += 3;

    // Metric
    pageWidgets.push({
      id: crypto.randomUUID(),
      type: 'metric',
      config: {
        title: config.metric.title,
        value: 0,
        suffix: config.metric.suffix,
        prefix: '',
        trend: 'neutral',
        comparison: 0,
      },
      layout: {
        i: `${slug}-page-metric-${Date.now()}`,
        x: 9,
        y: 0,
        w: 3,
        h: 3,
        minW: 2,
        minH: 2,
        maxW: 6,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });

    // Chart
    pageWidgets.push({
      id: crypto.randomUUID(),
      type: 'chart',
      config: {
        title: config.chart.title,
        chartType: config.chart.chartType,
        data: [],
      },
      layout: {
        i: `${slug}-page-chart-${Date.now()}`,
        x: 0,
        y: pageY,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });

    // Table
    pageWidgets.push({
      id: crypto.randomUUID(),
      type: 'table',
      config: {
        title: config.table.title,
        columns: [],
        data: [],
      },
      layout: {
        i: `${slug}-page-table-${Date.now()}`,
        x: 6,
        y: pageY,
        w: 6,
        h: 5,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 20,
      },
      createdAt: new Date().toISOString(),
    });

    pageLayouts[slug] = pageWidgets;
  });

  // ─── Settings page (always available) ───
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

/**
 * Get all available widget definitions for Super Admin widget management.
 */
export function getAvailableWidgets() {
  return {
    crm: [
      { type: 'statsCard', config: { title: 'Total Leads', value: 0, label: 'Leads', color: '#296374' }, label: 'Total Leads' },
      { type: 'statsCard', config: { title: 'Deals Won', value: 0, label: 'Deals', color: '#16A34A' }, label: 'Deals Won' },
      { type: 'chart', config: { title: 'Lead Pipeline', chartType: 'bar', data: [] }, label: 'Lead Pipeline' },
      { type: 'table', config: { title: 'Recent Leads', columns: [], data: [] }, label: 'Recent Leads' },
    ],
    erp: [
      { type: 'statsCard', config: { title: 'Orders', value: 0, label: 'Total Orders', color: '#714B67' }, label: 'Orders' },
      { type: 'statsCard', config: { title: 'Inventory', value: 0, label: 'Items in Stock', color: '#25A8E1' }, label: 'Inventory' },
      { type: 'chart', config: { title: 'Order Trends', chartType: 'line', data: [] }, label: 'Order Trends' },
      { type: 'table', config: { title: 'Recent Orders', columns: [], data: [] }, label: 'Recent Orders' },
    ],
    hr: [
      { type: 'statsCard', config: { title: 'Employees', value: 0, label: 'Total Staff', color: '#25A8E1' }, label: 'Employees' },
      { type: 'statsCard', config: { title: 'Departments', value: 0, label: 'Departments', color: '#16A34A' }, label: 'Departments' },
      { type: 'chart', config: { title: 'Headcount Trend', chartType: 'area', data: [] }, label: 'Headcount Trend' },
      { type: 'table', config: { title: 'Recent Hires', columns: [], data: [] }, label: 'Recent Hires' },
    ],
    projects: [
      { type: 'statsCard', config: { title: 'Active Projects', value: 0, label: 'Projects', color: '#00AEEF' }, label: 'Active Projects' },
      { type: 'statsCard', config: { title: 'Tasks Due', value: 0, label: 'Pending Tasks', color: '#DC2626' }, label: 'Tasks Due' },
      { type: 'chart', config: { title: 'Task Completion', chartType: 'bar', data: [] }, label: 'Task Completion' },
      { type: 'table', config: { title: 'Recent Tasks', columns: [], data: [] }, label: 'Recent Tasks' },
    ],
    accounting: [
      { type: 'statsCard', config: { title: 'Revenue', value: 0, label: 'This Month', color: '#16A34A' }, label: 'Revenue' },
      { type: 'statsCard', config: { title: 'Expenses', value: 0, label: 'This Month', color: '#DC2626' }, label: 'Expenses' },
      { type: 'chart', config: { title: 'Cash Flow', chartType: 'area', data: [] }, label: 'Cash Flow' },
      { type: 'table', config: { title: 'Recent Invoices', columns: [], data: [] }, label: 'Recent Invoices' },
    ],
    inventory: [
      { type: 'statsCard', config: { title: 'Total Items', value: 0, label: 'SKU Count', color: '#DC2626' }, label: 'Total Items' },
      { type: 'statsCard', config: { title: 'Low Stock', value: 0, label: 'Alerts', color: '#EA580C' }, label: 'Low Stock' },
      { type: 'chart', config: { title: 'Stock Levels', chartType: 'bar', data: [] }, label: 'Stock Levels' },
      { type: 'table', config: { title: 'Low Stock Alerts', columns: [], data: [] }, label: 'Low Stock Alerts' },
    ],
  };
}

export { serviceDashboardWidgets as serviceTemplates };
