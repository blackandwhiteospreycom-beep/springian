import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineCheck, AiOutlineRight, AiOutlineLock, AiOutlineTool,
  AiOutlineContacts, AiOutlineUser, AiOutlineSchedule, AiOutlineShoppingCart,
  AiOutlineMail, AiOutlineGlobal, AiOutlineFile, AiOutlineBarChart,
  AiOutlineRobot, AiOutlineHeart, AiOutlineBuild, AiOutlinePartition,
} from 'react-icons/ai';
import { useSM } from '../../modules/sales-marketing/context/SMContext';

// ─── Module Definitions ─────────────────────────────────────────────

const SM_MODULES = [
  {
    id: 'core-crm',
    name: 'Core CRM Data Layer',
    subtitle: 'Customer Foundation',
    color: '#296374',
    icon: <AiOutlineContacts size={18} />,
    features: [
      { id: 'contacts', label: 'Contact Management', route: '/sm/core-crm/contacts' },
      { id: 'accounts', label: 'Account Management', route: '/sm/core-crm/accounts' },
      { id: 'leads', label: 'Lead Database', route: '/sm/core-crm/leads' },
      { id: 'deals', label: 'Deal Management', route: '/sm/core-crm/deals' },
      { id: 'customer-360', label: 'Customer 360 View', route: '/sm/core-crm/customer-360' },
      { id: 'interactions', label: 'Interaction History', route: '/sm/core-crm/interactions' },
      { id: 'activity-timeline', label: 'Activity Timeline', route: '/sm/core-crm/activity-timeline' },
      { id: 'communication-logs', label: 'Communication Logs', route: '/sm/core-crm/communication-logs' },
      { id: 'data-enrichment', label: 'Data Enrichment', route: '/sm/core-crm/data-enrichment' },
      { id: 'duplicate-detection', label: 'Duplicate Detection', route: '/sm/core-crm/duplicate-detection' },
    ],
  },
  {
    id: 'lead-management',
    name: 'Lead Management System',
    subtitle: 'Capture, score, and route leads',
    color: '#714B67',
    icon: <AiOutlineUser size={18} />,
    features: [
      { id: 'capture-forms', label: 'Lead Capture Forms', route: '/sm/lead-management/capture-forms' },
      { id: 'import', label: 'Lead Import Tools', route: '/sm/lead-management/import' },
      { id: 'assignment', label: 'Lead Assignment', route: '/sm/lead-management/assignment' },
      { id: 'scoring', label: 'Lead Scoring', route: '/sm/lead-management/scoring' },
      { id: 'qualification', label: 'Lead Qualification', route: '/sm/lead-management/qualification' },
      { id: 'classification', label: 'MQL/SQL Classification', route: '/sm/lead-management/classification' },
      { id: 'routing', label: 'Lead Routing Rules', route: '/sm/lead-management/routing' },
      { id: 'nurturing', label: 'Lead Nurturing Workflows', route: '/sm/lead-management/nurturing' },
      { id: 'lifecycle', label: 'Lead Lifecycle Tracking', route: '/sm/lead-management/lifecycle' },
      { id: 'sources', label: 'Lead Source Tracking', route: '/sm/lead-management/sources' },
    ],
  },
  {
    id: 'pipeline-management',
    name: 'Pipeline & Opportunity Management',
    subtitle: 'Visualize and manage your sales pipeline',
    color: '#25A8E1',
    icon: <AiOutlineSchedule size={18} />,
    features: [
      { id: 'visualization', label: 'Sales Pipeline Visualization', route: '/sm/pipeline/visualization' },
      { id: 'stages', label: 'Opportunity Stages', route: '/sm/pipeline/stages' },
      { id: 'deals', label: 'Deal Tracking', route: '/sm/pipeline/deals' },
      { id: 'forecasting', label: 'Forecasting', route: '/sm/pipeline/forecasting' },
      { id: 'scoring', label: 'Probability Scoring', route: '/sm/pipeline/scoring' },
      { id: 'velocity', label: 'Pipeline Velocity', route: '/sm/pipeline/velocity' },
      { id: 'alerts', label: 'Deal Alerts & Reminders', route: '/sm/pipeline/alerts' },
      { id: 'goals', label: 'Sales Goals/Quota Tracking', route: '/sm/pipeline/goals' },
      { id: 'multi', label: 'Multi-Pipeline Management', route: '/sm/pipeline/multi' },
      { id: 'territories', label: 'Territory-Based Pipelines', route: '/sm/pipeline/territories' },
    ],
  },
  {
    id: 'sales-execution',
    name: 'Sales Execution Tools',
    subtitle: 'Execute your sales process',
    color: '#00AEEF',
    icon: <AiOutlineShoppingCart size={18} />,
    features: [
      { id: 'tasks', label: 'Task & Activity Management', route: '/sm/sales-execution/tasks' },
      { id: 'meetings', label: 'Meeting Scheduling', route: '/sm/sales-execution/meetings' },
      { id: 'email', label: 'Email Integration', route: '/sm/sales-execution/email' },
      { id: 'calls', label: 'Call Tracking & Logging', route: '/sm/sales-execution/calls' },
      { id: 'cadences', label: 'Sales Cadences/Sequences', route: '/sm/sales-execution/cadences' },
      { id: 'templates', label: 'Sales Scripts/Templates', route: '/sm/sales-execution/templates' },
      { id: 'proposals', label: 'Proposal Generation', route: '/sm/sales-execution/proposals' },
      { id: 'quotes', label: 'Quote Management (CPQ)', route: '/sm/sales-execution/quotes' },
      { id: 'contracts', label: 'Contract Lifecycle', route: '/sm/sales-execution/contracts' },
      { id: 'esignature', label: 'E-Signature Integration', route: '/sm/sales-execution/esignature' },
    ],
  },
  {
    id: 'marketing-automation',
    name: 'Marketing Automation',
    subtitle: 'Automate campaigns and workflows',
    color: '#16A34A',
    icon: <AiOutlineMail size={18} />,
    features: [
      { id: 'email-campaigns', label: 'Email Marketing Campaigns', route: '/sm/marketing-automation/email-campaigns' },
      { id: 'drip', label: 'Drip Campaigns', route: '/sm/marketing-automation/drip' },
      { id: 'workflows', label: 'Marketing Workflows', route: '/sm/marketing-automation/workflows' },
      { id: 'segmentation', label: 'Campaign Segmentation', route: '/sm/marketing-automation/segmentation' },
      { id: 'personalization', label: 'Personalization Engines', route: '/sm/marketing-automation/personalization' },
      { id: 'triggers', label: 'Trigger-Based Marketing', route: '/sm/marketing-automation/triggers' },
      { id: 'multi-channel', label: 'Multi-Channel Campaigns', route: '/sm/marketing-automation/multi-channel' },
      { id: 'performance', label: 'Campaign Performance', route: '/sm/marketing-automation/performance' },
      { id: 'ab-testing', label: 'A/B Testing', route: '/sm/marketing-automation/ab-testing' },
      { id: 'calendar', label: 'Marketing Calendar', route: '/sm/marketing-automation/calendar' },
    ],
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing Integrations',
    subtitle: 'Connect digital channels',
    color: '#EA580C',
    icon: <AiOutlineGlobal size={18} />,
    features: [
      { id: 'social', label: 'Social Media Integration', route: '/sm/digital-marketing/social' },
      { id: 'ads', label: 'Ad Campaign Integration', route: '/sm/digital-marketing/ads' },
      { id: 'seo', label: 'SEO Tools Integration', route: '/sm/digital-marketing/seo' },
      { id: 'visitors', label: 'Website Tracking', route: '/sm/digital-marketing/visitors' },
      { id: 'landing-pages', label: 'Landing Page Builder', route: '/sm/digital-marketing/landing-pages' },
      { id: 'forms', label: 'Form Builders', route: '/sm/digital-marketing/forms' },
      { id: 'chatbots', label: 'Chatbots & Live Chat', route: '/sm/digital-marketing/chatbots' },
      { id: 'retargeting', label: 'Retargeting Tools', route: '/sm/digital-marketing/retargeting' },
      { id: 'cookies', label: 'Cookie Tracking & Consent', route: '/sm/digital-marketing/cookies' },
      { id: 'utm', label: 'UTM Tracking', route: '/sm/digital-marketing/utm' },
    ],
  },
  {
    id: 'content-asset-mgmt',
    name: 'Content & Asset Management',
    subtitle: 'Manage sales and marketing assets',
    color: '#9333EA',
    icon: <AiOutlineFile size={18} />,
    features: [
      { id: 'library', label: 'Content Library', route: '/sm/content/library' },
      { id: 'email-templates', label: 'Email Templates', route: '/sm/content/email-templates' },
      { id: 'collateral', label: 'Sales Collateral', route: '/sm/content/collateral' },
      { id: 'documents', label: 'Document Sharing & Tracking', route: '/sm/content/documents' },
      { id: 'analytics', label: 'Content Performance', route: '/sm/content/analytics' },
      { id: 'versions', label: 'Version Control', route: '/sm/content/versions' },
      { id: 'brand', label: 'Brand Asset Management', route: '/sm/content/brand' },
      { id: 'knowledge-base', label: 'Knowledge Base', route: '/sm/content/knowledge-base' },
      { id: 'cms', label: 'CMS', route: '/sm/content/cms' },
      { id: 'ai-suggestions', label: 'AI Content Suggestions', route: '/sm/content/ai-suggestions' },
    ],
  },
  {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    subtitle: 'Data-driven insights',
    color: '#DC2626',
    icon: <AiOutlineBarChart size={18} />,
    features: [
      { id: 'sales-dashboards', label: 'Sales Dashboards', route: '/sm/analytics/sales-dashboards' },
      { id: 'marketing-dashboards', label: 'Marketing Dashboards', route: '/sm/analytics/marketing-dashboards' },
      { id: 'report-builder', label: 'Custom Report Builder', route: '/sm/analytics/report-builder' },
      { id: 'funnels', label: 'Funnel Analytics', route: '/sm/analytics/funnels' },
      { id: 'conversions', label: 'Conversion Tracking', route: '/sm/analytics/conversions' },
      { id: 'roi', label: 'ROI Tracking', route: '/sm/analytics/roi' },
      { id: 'attribution', label: 'Attribution Modeling', route: '/sm/analytics/attribution' },
      { id: 'cohorts', label: 'Cohort Analysis', route: '/sm/analytics/cohorts' },
      { id: 'predictive', label: 'Predictive Analytics', route: '/sm/analytics/predictive' },
      { id: 'visualization', label: 'Data Visualization', route: '/sm/analytics/visualization' },
    ],
  },
  {
    id: 'ai-automation',
    name: 'AI & Automation',
    subtitle: 'Modern CRM intelligence',
    color: '#0891B2',
    icon: <AiOutlineRobot size={18} />,
    features: [
      { id: 'predictive-scoring', label: 'Predictive Lead Scoring', route: '/sm/ai/predictive-scoring' },
      { id: 'forecasting', label: 'Sales Forecasting (AI)', route: '/sm/ai/forecasting' },
      { id: 'chatbots', label: 'AI Chatbots', route: '/sm/ai/chatbots' },
      { id: 'email-assist', label: 'Email Writing Assistance', route: '/sm/ai/email-assist' },
      { id: 'next-action', label: 'Next-Best-Action Recommendations', route: '/sm/ai/next-action' },
      { id: 'sentiment', label: 'Customer Sentiment Analysis', route: '/sm/ai/sentiment' },
      { id: 'workflows', label: 'Workflow Automation', route: '/sm/ai/workflows' },
      { id: 'voice', label: 'Voice Assistants', route: '/sm/ai/voice' },
      { id: 'alerts', label: 'Intelligent Alerts', route: '/sm/ai/alerts' },
      { id: 'anomalies', label: 'Data Anomaly Detection', route: '/sm/ai/anomalies' },
    ],
  },
  {
    id: 'customer-experience',
    name: 'Customer Experience & Retention',
    subtitle: 'Keep customers engaged',
    color: '#D946EF',
    icon: <AiOutlineHeart size={18} />,
    features: [
      { id: 'onboarding', label: 'Customer Onboarding', route: '/sm/cx/onboarding' },
      { id: 'tickets', label: 'Support/Ticketing System', route: '/sm/cx/tickets' },
      { id: 'sla', label: 'SLA Tracking', route: '/sm/cx/sla' },
      { id: 'feedback', label: 'Customer Feedback (NPS)', route: '/sm/cx/feedback' },
      { id: 'loyalty', label: 'Loyalty Program Management', route: '/sm/cx/loyalty' },
      { id: 'renewals', label: 'Renewal Management', route: '/sm/cx/renewals' },
      { id: 'upsell', label: 'Upsell/Cross-Sell', route: '/sm/cx/upsell' },
      { id: 'health', label: 'Customer Health Scoring', route: '/sm/cx/health' },
      { id: 'omnichannel', label: 'Omnichannel Support', route: '/sm/cx/omnichannel' },
      { id: 'self-service', label: 'Self-Service Portals', route: '/sm/cx/self-service' },
    ],
  },
  {
    id: 'erp-extensions',
    name: 'ERP Extensions',
    subtitle: 'Enterprise resource integrations',
    color: '#F59E0B',
    icon: <AiOutlineBuild size={18} />,
    features: [
      { id: 'orders', label: 'Order Management', route: '/sm/erp/orders' },
      { id: 'inventory', label: 'Inventory Integration', route: '/sm/erp/inventory' },
      { id: 'pricing', label: 'Pricing & Discount Rules', route: '/sm/erp/pricing' },
      { id: 'supply-demand', label: 'Supply-Demand Alignment', route: '/sm/erp/supply-demand' },
      { id: 'billing', label: 'Billing & Invoicing', route: '/sm/erp/billing' },
      { id: 'revenue', label: 'Revenue Recognition', route: '/sm/erp/revenue' },
      { id: 'subscriptions', label: 'Subscription Billing', route: '/sm/erp/subscriptions' },
      { id: 'partners', label: 'Channel/Partner Management', route: '/sm/erp/partners' },
      { id: 'procurement', label: 'Procurement-Sales Linkage', route: '/sm/erp/procurement' },
      { id: 'financial', label: 'Financial Reporting', route: '/sm/erp/financial' },
    ],
  },
  {
    id: 'integrations-ecosystem',
    name: 'Integration & Ecosystem',
    subtitle: 'Connect your tools',
    color: '#6366F1',
    icon: <AiOutlinePartition size={18} />,
    features: [
      { id: 'api', label: 'API Integrations', route: '/sm/integrations/api' },
      { id: 'marketplace', label: 'Third-Party Marketplace', route: '/sm/integrations/marketplace' },
      { id: 'payments', label: 'Payment Gateway', route: '/sm/integrations/payments' },
      { id: 'ecommerce', label: 'E-Commerce Integration', route: '/sm/integrations/ecommerce' },
      { id: 'sync', label: 'Data Syncing', route: '/sm/integrations/sync' },
      { id: 'mobile', label: 'Mobile CRM Apps', route: '/sm/integrations/mobile' },
      { id: 'cloud', label: 'Cloud Storage Integration', route: '/sm/integrations/cloud' },
      { id: 'collaboration', label: 'Collaboration Tools', route: '/sm/integrations/collaboration' },
      { id: 'identity', label: 'Identity & Access Management', route: '/sm/integrations/identity' },
      { id: 'security', label: 'Security & Compliance', route: '/sm/integrations/security' },
    ],
  },
];

const SECTION_ICONS = SM_MODULES.reduce((acc, m) => { acc[m.id] = m.icon; return acc; }, {});

// ─── Toggle Switch Component ────────────────────────────────────────

function ToggleSwitch({ enabled, onToggle, size = 'md' }) {
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-4', translateOff: 'translate-x-0.5' },
    md: { track: 'h-6 w-11', thumb: 'h-4 w-4', translate: 'translate-x-6', translateOff: 'translate-x-1' },
    lg: { track: 'h-7 w-14', thumb: 'h-5 w-5', translate: 'translate-x-8', translateOff: 'translate-x-1.5' },
  };
  const s = sizes[size];

  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 ${
        enabled ? 'bg-primary' : 'bg-gray-300'
      } ${s.track}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform duration-200 ${s.thumb} ${
          enabled ? s.translate : s.translateOff
        }`}
      />
    </button>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────

function StatusBadge({ enabled }) {
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

// ─── Feature Card (inside expanded section) ─────────────────────────

function FeatureCard({ feature, sectionId, enabled, onToggle, sectionEnabled }) {
  const navigate = useNavigate();
  const isClickable = enabled;
  // Feature toggle is locked when section is disabled
  const isToggleLocked = !sectionEnabled;

  const handleClick = () => {
    if (isClickable) {
      navigate(feature.route);
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    // Prevent toggle if section is disabled
    if (!isToggleLocked) {
      onToggle();
    }
  };

  return (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${
        enabled
          ? 'bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm cursor-pointer group'
          : 'bg-gray-50 border-gray-200 cursor-not-allowed'
      } ${!enabled ? 'opacity-75' : ''}`}
      onClick={handleClick}
    >
      {/* Header: Name + Toggle */}
      <div className={`flex items-center justify-between gap-2 px-3 sm:px-4 pt-3 sm:pt-4 pb-2 border-b ${
        enabled ? 'border-gray-100' : 'border-gray-200'
      }`}>
        <h4 className={`text-sm font-semibold truncate flex-1 min-w-0 ${enabled ? 'text-gray-800' : 'text-gray-400'}`}>
          {feature.label}
        </h4>
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {isToggleLocked ? (
            // Locked state - show lock icon instead of toggle
            <div className="w-9 h-5 flex items-center justify-center text-gray-400" title="Enable the module first">
              <AiOutlineLock size={14} />
            </div>
          ) : (
            <ToggleSwitch enabled={enabled} onToggle={handleToggle} size="sm" />
          )}
        </div>
      </div>

      {/* Content Area: Status + Overlay (disabled state shown here) */}
      <div className="relative p-3 sm:p-4">
        {/* Disabled Overlay - only covers content area, NOT the toggle */}
        {!enabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-gray-100/50 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-1.5 px-4 py-2.5 bg-white rounded-lg shadow-sm border border-gray-200 pointer-events-none">
              {!sectionEnabled ? (
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

        {/* Status Badge (visible when enabled) */}
        <StatusBadge enabled={enabled} />

        {/* Arrow indicator (visible only when enabled) */}
        {enabled && (
          <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Open <AiOutlineRight size={11} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Card ───────────────────────────────────────────────────

function ServiceCategory({ category }) {
  const { isSectionEnabled, toggleSection, isFeatureEnabled, toggleFeature, isMasterEnabled } = useSM();
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(null);

  const masterOn = isMasterEnabled();
  const sectionOn = isSectionEnabled(category.id);
  const enabledFeatureCount = category.features.filter((f) => isFeatureEnabled(category.id, f.id)).length;
  // Section toggle is locked when master is OFF
  const isSectionLocked = !masterOn;

  const handleToggleSection = useCallback(() => {
    // Prevent toggling when master is OFF
    if (isSectionLocked) {
      setToast('Enable Sales & Marketing master first');
      setTimeout(() => setToast(null), 2500);
      return;
    }
    const newVal = !isSectionEnabled(category.id);
    toggleSection(category.id);
    setToast(`${category.name} ${newVal ? 'enabled' : 'disabled'}`);
    setTimeout(() => setToast(null), 2500);
  }, [toggleSection, isSectionEnabled, isSectionLocked, category]);

  const handleToggleFeature = useCallback((featureId, featureLabel) => {
    // Prevent toggling features when section is disabled
    if (!isSectionEnabled(category.id)) return;
    
    const newVal = !isFeatureEnabled(category.id, featureId);
    toggleFeature(category.id, featureId);
    setToast(`${featureLabel} ${newVal ? 'enabled' : 'disabled'}`);
    setTimeout(() => setToast(null), 2000);
  }, [toggleFeature, isFeatureEnabled, category]);

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl shadow-lg whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}

      <div
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 ${
          sectionOn ? 'border-gray-200' : 'border-gray-200'
        }`}
      >
        {/* ─── Section Header ─── */}
        <div
          className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-colors ${
            sectionOn ? '' : 'bg-gray-50/80'
          }`}
        >
          {/* Color Icon Dot */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              sectionOn ? 'shadow-sm' : 'opacity-40 grayscale'
            }`}
            style={{ backgroundColor: sectionOn ? category.color + '18' : '#e5e7eb' }}
          >
            <div style={{ color: sectionOn ? category.color : '#9ca3af' }}>
              {category.icon}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold text-gray-800 text-sm sm:text-base ${!sectionOn ? 'opacity-40' : ''}`}>
                {category.name}
              </h3>
              <StatusBadge enabled={sectionOn} />
            </div>
            <p className={`text-xs mt-0.5 ${sectionOn ? 'text-gray-400' : 'text-gray-300'}`}>
              {category.subtitle} · {enabledFeatureCount}/{category.features.length} features active
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isSectionLocked ? (
              // Locked state - show lock icon when master is OFF
              <div className="w-11 h-6 flex items-center justify-center text-gray-400" title="Enable Sales & Marketing master first">
                <AiOutlineLock size={18} />
              </div>
            ) : (
              <ToggleSwitch enabled={sectionOn} onToggle={handleToggleSection} size="md" />
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                expanded ? 'bg-gray-100 rotate-90' : 'hover:bg-gray-50'
              }`}
            >
              <AiOutlineRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ─── Disabled Overlay for entire section ─── */}
        {!sectionOn && (
          <div className="relative border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-center py-12 px-6">
              <div className="text-center max-w-sm">
                {/* Large Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
                  <AiOutlineTool size={28} className="text-amber-500" />
                </div>
                {/* Message */}
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  This module is currently disabled
                </p>
                <p className="text-xs text-gray-400">
                  Enable "{category.name}" to access all {category.features.length} features
                </p>
                {/* Enable Button */}
                <button
                  onClick={handleToggleSection}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium shadow-sm"
                >
                  <AiOutlineCheck size={16} />
                  Enable Module
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Expanded Features Grid ─── */}
        {expanded && sectionOn && (
          <div className="border-t border-gray-100 bg-gray-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
              {category.features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  sectionId={category.id}
                  sectionEnabled={sectionOn}
                  enabled={isFeatureEnabled(category.id, feature.id)}
                  onToggle={() => handleToggleFeature(feature.id, feature.label)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Master Section Toggle (top of page) ────────────────────────────

function MasterToggle() {
  const { isMasterEnabled, toggleMaster, setMaster, isSectionEnabled } = useSM();
  const [toast, setToast] = useState(null);

  const masterOn = isMasterEnabled();
  const allEnabled = SM_MODULES.every((m) => isSectionEnabled(m.id));
  const someEnabled = SM_MODULES.some((m) => isSectionEnabled(m.id));

  const handleToggleAll = () => {
    toggleMaster();
    const newVal = !masterOn;
    setToast(newVal ? 'Sales & Marketing enabled' : 'Sales & Marketing disabled — all features locked');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="relative">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">S&M</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">Sales & Marketing</h2>
              <p className="text-xs text-gray-400 mt-0.5">Module configuration and feature management</p>
            </div>
          </div>

          {/* Right: Master Toggle + Stats */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Stats pill */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500">
                {SM_MODULES.filter((m) => isSectionEnabled(m.id)).length}/{SM_MODULES.length} sections
              </span>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(SM_MODULES.filter((m) => isSectionEnabled(m.id)).length / SM_MODULES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Master toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-xs hidden sm:inline ${!masterOn ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                {!masterOn ? 'All Disabled' : allEnabled ? 'All Enabled' : someEnabled ? 'Partial' : 'All Disabled'}
              </span>
              <ToggleSwitch enabled={masterOn} onToggle={handleToggleAll} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl shadow-lg whitespace-nowrap">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

function SalesMarketingPage() {
  const { isSectionEnabled } = useSM();
  const enabledCount = SM_MODULES.filter((m) => isSectionEnabled(m.id)).length;
  const totalCount = SM_MODULES.length;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">S&M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Sales & Marketing</h1>
              <p className="text-xs text-gray-400">Configure module services</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500">{enabledCount}/{totalCount} enabled</span>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(enabledCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Master Toggle */}
        <MasterToggle />

        {/* Section Cards */}
        <div className="space-y-4">
          {SM_MODULES.map((category) => (
            <ServiceCategory
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalesMarketingPage;
