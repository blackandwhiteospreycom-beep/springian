import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useDashboard, WIDGET_TYPES } from '../../context/DashboardContext';
import { 
  AiOutlinePlus, AiOutlineClose, AiOutlineDrag, AiOutlineLink,
  AiOutlineHome, AiOutlineSetting, AiOutlineTeam, AiOutlineBarChart,
  AiOutlineDashboard, AiOutlineUser, AiOutlineShop, AiOutlineEdit,
  AiOutlineCheck
} from 'react-icons/ai';

const NAV_ITEM_TYPE = 'NAV_ITEM';
const EXISTING_ROUTE_TYPE = 'EXISTING_ROUTE';

// Define all existing routes in the app
const existingRoutes = [
  { path: '/', label: 'Home', icon: 'home', isInternal: true },
  { path: '/admin', label: 'Admin Dashboard', icon: 'dashboard', isInternal: true },
  { path: '/admin/services', label: 'Services', icon: 'shop', isInternal: true },
  { path: '/admin/users', label: 'Users', icon: 'team', isInternal: true },
  { path: '/admin/analytics', label: 'Analytics', icon: 'chart', isInternal: true },
  { path: '/admin/settings', label: 'Settings', icon: 'setting', isInternal: true },
  { path: '/sm/core-crm/contacts', label: 'Contacts', icon: 'team', isInternal: true },
  { path: '/sm/core-crm/accounts', label: 'Accounts', icon: 'shop', isInternal: true },
  { path: '/sm/core-crm/leads', label: 'Leads', icon: 'user', isInternal: true },
  { path: '/sm/core-crm/deals', label: 'Deals', icon: 'chart', isInternal: true },
  { path: '/sm/core-crm/interactions', label: 'Interactions', icon: 'chart', isInternal: true },
  { path: '/sm/core-crm/activity-timeline', label: 'Timeline', icon: 'chart', isInternal: true },
  { path: '/sm/core-crm/communication-logs', label: 'Logs', icon: 'chart', isInternal: true },
  { path: '/sm/core-crm/data-enrichment', label: 'Enrichment', icon: 'chart', isInternal: true },
  { path: '/sm/lead-management/scoring', label: 'Lead Scoring', icon: 'chart', isInternal: true },
  { path: '/login', label: 'Login', icon: 'user', isInternal: true },
  { path: '/signup', label: 'Sign Up', icon: 'user', isInternal: true },
];

const iconMap = {
  link: <AiOutlineLink size={20} style={{ color: '#296374' }} />,
  home: <AiOutlineHome size={20} style={{ color: '#296374' }} />,
  settings: <AiOutlineSetting size={20} style={{ color: '#296374' }} />,
  setting: <AiOutlineSetting size={20} style={{ color: '#296374' }} />,
  team: <AiOutlineTeam size={20} style={{ color: '#296374' }} />,
  chart: <AiOutlineBarChart size={20} style={{ color: '#296374' }} />,
  dashboard: <AiOutlineDashboard size={20} style={{ color: '#296374' }} />,
  user: <AiOutlineUser size={20} style={{ color: '#296374' }} />,
  shop: <AiOutlineShop size={20} style={{ color: '#296374' }} />,
};

const DraggableRoute = ({ route, onAddToDashboard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: EXISTING_ROUTE_TYPE,
    item: { type: EXISTING_ROUTE_TYPE, route },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToDashboard?.({
      label: route.label,
      url: route.path,
      icon: route.icon,
      description: `Navigate to ${route.label}`,
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
      <AiOutlineDrag className="text-gray-400 flex-shrink-0 hidden sm:block" />
      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
        {iconMap[route.icon] || <AiOutlineLink size={18} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{route.label}</div>
        <div className="text-xs text-gray-500 truncate">{route.path}</div>
      </div>
      {/* Mobile: Add button | Desktop: hint text */}
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

// Draggable custom nav item
const DraggableNavItem = ({ item, index, moveItem, updateItem, removeItem, onAddToDashboard }) => {
  const [{ isDragging }, drag] = useDrag({
    type: NAV_ITEM_TYPE,
    item: { type: NAV_ITEM_TYPE, item, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToDashboard?.({
      label: item.label,
      url: item.url,
      icon: item.icon,
      description: '',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const [, drop] = useDrop({
    accept: NAV_ITEM_TYPE,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ label: item.label, url: item.url });

  const handleSave = () => {
    updateItem(item.id, editData);
    setIsEditing(false);
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <AiOutlineDrag className="text-gray-400 cursor-grab flex-shrink-0" />
      
      {isEditing ? (
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={editData.label}
            onChange={(e) => setEditData({ ...editData, label: e.target.value })}
            className="flex-1 min-w-[60px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Label"
          />
          <input
            type="text"
            value={editData.url}
            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
            className="flex-1 min-w-[60px] px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="URL"
          />
          <button onClick={handleSave} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700">
            <AiOutlineCheck size={16} />
          </button>
          <button onClick={() => setIsEditing(false)} className="p-1.5 bg-gray-300 rounded hover:bg-gray-400">
            <AiOutlineClose size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {iconMap[item.icon] || <AiOutlineLink size={18} style={{ color: '#296374' }} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-500 truncate">{item.url}</div>
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
          <button
            onClick={() => {
              setEditData({ label: item.label, url: item.url });
              setIsEditing(true);
            }}
            className="hidden sm:block p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Edit"
          >
            <AiOutlineEdit size={14} className="text-gray-600" />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 hover:bg-red-100 rounded transition-colors group"
            title="Remove"
          >
            <AiOutlineClose size={14} className="text-gray-600 group-hover:text-red-600" />
          </button>
        </>
      )}
    </div>
  );
};

const NavigationManager = () => {
  return <NavigationManagerContent />;
};

const NavigationManagerContent = () => {
  const { navItems, addNavItem, reorderNavItems, updateNavItem, removeNavItem, addWidget } = useDashboard();

  const handleAddToDashboard = (sourceData) => {
    // Check if widget with same URL already exists
    const existingWidgets = JSON.parse(localStorage.getItem('dashboard_layout') || '[]');
    const exists = existingWidgets.find(
      (w) => w.type === WIDGET_TYPES.LINK && w.config.url === sourceData.url
    );

    if (exists) {
      return; // Don't add duplicate
    }

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
      url: sourceData.url,
      description: sourceData.description || '',
      icon: sourceData.icon || 'link',
      color: sourceData.color || '#296374',
      openInNewTab: false,
    });
  };
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '#', icon: 'link' });
  const [activeTab, setActiveTab] = useState('existing');

  const moveItem = (fromIndex, toIndex) => {
    const updatedItems = [...navItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    reorderNavItems(updatedItems);
  };

  const handleAdd = () => {
    if (newItem.label.trim()) {
      addNavItem(newItem);
      setNewItem({ label: '', url: '#', icon: 'link' });
      setIsAdding(false);
    }
  };

  return (
    <div className="navigation-manager">
      <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800">
          <strong>Mobile:</strong> Tap the "+ Add" button. <strong>Desktop:</strong> Drag items onto the dashboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('existing')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'existing'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Existing Routes
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'custom'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Custom Links ({navItems.length})
        </button>
      </div>

      {/* Existing Routes Tab */}
      {activeTab === 'existing' && (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-gray-500">
            Drag any route onto the dashboard to add it as a link widget
          </p>
          {existingRoutes.map((route, index) => (
            <DraggableRoute key={index} route={route} onAddToDashboard={handleAddToDashboard} />
          ))}
        </div>
      )}

      {/* Custom Links Tab */}
      {activeTab === 'custom' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-gray-700">Custom Navigation</h4>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-opacity-90"
            >
              <AiOutlinePlus size={14} />
              Add
            </button>
          </div>

          {isAdding && (
            <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg">
              <div className="space-y-2 mb-2">
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Label"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                />
                <input
                  type="text"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="URL"
                />
                <select
                  value={newItem.icon}
                  onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="link">Link</option>
                  <option value="home">Home</option>
                  <option value="settings">Settings</option>
                  <option value="team">Team</option>
                  <option value="chart">Chart</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="user">User</option>
                  <option value="shop">Shop</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {navItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-sm">No custom links yet</p>
                <p className="text-xs mt-1">Click "Add" to create one</p>
              </div>
            ) : (
              navItems.map((item, index) => (
                <DraggableNavItem
                  key={item.id}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  updateItem={updateNavItem}
                  removeItem={removeNavItem}
                  onAddToDashboard={handleAddToDashboard}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Drag routes or links from here directly onto the dashboard grid to create link widgets.
        </p>
      </div>
    </div>
  );
};

export default NavigationManager;
