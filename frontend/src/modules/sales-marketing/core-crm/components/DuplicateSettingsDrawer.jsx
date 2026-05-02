import React, { useState, useEffect } from 'react';
import { AiOutlineClose, AiOutlineReload, AiOutlineSetting } from 'react-icons/ai';
import DynamicForm from '../components/DynamicForm';
import CustomizeFieldsDrawer from './CustomizeFieldsDrawer';
import { useCRM } from '../context/CRMContext';

const DuplicateSettingsDrawer = ({ open, onClose, settings, onSave }) => {
  const { duplicateFieldGroups, setDuplicateFieldGroups } = useCRM();
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings || {});
    }
  }, [open, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 z-[60] w-full sm:w-[480px] max-w-[92vw] bg-white rounded-l-3xl shadow-2xl border-l border-gray-100 transition-transform duration-500 ease-in-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <AiOutlineSetting size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">Matching Configuration</h3>
                <button 
                  onClick={() => setIsCustomizeOpen(true)}
                  className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                  title="Customize Fields"
                >
                  <AiOutlineSetting size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Advanced Detection Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-600">
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <DynamicForm
            fieldGroups={duplicateFieldGroups}
            initialValues={localSettings}
            onValuesChange={setLocalSettings}
            hideSidebar={true}
            cols={1}
            showFooter={false} // We'll use our own footer
          />
        </div>

        {/* Fixed Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all border border-gray-200 rounded-xl bg-white"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Apply Changes
            </button>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <AiOutlineReload className="animate-spin-slow" />
            <span>Changes take effect on the next database scan.</span>
          </div>
        </div>
      </div>

      <CustomizeFieldsDrawer
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        groups={duplicateFieldGroups}
        onGroupsChange={setDuplicateFieldGroups}
        zIndex={70} // Higher than settings drawer
      />

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </>
  );
};

export default DuplicateSettingsDrawer;
