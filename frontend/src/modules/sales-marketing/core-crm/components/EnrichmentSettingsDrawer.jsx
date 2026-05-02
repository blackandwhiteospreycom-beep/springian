import React, { useState, useEffect, useMemo } from 'react';
import { AiOutlineClose, AiOutlineSetting } from 'react-icons/ai';
import DynamicForm from '../components/DynamicForm'; // Assuming DynamicForm is the component used for forms
import CustomizeFieldsDrawer from './CustomizeFieldsDrawer';
import { useCRM } from '../context/CRMContext';

const EnrichmentSettingsDrawer = ({ open, onClose, initialSettings, onSave }) => {
  const { enrichmentFieldGroups, setEnrichmentFieldGroups } = useCRM();
  const [settings, setSettings] = useState(initialSettings || {});
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(initialSettings || {});
    }
  }, [open, initialSettings]);

  const handleSettingChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] max-w-[92vw] bg-white rounded-l-2xl p-5 shadow-xl border-l border-gray-100 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">Enrichment Settings</h3>
            <button 
              onClick={() => setIsCustomizeOpen(true)}
              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
              title="Customize Fields"
            >
              <AiOutlineSetting size={18} />
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <AiOutlineClose size={20} />
          </button>
        </div>

        <div className="h-[calc(100vh-120px)] overflow-y-auto pr-3"> {/* Adjust height based on header/footer */}
          <DynamicForm
            fieldGroups={enrichmentFieldGroups}
            initialValues={settings}
            onSubmit={handleSave}
            onCancel={onClose}
            onValuesChange={handleSettingChange}
            submitLabel="Save Settings"
            cancelLabel="Cancel"
            hideSidebar={true}
            cols={1}
          />
        </div>
      </div>

      <CustomizeFieldsDrawer
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        groups={enrichmentFieldGroups}
        onGroupsChange={setEnrichmentFieldGroups}
        zIndex={60} // Higher than settings drawer
      />
    </>
  );
};

export default EnrichmentSettingsDrawer;
