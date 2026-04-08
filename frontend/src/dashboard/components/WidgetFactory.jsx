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

const widgetComponents = {
  [WIDGET_TYPES.STATS_CARD]: StatsCardWidget,
  [WIDGET_TYPES.CHART]: ChartWidget,
  [WIDGET_TYPES.TABLE]: TableWidget,
  [WIDGET_TYPES.TEXT]: TextWidget,
  [WIDGET_TYPES.IMAGE]: ImageWidget,
  [WIDGET_TYPES.METRIC]: MetricWidget,
  [WIDGET_TYPES.LINK]: LinkWidget,
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
