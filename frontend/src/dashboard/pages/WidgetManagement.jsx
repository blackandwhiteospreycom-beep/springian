import React, { useState } from 'react';
import { Responsive } from 'react-grid-layout';
import { useDrop } from 'react-dnd';
import { useDashboard, WIDGET_TYPES } from '../../context/DashboardContext';
import WidgetFactory from '../components/WidgetFactory';
import { AiOutlineAppstore } from 'react-icons/ai';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const NAV_ITEM_TYPE = 'NAV_ITEM';
const EXISTING_ROUTE_TYPE = 'EXISTING_ROUTE';
const SERVICE_TYPE = 'SERVICE_WIDGET';

const ResponsiveGridLayout = Responsive;

function WidgetManagement() {
  const {
    widgets,
    addWidget,
    removeWidget,
    updateWidgetLayout,
    isEditMode,
    openSettings,
    gridConfig,
  } = useDashboard();
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => setContainerWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [{ isOver }, drop] = useDrop({
    accept: ['nav_item', NAV_ITEM_TYPE, EXISTING_ROUTE_TYPE, SERVICE_TYPE, 'WIDGET_ITEM'],
    drop: (data) => {
      // Handle widget item drag from side panel
      if (data.type === 'WIDGET_ITEM') {
        const wi = data.widgetInfo;
        const existing = widgets.find(w => w.type === wi.type);
        if (existing) return;

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

      // Handle nav item drag
      if (data.type === 'nav_item' || data.type === NAV_ITEM_TYPE || data.type === EXISTING_ROUTE_TYPE) {
        const isRoute = data.type === EXISTING_ROUTE_TYPE;
        const sourceData = isRoute ? data.route : (data.type === 'nav_item' ? data.item : data.item);
        const targetUrl = isRoute ? sourceData.path : sourceData.url;

        const existing = widgets.find(
          (w) => w.type === WIDGET_TYPES.LINK && w.config.url === targetUrl
        );
        if (existing) return;

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
        }, {
          title: sourceData.label,
          url: targetUrl,
          description: isRoute ? `Navigate to ${sourceData.label}` : (sourceData.description || ''),
          icon: sourceData.icon || 'link',
          color: sourceData.color || '#296374',
          openInNewTab: sourceData.openInNewTab || false,
        });
        return;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleLayoutChange = (layout) => {
    updateWidgetLayout(layout);
  };

  return (
    <div ref={drop} className={isOver ? 'bg-primary bg-opacity-5' : ''}>
      {widgets.length === 0 ? (
        <div className={`flex items-center justify-center min-h-[60vh] bg-white rounded-lg border-2 border-dashed transition-all ${
          isOver ? 'border-primary bg-opacity-20' : 'border-gray-300'
        }`}>
          <div className="text-center p-4">
            <AiOutlineAppstore size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Widget Library
            </h3>
            <p className="text-gray-500 mb-4">
              Drag navigation items, services, or widgets from the side panel to add them here
            </p>
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

      {isOver && widgets.length > 0 && (
        <div className="fixed inset-0 bg-primary bg-opacity-5 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-dashed border-primary">
            <AiOutlineAppstore size={48} className="mx-auto mb-4 text-primary animate-bounce" />
            <h3 className="text-xl font-semibold text-primary text-center">
              Drop to add as widget
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default WidgetManagement;
