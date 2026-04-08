import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDashboard } from '../../context/DashboardContext';
import { AiOutlinePlus, AiOutlineClose, AiOutlineDrag, AiOutlineLink } from 'react-icons/ai';

const NavItemType = 'NAV_ITEM';

const DraggableNavItem = ({ item, index, moveItem }) => {
  const { removeNavItem, updateNavItem } = useDashboard();
  const [{ isDragging }, drag] = useDrag({
    type: NavItemType,
    item: { id: item.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: NavItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-primary transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <AiOutlineDrag className="text-gray-400 cursor-move flex-shrink-0" />
      <input
        type="text"
        value={item.label}
        onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="Link label"
      />
      <input
        type="text"
        value={item.url}
        onChange={(e) => updateNavItem(item.id, { url: e.target.value })}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder="URL"
      />
      <button
        onClick={() => removeNavItem(item.id)}
        className="p-1.5 hover:bg-red-100 rounded transition-colors group flex-shrink-0"
        title="Remove"
      >
        <AiOutlineClose className="text-gray-600 group-hover:text-red-600" size={16} />
      </button>
    </div>
  );
};

const NavigationBuilder = () => {
  const { navItems, addNavItem, reorderNavItems } = useDashboard();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '#' });

  const moveItem = (fromIndex, toIndex) => {
    const updatedItems = [...navItems];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    reorderNavItems(updatedItems);
  };

  const handleAdd = () => {
    if (newItem.label.trim()) {
      addNavItem(newItem);
      setNewItem({ label: '', url: '#' });
      setIsAdding(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="navigation-builder bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <AiOutlineLink size={18} />
            Navigation Items
          </h3>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm"
          >
            <AiOutlinePlus size={16} />
            Add Item
          </button>
        </div>

        {isAdding && (
          <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Label"
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <input
                type="text"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="URL"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {navItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              <AiOutlineLink size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No navigation items yet</p>
              <p className="text-xs mt-1">Click "Add Item" to create one</p>
            </div>
          ) : (
            navItems.map((item, index) => (
              <DraggableNavItem
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
              />
            ))
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Drag items to reorder them. Changes are saved automatically.
          </p>
        </div>
      </div>
    </DndProvider>
  );
};

export default NavigationBuilder;
