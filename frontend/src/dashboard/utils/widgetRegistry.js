import { WIDGET_TYPES } from '../../context/DashboardContext';

export const widgetRegistry = {
  [WIDGET_TYPES.STATS_CARD]: {
    label: 'Stats Card',
    description: 'Display a single statistic with an icon',
    defaultSize: { w: 3, h: 3 },
    category: 'metrics',
  },
  [WIDGET_TYPES.CHART]: {
    label: 'Chart',
    description: 'Bar, line, or pie chart visualization',
    defaultSize: { w: 6, h: 6 },
    category: 'visualization',
  },
  [WIDGET_TYPES.TABLE]: {
    label: 'Data Table',
    description: 'Sortable, searchable data table',
    defaultSize: { w: 8, h: 6 },
    category: 'data',
  },
  [WIDGET_TYPES.TEXT]: {
    label: 'Text Block',
    description: 'Rich text content area',
    defaultSize: { w: 4, h: 3 },
    category: 'content',
  },
  [WIDGET_TYPES.IMAGE]: {
    label: 'Image',
    description: 'Image display widget',
    defaultSize: { w: 4, h: 4 },
    category: 'media',
  },
  [WIDGET_TYPES.METRIC]: {
    label: 'Metric',
    description: 'KPI metric with trend indicator',
    defaultSize: { w: 3, h: 3 },
    category: 'metrics',
  },
  [WIDGET_TYPES.LINK]: {
    label: 'Navigation Link',
    description: 'Clickable link to any page or URL',
    defaultSize: { w: 3, h: 3 },
    category: 'navigation',
  },
};

export const widgetCategories = [
  { id: 'metrics', label: 'Metrics', icon: 'trending_up' },
  { id: 'visualization', label: 'Visualizations', icon: 'chart' },
  { id: 'data', label: 'Data', icon: 'table' },
  { id: 'content', label: 'Content', icon: 'text' },
  { id: 'media', label: 'Media', icon: 'image' },
  { id: 'navigation', label: 'Navigation', icon: 'link' },
];

export const chartTypes = [
  { id: 'bar', label: 'Bar Chart' },
  { id: 'line', label: 'Line Chart' },
  { id: 'pie', label: 'Pie Chart' },
  { id: 'area', label: 'Area Chart' },
];

export const textSizes = [
  { id: 'small', label: 'Small', class: 'text-sm' },
  { id: 'medium', label: 'Medium', class: 'text-base' },
  { id: 'large', label: 'Large', class: 'text-lg' },
  { id: 'xlarge', label: 'Extra Large', class: 'text-xl' },
];

export const imageFitOptions = [
  { id: 'cover', label: 'Cover' },
  { id: 'contain', label: 'Contain' },
  { id: 'fill', label: 'Fill' },
  { id: 'none', label: 'None' },
];

export const trendOptions = [
  { id: 'up', label: 'Up', color: 'text-green-500' },
  { id: 'down', label: 'Down', color: 'text-red-500' },
  { id: 'neutral', label: 'Neutral', color: 'text-gray-500' },
];
