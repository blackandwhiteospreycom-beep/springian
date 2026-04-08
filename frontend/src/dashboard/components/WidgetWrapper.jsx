import React from 'react';
import { AiOutlineSetting, AiOutlineClose, AiOutlineDrag } from 'react-icons/ai';

const WidgetWrapper = ({ 
  widget, 
  children, 
  onSettings, 
  onRemove, 
  isEditMode = false 
}) => {
  return (
    <div 
      className="widget-wrapper bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col border border-gray-200 hover:border-primary transition-all duration-200"
      data-widget-id={widget.id}
    >
      {/* Widget Header - Drag Handle */}
      <div 
        className="widget-header flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 border-b border-gray-200 cursor-move react-grid-item-drag-handle"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <AiOutlineDrag className="text-gray-400 flex-shrink-0 hidden sm:block" />
          <h3 className="font-semibold text-gray-800 truncate text-xs sm:text-sm">
            {widget.config.title || 'Untitled Widget'}
          </h3>
        </div>
        
        {/* Widget Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {isEditMode && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings?.(widget);
                }}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Widget Settings"
              >
                <AiOutlineSetting className="text-gray-600" size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.(widget.id);
                }}
                className="p-1.5 hover:bg-red-100 rounded transition-colors group"
                title="Remove Widget"
              >
                <AiOutlineClose className="text-gray-600 group-hover:text-red-600" size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="widget-content flex-1 p-2 sm:p-4 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default WidgetWrapper;
