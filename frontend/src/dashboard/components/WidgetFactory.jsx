import React from 'react';
import { WIDGET_TYPES } from '../../context/DashboardContext';
import WidgetWrapper from './WidgetWrapper';
import StatsCardWidget from './widgets/StatsCardWidget';
import ChartWidget from './widgets/ChartWidget';
import TableWidget from './widgets/TableWidget';
import TextWidget from './widgets/TextWidget';
import ImageWidget from './widgets/ImageWidget';
import MetricWidget from './widgets/MetricWidget';
import LinkWidget from './widgets/LinkWidget';
import SettingsSectionWidget from './widgets/SettingsSectionWidget';
import SettingsToggleWidget from './widgets/SettingsToggleWidget';
import SettingsProfileWidget from './widgets/SettingsProfileWidget';
import SettingsSecurityWidget from './widgets/SettingsSecurityWidget';
import SettingsNotificationsWidget from './widgets/SettingsNotificationsWidget';
import SettingsBillingWidget from './widgets/SettingsBillingWidget';
import UsersTableWidget from './widgets/UsersTableWidget';
import ServicesTableWidget from './widgets/ServicesTableWidget';
import ServiceQuickStatsWidget from './widgets/ServiceQuickStatsWidget';
import AnalyticsStatsWidget from './widgets/AnalyticsStatsWidget';
import UserStatsWidget from './widgets/UserStatsWidget';

const widgetComponents = {
  [WIDGET_TYPES.STATS_CARD]: StatsCardWidget,
  [WIDGET_TYPES.CHART]: ChartWidget,
  [WIDGET_TYPES.TABLE]: TableWidget,
  [WIDGET_TYPES.TEXT]: TextWidget,
  [WIDGET_TYPES.IMAGE]: ImageWidget,
  [WIDGET_TYPES.METRIC]: MetricWidget,
  [WIDGET_TYPES.LINK]: LinkWidget,
  settingsSection: SettingsSectionWidget,
  settingsToggle: SettingsToggleWidget,
  settingsProfile: SettingsProfileWidget,
  settingsSecurity: SettingsSecurityWidget,
  settingsNotifications: SettingsNotificationsWidget,
  settingsBilling: SettingsBillingWidget,
  usersTable: UsersTableWidget,
  servicesTable: ServicesTableWidget,
  serviceQuickStats: ServiceQuickStatsWidget,
  analyticsStats: AnalyticsStatsWidget,
  userStats: UserStatsWidget,
};

const WidgetFactory = ({ 
  widget, 
  isEditMode = false, 
  onSettings, 
  onRemove 
}) => {
  const WidgetComponent = widgetComponents[widget.type];

  if (!WidgetComponent) {
    return (
      <WidgetWrapper widget={widget} isEditMode={isEditMode}>
        <div className="flex items-center justify-center h-full text-gray-500">
          Unknown widget type: {widget.type}
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper 
      widget={widget} 
      isEditMode={isEditMode}
      onSettings={onSettings}
      onRemove={onRemove}
    >
      <WidgetComponent config={widget.config} widget={widget} />
    </WidgetWrapper>
  );
};

export default WidgetFactory;
