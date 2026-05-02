import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';

function SMModuleLayout({ title, subtitle, icon, color = '#296374', backTo = '/dashboard/sales-marketing', children, actions }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Top Header - Premium Style */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => navigate(backTo)}
            className="p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 flex-shrink-0 group"
            title="Back to Sales & Marketing"
          >
            <AiOutlineArrowLeft size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Icon + Title */}
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-105"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-800 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-400 truncate mt-0.5 hidden sm:block">{subtitle}</p>}
          </div>

          {/* Actions */}
          {actions && (
            <>
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>

              <div className="sm:hidden relative flex-shrink-0">
                <button aria-label="Open actions" onClick={() => setMenuOpen(o => !o)} className="p-2 rounded-xl hover:bg-gray-50">⋯</button>
                {menuOpen && (
                  <div ref={menuRef} className="fixed top-16 left-2 right-2 bg-white shadow-lg rounded-md p-3 z-50 max-h-[60vh] overflow-auto">
                    <div className="flex justify-end mb-2">
                      <button onClick={() => setMenuOpen(false)} className="px-2 py-1 text-sm rounded hover:bg-gray-100">Close</button>
                    </div>
                    <div className="space-y-2">{actions}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}

export default SMModuleLayout;
