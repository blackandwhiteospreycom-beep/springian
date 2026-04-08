import React, { useState, useCallback } from 'react';
import { Responsive } from 'react-grid-layout';
import { useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useDashboard, WIDGET_TYPES } from '../../context/DashboardContext';
import WidgetFactory from '../components/WidgetFactory';
import SettingsPanel from '../components/SettingsPanel';
import NavigationManager from '../components/NavigationManager';
import { widgetRegistry, widgetCategories } from '../utils/widgetRegistry';
import { 
  AiOutlinePlus, 
  AiOutlineSave, 
  AiOutlineDelete, 
  AiOutlineDownload, 
  AiOutlineUpload,
  AiOutlineEdit,
  AiOutlineMenu,
  AiOutlineAppstore,
  AiOutlineLayout,
} from 'react-icons/ai';

const NAV_ITEM_TYPE = 'NAV_ITEM';
const EXISTING_ROUTE_TYPE = 'EXISTING_ROUTE';

const ResponsiveGridLayout = Responsive;

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

const DashboardBuilderContent = () => {
  const containerWidth = useContainerWidth();
  const {
    widgets,
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

  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [showNavManager, setShowNavManager] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isImporting, setIsImporting] = useState(false);

  // Drop handler for navigation items onto dashboard
  const [{ isOver }, drop] = useDrop({
    accept: [NAV_ITEM_TYPE, EXISTING_ROUTE_TYPE],
    drop: (data) => {
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

  return (
    <div className="dashboard-builder min-h-screen bg-gray-100">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3 gap-2">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setShowNavManager(!showNavManager)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  showNavManager ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Navigation Manager"
              >
                <AiOutlineMenu size={20} />
              </button>
              <div className="flex items-center gap-2 min-w-0">
                <AiOutlineLayout className="text-primary flex-shrink-0 hidden sm:block" size={24} />
                <input
                  type="text"
                  value={dashboardTitle}
                  onChange={(e) => setDashboardTitle(e.target.value)}
                  className="text-base sm:text-lg font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 bg-transparent truncate max-w-[120px] sm:max-w-none"
                  placeholder="Dashboard Title"
                />
              </div>
            </div>

            {/* Mobile action buttons row */}
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
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setShowWidgetPanel(!showWidgetPanel)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-xs sm:text-sm"
            >
              <AiOutlinePlus size={16} />
              <span className="hidden sm:inline">Add Widget</span>
            </button>

            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all text-xs sm:text-sm ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <AiOutlineEdit size={16} />
              <span className="hidden sm:inline">{isEditMode ? 'Editing' : 'Edit'}</span>
            </button>

            <div className="h-6 w-px bg-gray-300 hidden sm:block" />

            <button
              onClick={exportLayout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Export Layout"
            >
              <AiOutlineDownload size={18} />
            </button>

            <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer" title="Import Layout">
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
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              title="Reset Dashboard"
            >
              <AiOutlineDelete size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay Backdrop */}
      {showNavManager && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setShowNavManager(false)}
        />
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Navigation Manager Sidebar */}
        {showNavManager && (
          <div className={`
            bg-white overflow-y-auto z-50
            fixed inset-y-0 left-0 w-full sm:w-80
            sm:relative sm:inset-auto sm:border-r sm:border-gray-200 sm:min-h-[calc(100vh-64px)] sm:sticky sm:top-16
            shadow-2xl sm:shadow-none
          `}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-0">
                <h3 className="font-semibold text-gray-800">Navigation</h3>
                <button
                  onClick={() => setShowNavManager(false)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <NavigationManager />
            </div>
          </div>
        )}

        {/* Main Dashboard Area */}
        <div ref={drop} className={`flex-1 p-3 sm:p-6 transition-all ${isOver ? 'bg-primary bg-opacity-5' : ''}`}>
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
                      Your dashboard is empty
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Click "Add Widget" to start building your custom dashboard
                    </p>
                    <button
                      onClick={() => setShowWidgetPanel(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Add Your First Widget
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

          {/* Drag Overlay - shows when dragging nav items (desktop only) */}
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

        {/* Widget Selection Panel */}
        {showWidgetPanel && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
              onClick={() => setShowWidgetPanel(false)}
            />
            <div className={`
              bg-white overflow-y-auto z-50
              fixed inset-y-0 right-0 w-full sm:w-80
              sm:relative sm:inset-auto sm:border-l sm:border-gray-200 sm:min-h-[calc(100vh-64px)] sm:sticky sm:top-16
              shadow-2xl sm:shadow-none
            `}>
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <AiOutlineAppstore size={18} />
                    Widget Library
                  </h3>
                  <button
                    onClick={() => setShowWidgetPanel(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg sm:hidden"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {widgetCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget List */}
              <div className="space-y-2">
                {filteredWidgets.map(([type, info]) => (
                  <button
                    key={type}
                    onClick={() => handleAddWidget(type)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-colors">
                        <AiOutlinePlus className="text-primary" size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">{info.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Default: {info.defaultSize.w}×{info.defaultSize.h}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
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
