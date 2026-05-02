import React, { useState, useMemo } from 'react';
import { AiOutlineClose, AiOutlineUser, AiOutlineTeam, AiOutlineUserAdd, AiOutlineRocket, AiOutlineSetting } from 'react-icons/ai';
import DynamicForm from '../../core-crm/components/DynamicForm';
import CustomizeFieldsDrawer from '../../core-crm/components/CustomizeFieldsDrawer';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';

const QuickCreateDrawer = ({ isOpen, onClose }) => {
  const { 
    contactFieldGroups, 
    setContactFieldGroups,
    accountFieldGroups, 
    setAccountFieldGroups,
    addContact, 
    addAccount 
  } = useCRM();
  const { showToast } = useSMMToast();
  const [activeType, setActiveType] = useState('lead'); // 'lead', 'contact', 'account'
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const entityTypes = [
    { id: 'lead', label: 'Lead', icon: <AiOutlineRocket />, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'contact', label: 'Contact', icon: <AiOutlineUserAdd />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'account', label: 'Account', icon: <AiOutlineTeam />, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const currentFieldGroups = useMemo(() => {
    if (activeType === 'account') return accountFieldGroups;
    return contactFieldGroups;
  }, [activeType, contactFieldGroups, accountFieldGroups]);

  const handleGroupsChange = (newGroups) => {
    if (activeType === 'account') {
      setAccountFieldGroups(newGroups);
    } else {
      setContactFieldGroups(newGroups);
    }
  };

  const handleSave = (values) => {
    console.log('Quick Create Saving:', activeType, values);
    
    if (activeType === 'account') {
      addAccount(values);
    } else {
      // For leads and contacts, we use the contact creation logic
      // but force status to 'lead' if that's what was selected
      const finalData = { 
        ...values, 
        status: activeType === 'lead' ? 'lead' : (values.status || 'active') 
      };
      addContact(finalData);
    }

    showToast(`${activeType.charAt(0).toUpperCase() + activeType.slice(1)} created successfully`, { type: 'success' });
    onClose();
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-[500px] bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Quick Create</h2>
              <button 
                onClick={() => setIsCustomizeOpen(true)}
                className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                title="Customize Fields"
              >
                <AiOutlineSetting size={18} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mt-1">Add new record instantly</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 border border-transparent hover:border-gray-100 shadow-sm">
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Entity Switcher */}
        <div className="px-8 py-6 grid grid-cols-3 gap-3">
          {entityTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeType === type.id ? 'bg-white border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
            >
              <div className={`p-2 rounded-xl ${activeType === type.id ? type.bg + ' ' + type.color : 'bg-white'}`}>
                {React.cloneElement(type.icon, { size: 20 })}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${activeType === type.id ? 'text-primary' : ''}`}>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <DynamicForm
            key={activeType} // Force re-render on type change
            fieldGroups={currentFieldGroups}
            onSubmit={handleSave}
            onCancel={onClose}
            submitLabel={`Create ${activeType.charAt(0).toUpperCase() + activeType.slice(1)}`}
            cancelLabel="Cancel"
            cols={1}
            hideSidebar={true}
          />
        </div>
      </div>

      <CustomizeFieldsDrawer
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        groups={currentFieldGroups}
        onGroupsChange={handleGroupsChange}
        zIndex={80} // Higher than quick create drawer
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default QuickCreateDrawer;
