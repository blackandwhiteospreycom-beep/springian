import React, { useState, useEffect, useMemo } from 'react';
import { 
  AiOutlineClose, AiOutlinePlus, AiOutlineDrag, AiOutlineSetting, 
  AiOutlineEye, AiOutlineSave, AiOutlineThunderbolt, AiOutlineDelete,
  AiOutlineBgColors, AiOutlineFontSize, AiOutlineBorderInner,
  AiOutlineSearch, AiOutlineStar, AiOutlineGlobal, AiOutlineMail,
  AiOutlinePhone, AiOutlineUser, AiOutlineBank, AiOutlineTag,
  AiOutlineLink, AiOutlineDesktop, AiOutlineTablet, AiOutlineMobile,
  AiOutlineSafety, AiOutlineBranches, AiOutlineNotification, AiOutlineCheck,
  AiOutlineArrowRight, AiOutlineCode, AiOutlineForm, AiOutlineRocket,
  AiOutlineCheckCircle
} from 'react-icons/ai';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';

const FIELD_CATEGORIES = [
  {
    id: 'basic',
    name: 'Basic Fields',
    fields: [
      { type: 'text', label: 'Short Text', icon: 'T' },
      { type: 'textarea', label: 'Long Text', icon: '¶' },
      { type: 'email', label: 'Email Address', icon: <AiOutlineMail />, mapping: 'email' },
      { type: 'phone', label: 'Phone Number', icon: <AiOutlinePhone />, mapping: 'phone' },
      { type: 'dropdown', label: 'Dropdown', icon: '▾' },
    ]
  },
  {
    id: 'business',
    name: 'Business Fields',
    fields: [
      { type: 'text', label: 'Company Name', icon: <AiOutlineBank />, mapping: 'account_name' },
      { type: 'text', label: 'Job Title', icon: <AiOutlineUser />, mapping: 'title' },
      { type: 'dropdown', label: 'Industry', icon: <AiOutlineGlobal />, mapping: 'industry' },
      { type: 'number', label: 'Company Size', icon: '#', mapping: 'employee_count' },
    ]
  },
  {
    id: 'tracking',
    name: 'Tracking Fields',
    fields: [
      { type: 'hidden', label: 'UTM Source', icon: <AiOutlineLink />, mapping: 'utm_source' },
      { type: 'hidden', label: 'UTM Campaign', icon: <AiOutlineLink />, mapping: 'utm_campaign' },
      { type: 'hidden', label: 'Referrer URL', icon: <AiOutlineGlobal />, mapping: 'referrer' },
    ]
  }
];

const CRM_FIELD_MAPPINGS = [
  { value: 'name', label: 'Lead: Full Name' },
  { value: 'email', label: 'Lead: Email' },
  { value: 'phone', label: 'Lead: Phone' },
  { value: 'account_name', label: 'Account: Name' },
  { value: 'industry', label: 'Account: Industry' },
  { value: 'title', label: 'Lead: Job Title' },
  { value: 'description', label: 'Lead: Description/Message' },
  { value: 'utm_source', label: 'Marketing: UTM Source' },
  { value: 'utm_campaign', label: 'Marketing: UTM Campaign' },
];

const FormBuilderDrawer = ({ isOpen, onClose, formId }) => {
  const { captureForms, addForm, updateForm, contacts } = useCRM();
  const { showToast } = useSMMToast();
  
  const [name, setName] = useState('Untitled Form');
  const [fields, setFields] = useState([]);
  const [theme, setTheme] = useState({ primaryColor: '#3b82f6', borderRadius: '12px', layout: 'single' });
  const [automation, setAutomation] = useState({
    postSubmitAction: 'message',
    message: 'Thank you for your submission!',
    redirectUrl: '',
    autoAssignment: 'round-robin',
    pipelineStage: 'New Lead'
  });
  const [activeTab, setActiveTab] = useState('build'); // 'build', 'workflow', 'style', 'settings'
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [previewValues, setPreviewValues] = useState({});

  useEffect(() => {
    if (formId) {
      const form = captureForms.find(f => f.id === formId);
      if (form) {
        setName(form.name);
        setFields(form.fields || []);
        setTheme(form.theme || { primaryColor: '#3b82f6', borderRadius: '12px' });
        setAutomation(form.automation || {
          postSubmitAction: 'message',
          message: 'Thank you for your submission!',
          autoAssignment: 'round-robin',
          pipelineStage: 'New Lead'
        });
      }
    } else {
      setName('New Capture Form');
      setFields([
        { id: 'f_name', label: 'Full Name', type: 'text', required: true, mapping: 'name', placeholder: 'Enter your full name' },
        { id: 'f_email', label: 'Email Address', type: 'email', required: true, mapping: 'email', placeholder: 'john@example.com' },
      ]);
    }
  }, [formId, captureForms, isOpen]);

  const selectedField = useMemo(() => fields.find(f => f.id === selectedFieldId), [fields, selectedFieldId]);

  const addField = (fieldType) => {
    const newField = {
      id: `f_${Math.random().toString(36).substr(2, 9)}`,
      label: fieldType.label,
      type: fieldType.type,
      required: false,
      mapping: fieldType.mapping || '',
      placeholder: `Enter ${fieldType.label.toLowerCase()}...`
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleSave = () => {
    const formData = { name, fields, theme, automation, status: 'active' };
    if (formId) {
      updateForm(formId, formData);
      showToast('Form updated successfully', { type: 'success' });
    } else {
      addForm(formData);
      showToast('Form created successfully', { type: 'success' });
    }
    onClose();
  };

  const filteredCategories = FIELD_CATEGORIES.map(cat => ({
    ...cat,
    fields: cat.fields.filter(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.fields.length > 0);

  const [showLeftSidebar, setShowLeftSidebar] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  useEffect(() => {
    // Reset sidebars on resize
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowLeftSidebar(true);
        setShowRightSidebar(true);
      } else {
        setShowLeftSidebar(false);
        setShowRightSidebar(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`fixed inset-y-0 right-0 z-[100] w-full lg:w-[95vw] bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col lg:flex-row overflow-hidden`}>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
         <button 
           onClick={() => { setShowLeftSidebar(!showLeftSidebar); setShowRightSidebar(false); }}
           className={`p-2 rounded-xl transition-all ${showLeftSidebar ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}
         >
            <AiOutlineSearch size={20} />
         </button>
         <div className="flex items-center gap-2">
            <AiOutlineForm className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{name}</span>
         </div>
         <button 
           onClick={() => { setShowRightSidebar(!showRightSidebar); setShowLeftSidebar(false); }}
           className={`p-2 rounded-xl transition-all ${showRightSidebar ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400'}`}
         >
            <AiOutlineSetting size={20} />
         </button>
      </div>

      {/* Sidebar: Available Fields */}
      <div className={`
        fixed inset-y-0 left-0 z-[110] lg:relative lg:z-0 lg:translate-x-0
        w-80 border-r border-gray-100 bg-white flex flex-col shrink-0 transition-transform duration-300
        ${showLeftSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between lg:block">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0 lg:mb-4">Field Library</h3>
          <button onClick={() => setShowLeftSidebar(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400"><AiOutlineClose /></button>
          <div className="relative mt-0 lg:mt-4 hidden lg:block">
             <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               placeholder="Search fields..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 transition-all"
             />
          </div>
        </div>
        
        {/* Mobile Search - Visible only on mobile when sidebar open */}
        <div className="p-4 lg:hidden">
          <div className="relative">
             <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               placeholder="Search fields..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
          {filteredCategories.map(cat => (
            <div key={cat.id}>
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">{cat.name}</h4>
               <div className="grid grid-cols-1 gap-2">
                  {cat.fields.map(f => (
                    <button 
                      key={f.label}
                      onClick={() => { addField(f); if (window.innerWidth < 1024) setShowLeftSidebar(false); }}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-primary hover:shadow-md transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        {f.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{f.label}</p>
                        {f.mapping && <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5">Auto-Maps</p>}
                      </div>
                      <AiOutlinePlus className="text-gray-300 opacity-0 lg:group-hover:opacity-100" />
                    </button>
                  ))}
               </div>
            </div>
          ))}

          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
             <div className="flex items-center gap-2 mb-3">
                <AiOutlineStar className="text-amber-500" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Recommended</p>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed mb-4">Based on your form purpose, adding <b>"Industry"</b> could improve lead routing accuracy.</p>
             <button className="w-full py-2.5 bg-white border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Add Recommended
             </button>
          </div>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30 overflow-hidden relative">
        {/* Header - Hidden on Mobile (moved to Mobile Toggle Bar) */}
        <div className="hidden lg:flex p-6 bg-white border-b border-gray-100 items-center justify-between z-20">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                 <AiOutlineForm size={20} />
              </div>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-64"
              />
           </div>
           
           <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {['desktop', 'tablet', 'mobile'].map(device => (
                <button 
                  key={device}
                  onClick={() => setPreviewDevice(device)}
                  className={`p-2 rounded-lg transition-all ${previewDevice === device ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {device === 'desktop' && <AiOutlineDesktop size={18} />}
                  {device === 'tablet' && <AiOutlineTablet size={18} />}
                  {device === 'mobile' && <AiOutlineMobile size={18} />}
                </button>
              ))}
           </div>

           <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><AiOutlineClose size={20} /></button>
           </div>
        </div>

        {/* Builder Toolbar - Horizontal Scroll on Mobile */}
        <div className="flex px-4 lg:px-8 bg-white border-b border-gray-100 z-10 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'build', label: 'Builder', icon: <AiOutlineDrag /> },
            { id: 'workflow', label: 'Workflow', icon: <AiOutlineBranches /> },
            { id: 'style', label: 'Theme & Style', icon: <AiOutlineBgColors /> },
            { id: 'settings', label: 'Post-Submit', icon: <AiOutlineSetting /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-4 lg:px-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-12 custom-scrollbar flex justify-center items-start">
           {activeTab === 'build' && (
             <div 
               className={`bg-white shadow-2xl border border-gray-100 p-6 lg:p-10 min-h-[600px] flex flex-col transition-all duration-500 ease-in-out mx-auto ${
                 previewDevice === 'mobile' ? 'w-full max-w-[375px]' : previewDevice === 'tablet' ? 'w-full max-w-[768px]' : 'w-full max-w-2xl'
               }`}
               style={{ borderRadius: theme.borderRadius }}
             >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6 lg:mb-8 truncate">{name}</h2>
                
                <div className="space-y-4 lg:space-y-6 flex-1">
                  {fields.length === 0 && (
                    <div className="h-64 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-3 p-6 text-center">
                      <AiOutlinePlus size={32} />
                      <p className="text-sm font-medium">Add fields from the library to start building</p>
                    </div>
                  )}
                  
                  {fields.map((f, idx) => (
                    <div 
                      key={f.id} 
                      onClick={() => { setSelectedFieldId(f.id); if (window.innerWidth < 1024) setShowRightSidebar(true); }}
                      className={`group relative p-4 lg:p-6 rounded-3xl border transition-all cursor-pointer ${selectedFieldId === f.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
                    >
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">
                         {f.label} {f.required && <span className="text-red-500">*</span>}
                         {f.mapping && <AiOutlineBranches className="text-primary/40" />}
                      </label>
                      
                      {f.type === 'textarea' ? (
                        <textarea
                          value={previewValues[f.id] || ''}
                          onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={f.placeholder}
                          className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-700 text-sm h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                        />
                      ) : f.type === 'dropdown' ? (
                        <select
                          value={previewValues[f.id] || ''}
                          onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                        >
                          <option value="">{f.placeholder || 'Select option...'}</option>
                          {(f.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          value={previewValues[f.id] || ''}
                          onChange={(e) => setPreviewValues({ ...previewValues, [f.id]: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder={f.placeholder}
                          className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-gray-700 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                      )}
                      
                      <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => { e.stopPropagation(); }}
                          className="hidden lg:block p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm"
                        >
                          <AiOutlineDrag size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeField(f.id); }}
                          className="p-2 text-red-400 lg:hover:bg-red-50 rounded-lg transition-all"
                        >
                          <AiOutlineDelete size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-gray-100">
                   <button 
                     disabled 
                     className="w-full py-4 lg:py-5 text-white font-black uppercase tracking-widest text-[10px] lg:text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
                     style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius }}
                   >
                     Submit Form <AiOutlineArrowRight className="lg:group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
           )}
           {/* ... workflow and settings tabs (mostly fine as they are max-w-4xl/2xl) ... */}
           {activeTab === 'workflow' && (
             <div className="w-full max-w-4xl space-y-8 lg:space-y-12 py-4 lg:py-10 overflow-hidden">
                <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-8 p-4 bg-white rounded-3xl border border-gray-100 lg:bg-transparent lg:border-none">
                   {[
                     { icon: <AiOutlineForm />, label: 'Submit', color: 'bg-blue-500' },
                     { icon: <AiOutlineUser />, label: 'Lead', color: 'bg-emerald-500' },
                     { icon: <AiOutlineNotification />, label: 'Notify', color: 'bg-amber-500' },
                     { icon: <AiOutlineCheck />, label: 'Pipeline', color: 'bg-gray-200 text-gray-500', opacity: 'opacity-50' }
                   ].map((node, i, arr) => (
                     <React.Fragment key={i}>
                       <div className={`flex flex-col items-center gap-2 lg:gap-4 ${node.opacity || ''}`}>
                          <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-2xl lg:rounded-3xl ${node.color} ${node.color.includes('text') ? '' : 'text-white'} flex items-center justify-center shadow-lg`}>
                             {React.cloneElement(node.icon, { size: window.innerWidth < 1024 ? 20 : 32 })}
                          </div>
                          <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400">{node.label}</p>
                       </div>
                       {i < arr.length - 1 && <AiOutlineArrowRight className="text-gray-200 hidden sm:block" size={24} />}
                     </React.Fragment>
                   ))}
                </div>

                <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-12 border border-gray-100 shadow-xl">
                   <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-6 lg:mb-8">Automation Logic</h3>
                   <div className="space-y-4 lg:space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 lg:p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <div className="p-3 bg-white rounded-xl shadow-sm"><AiOutlineSafety className="text-primary" size={20} /></div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm">Duplicate Detection</h4>
                            <p className="text-[10px] text-gray-500 mt-1 truncate">If email exists, update lead profile instead of creating new.</p>
                         </div>
                         <div className="w-10 h-5 bg-primary rounded-full relative ml-auto"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 lg:p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <div className="p-3 bg-white rounded-xl shadow-sm"><AiOutlineBranches className="text-primary" size={20} /></div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm">Auto-Assignment</h4>
                            <p className="text-[10px] text-gray-500 mt-1">Route leads using {automation.autoAssignment} logic.</p>
                         </div>
                         <select className="w-full sm:w-auto bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[10px] font-bold">
                            <option>Round Robin</option>
                            <option>Territory Based</option>
                         </select>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 lg:p-6 bg-gray-50 rounded-3xl border border-gray-100">
                         <div className="p-3 bg-white rounded-xl shadow-sm"><AiOutlineThunderbolt className="text-amber-500" size={20} /></div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm">Real-time Scoring</h4>
                            <p className="text-[10px] text-gray-500 mt-1">Execute qualification engine on submission.</p>
                         </div>
                         <div className="w-10 h-5 bg-primary rounded-full relative ml-auto"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'settings' && (
             <div className="w-full max-w-2xl space-y-6 lg:space-y-8 py-4 lg:py-10">
                <div className="bg-white rounded-[32px] lg:rounded-[40px] p-6 lg:p-10 border border-gray-100 shadow-xl">
                   <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-6 lg:mb-8 flex items-center gap-3">
                      <AiOutlineCheckCircle className="text-emerald-500" /> Post-Submission Logic
                   </h3>
                   
                   <div className="space-y-6 lg:space-y-8">
                      <div>
                         <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">On Completion</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            {['message', 'redirect'].map(act => (
                              <button 
                                key={act}
                                onClick={() => setAutomation({...automation, postSubmitAction: act})}
                                className={`p-4 lg:p-6 rounded-3xl border transition-all text-left ${automation.postSubmitAction === act ? 'bg-primary/5 border-primary' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                              >
                                 <h4 className="font-bold text-gray-800 text-xs lg:text-sm">{act === 'message' ? 'Show Message' : 'Redirect URL'}</h4>
                                 <p className="text-[9px] text-gray-500 mt-1">{act === 'message' ? 'Display a thank you note' : 'Send to custom landing page'}</p>
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="pt-6 lg:pt-8 border-t border-gray-100">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                               <h4 className="font-bold text-gray-800 text-sm lg:text-base">Email Notifications</h4>
                               <p className="text-[10px] text-gray-500 mt-1">Notify sales team when lead is captured</p>
                            </div>
                            <div className="w-10 h-5 bg-primary rounded-full relative self-end sm:self-auto"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
                         </div>
                         <div className="flex items-center gap-2 p-3 lg:p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <AiOutlineMail className="text-gray-400 shrink-0" />
                            <input className="bg-transparent border-none text-[10px] font-bold flex-1 focus:ring-0 min-w-0" placeholder="sales-team@company.ai" />
                            <button className="text-primary text-[10px] font-black uppercase tracking-widest shrink-0">Add</button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 lg:p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 shrink-0">
           <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 <AiOutlineCheck className="text-emerald-500" /> <span className="hidden lg:inline">Form Validated</span>
              </div>
              <div className="flex items-center gap-1 lg:gap-2 text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 <AiOutlineThunderbolt className="text-amber-500" /> <span className="hidden lg:inline">Score:</span> 84
              </div>
           </div>
           <div className="flex items-center gap-2 lg:gap-3 w-full sm:w-auto">
              <button onClick={onClose} className="flex-1 sm:flex-none px-4 lg:px-6 py-2.5 text-[10px] lg:text-xs font-bold text-gray-500 uppercase">Discard</button>
              <button 
                onClick={handleSave}
                className="flex-[2] sm:flex-none px-6 lg:px-10 py-3 lg:py-4 bg-primary text-white rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 lg:gap-3"
              >
                <AiOutlineRocket size={window.innerWidth < 1024 ? 16 : 20} />
                <span>PUBLISH <span className="hidden sm:inline">INFRASTRUCTURE</span></span>
              </button>
           </div>
        </div>
      </div>

      {/* Right Sidebar: Field Configuration Panel */}
      <div className={`
        fixed inset-y-0 right-0 z-[110] lg:relative lg:z-0 lg:translate-x-0
        w-80 border-l border-gray-100 bg-white flex flex-col shrink-0 transition-transform duration-300
        ${showRightSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
           <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Configuration</h3>
              <button onClick={() => setShowRightSidebar(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400"><AiOutlineClose /></button>
           </div>
           
           {!selectedField ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-300">
                <AiOutlineSetting size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Select a field to configure</p>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Label</label>
                      <input 
                        value={selectedField.label}
                        onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Placeholder</label>
                      <input 
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs"
                      />
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                   {[
                     { label: 'Required Field', key: 'required' },
                     { label: 'AI Validation', key: 'ai_val' }
                   ].map(opt => (
                     <div key={opt.key} className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{opt.label}</span>
                        <button 
                          onClick={() => opt.key === 'required' && updateField(selectedField.id, { required: !selectedField.required })}
                          className={`w-9 h-5 rounded-full relative transition-all ${selectedField[opt.key] || (opt.key === 'required' && selectedField.required) ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${selectedField[opt.key] || (opt.key === 'required' && selectedField.required) ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-gray-100">
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AiOutlineBranches className="text-primary" /> CRM Data Mapping
                   </label>
                   <select 
                     value={selectedField.mapping || ''}
                     onChange={(e) => updateField(selectedField.id, { mapping: e.target.value })}
                     className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold"
                   >
                      <option value="">Select CRM Field...</option>
                      {CRM_FIELD_MAPPINGS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                   </select>
                </div>

                {selectedField.type === 'dropdown' && (
                  <div className="pt-6 border-t border-gray-100 animate-in slide-in-from-bottom-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dropdown Options</label>
                    <div className="space-y-2">
                      {(selectedField.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 group/opt">
                          <div className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">
                            {opt}
                          </div>
                          <button 
                            onClick={() => {
                              const newOpts = selectedField.options.filter((_, idx) => idx !== i);
                              updateField(selectedField.id, { options: newOpts });
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <AiOutlineDelete size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          id="new-opt-input"
                          placeholder="New option..."
                          className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              const newOpts = [...(selectedField.options || []), e.target.value];
                              updateField(selectedField.id, { options: newOpts });
                              e.target.value = '';
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById('new-opt-input');
                            if (input.value) {
                              const newOpts = [...(selectedField.options || []), input.value];
                              updateField(selectedField.id, { options: newOpts });
                              input.value = '';
                            }
                          }}
                          className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
                        >
                          <AiOutlinePlus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'style' && (
                  <div className="pt-6 border-t border-gray-100 animate-in fade-in duration-300 lg:hidden">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Styles</h4>
                    <div className="grid grid-cols-5 gap-2">
                       {['#3b82f6', '#296374', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                         <button 
                           key={c}
                           onClick={() => setTheme({...theme, primaryColor: c})}
                           className="w-8 h-8 rounded-lg"
                           style={{ backgroundColor: c }}
                         />
                       ))}
                    </div>
                  </div>
                )}
             </div>
           )}

           <div className="p-4 lg:p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-2 mb-2">
                    <AiOutlineSafety className="text-emerald-500" />
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-800 uppercase tracking-widest">Preview</p>
                 </div>
                 <div className="flex items-center justify-between text-[8px] lg:text-[9px] uppercase tracking-tighter">
                    <span className="text-gray-400 font-bold">Fit Score</span>
                    <span className="text-emerald-500 font-black">+15 High</span>
                 </div>
              </div>
           </div>
        </div>
      
      {/* Sidebar: Style Settings (Only for LG+) */}
      {activeTab === 'style' && (
        <div className="hidden lg:flex w-80 border-l border-gray-100 bg-white p-6 flex-col shrink-0 animate-in slide-in-from-right-4 duration-300">
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Theme Settings</h3>
           <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Primary Color</label>
                <div className="grid grid-cols-5 gap-3">
                   {['#3b82f6', '#296374', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                     <button 
                       key={c}
                       onClick={() => setTheme({...theme, primaryColor: c})}
                       className={`w-10 h-10 rounded-2xl border-2 transition-all hover:scale-110 ${theme.primaryColor === c ? 'border-gray-800 shadow-lg' : 'border-transparent shadow-sm'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Container Corner</label>
                <div className="grid grid-cols-2 gap-2">
                   {['0px', '12px', '24px', '40px'].map(r => (
                     <button 
                       key={r}
                       onClick={() => setTheme({...theme, borderRadius: r})}
                       className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${theme.borderRadius === r ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
                     >
                       {r === '0px' ? 'Sharp' : r === '12px' ? 'Soft' : r === '24px' ? 'Rounded' : 'Bubble'}
                     </button>
                   ))}
                </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default FormBuilderDrawer;
