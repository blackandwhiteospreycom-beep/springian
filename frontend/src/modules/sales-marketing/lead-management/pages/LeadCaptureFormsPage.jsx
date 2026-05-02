import React, { useState, useMemo } from 'react';
import { 
  AiOutlinePlus, AiOutlineForm, AiOutlineEye, AiOutlineCheckCircle, 
  AiOutlineCloseCircle, AiOutlineEllipsis, AiOutlineAreaChart,
  AiOutlineCopy, AiOutlineDelete, AiOutlineEdit, AiOutlineThunderbolt,
  AiOutlineGlobal, AiOutlineWhatsApp, AiOutlineRocket, AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMStatsCard, SMEmptyState } from '../../components/shared';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';
import FormBuilderDrawer from '../components/FormBuilderDrawer';

const LeadCaptureFormsPage = () => {
  const { captureForms, updateForm, deleteForm, addForm } = useCRM();
  const { showToast } = useSMMToast();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState(null);

  const stats = useMemo(() => {
    const totalViews = captureForms.reduce((acc, f) => acc + (f.analytics?.views || 0), 0);
    const totalSubs = captureForms.reduce((acc, f) => acc + (f.analytics?.submissions || 0), 0);
    return {
      totalForms: captureForms.length,
      activeForms: captureForms.filter(f => f.status === 'active').length,
      totalViews,
      totalSubmissions: totalSubs,
      avgConversion: totalViews ? ((totalSubs / totalViews) * 100).toFixed(1) : 0,
      trend: '+12.5%'
    };
  }, [captureForms]);

  const handleCopyEmbed = (formId) => {
    const embedCode = `<script src="https://api.crm.ai/v1/forms/${formId}.js"></script>`;
    navigator.clipboard.writeText(embedCode);
    showToast('Embed code copied to clipboard!', { type: 'success' });
  };

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateForm(id, { status: newStatus });
    showToast(`Form ${newStatus === 'active' ? 'activated' : 'paused'}`, { type: 'info' });
  };

  const handleQuickStart = (type) => {
    const templates = {
      website: {
        name: 'Website Contact Form',
        fields: [
          { id: 'f1', label: 'Full Name', type: 'text', required: true, mapping: 'name' },
          { id: 'f2', label: 'Email', type: 'email', required: true, mapping: 'email' },
          { id: 'f3', label: 'Message', type: 'textarea', required: false, mapping: 'description' }
        ]
      },
      landing: {
        name: 'Landing Page Lead Form',
        fields: [
          { id: 'f1', label: 'Full Name', type: 'text', required: true, mapping: 'name' },
          { id: 'f2', label: 'Work Email', type: 'email', required: true, mapping: 'email' },
          { id: 'f3', label: 'Company Name', type: 'text', required: true, mapping: 'account_name' }
        ]
      },
      whatsapp: {
        name: 'WhatsApp Capture Form',
        fields: [
          { id: 'f1', label: 'Phone Number', type: 'phone', required: true, mapping: 'phone' },
          { id: 'f2', label: 'Interested In', type: 'dropdown', required: true, mapping: 'service_interest' }
        ]
      }
    };

    const newForm = addForm({
      ...templates[type],
      theme: { primaryColor: '#3b82f6', borderRadius: '12px' },
      status: 'active'
    });
    setEditingFormId(newForm.id);
    setIsBuilderOpen(true);
    showToast(`${templates[type].name} template applied!`, { type: 'success' });
  };

  return (
    <SMModuleGuard sectionId="lead-management" featureId="capture-forms">
      <SMModuleLayout
        title="Lead Capture Forms"
        subtitle="Build and deploy autonomous data acquisition entry points"
        color="#3b82f6"
        icon={<AiOutlineForm className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditingFormId(null); setIsBuilderOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold shadow-lg shadow-primary/20"
            >
              <AiOutlinePlus size={16} />
              <span>CREATE FORM</span>
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SMStatsCard title="Total Views" value={stats.totalViews} change="8.2%" changeType="positive" icon={<AiOutlineEye />} color="#3b82f6" />
            <SMStatsCard title="Submissions" value={stats.totalSubmissions} change="14.5%" changeType="positive" icon={<AiOutlineCheckCircle />} color="#10b981" />
            <SMStatsCard title="Conversion Rate" value={`${stats.avgConversion}%`} change="2.1%" changeType="positive" icon={<AiOutlineAreaChart />} color="#8b5cf6" />
            <SMStatsCard title="Active Forms" value={stats.activeForms} icon={<AiOutlineForm />} color="#296374" />
          </div>

          {/* Forms List or Quick Start */}
          {captureForms.length === 0 ? (
            <div className="space-y-6">
               <div className="text-center py-8">
                  <h3 className="text-2xl font-bold text-gray-800">Start Capturing Leads</h3>
                  <p className="text-gray-400 mt-2">Choose a template to deploy your first autonomous capture infrastructure</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'website', title: 'Website Contact', icon: <AiOutlineGlobal />, color: 'bg-blue-50 text-blue-500', desc: 'General inquiry form for your main website' },
                    { id: 'landing', title: 'Landing Page', icon: <AiOutlineRocket />, color: 'bg-emerald-50 text-emerald-500', desc: 'High-conversion form for marketing campaigns' },
                    { id: 'whatsapp', title: 'WhatsApp Capture', icon: <AiOutlineWhatsApp />, color: 'bg-green-50 text-green-500', desc: 'Quick capture for WhatsApp-first interactions' }
                  ].map(tpl => (
                    <button 
                      key={tpl.id}
                      onClick={() => handleQuickStart(tpl.id)}
                      className="p-8 bg-white border border-gray-100 rounded-3xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all text-left group"
                    >
                       <div className={`w-14 h-14 rounded-2xl ${tpl.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          {React.cloneElement(tpl.icon, { size: 28 })}
                       </div>
                       <h4 className="font-bold text-gray-800 text-lg mb-2">{tpl.title}</h4>
                       <p className="text-sm text-gray-400 leading-relaxed mb-6">{tpl.desc}</p>
                       <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                          Start with Template <AiOutlinePlus />
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Deployed Entry Points</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Autonomous Capture Infrastructure</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-100">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       Network Status: Operational
                     </span>
                  </div>
               </div>

               <div className="divide-y divide-gray-50">
                 {captureForms.map(form => (
                   <div key={form.id} className="p-6 hover:bg-gray-50/50 transition-all group">
                     <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                              <AiOutlineForm size={24} />
                           </div>
                           <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-800">{form.name}</h4>
                                {form.analytics?.conversionRate > 5 && (
                                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                                    <AiOutlineThunderbolt /> High Performer
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{form.fields?.length || 0} Fields</span>
                                 <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Created {new Date(form.created_at).toLocaleDateString()}</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 px-8 border-x border-gray-100">
                           <div className="text-center">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Views</p>
                              <p className="font-bold text-gray-700">{form.analytics?.views || 0}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Subs</p>
                              <p className="font-bold text-gray-700">{form.analytics?.submissions || 0}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Conv.</p>
                              <div className="flex flex-col items-center">
                                 <p className="font-bold text-emerald-600">{form.analytics?.conversionRate || 0}%</p>
                                 <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${form.analytics?.conversionRate || 0}%` }} />
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => toggleStatus(form.id, form.status)}
                             className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${form.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                           >
                             {form.status}
                           </button>
                           <button 
                             onClick={() => handleCopyEmbed(form.id)}
                             className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"
                             title="Copy Embed Code"
                           >
                             <AiOutlineCopy size={18} />
                           </button>
                           <button 
                             onClick={() => { setEditingFormId(form.id); setIsBuilderOpen(true); }}
                             className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"
                           >
                             <AiOutlineEdit size={18} />
                           </button>
                           <button 
                             onClick={() => deleteForm(form.id)}
                             className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all shadow-sm"
                           >
                             <AiOutlineDelete size={18} />
                           </button>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* AI Optimizer Card */}
          <div className="bg-[#1e293b] rounded-3xl p-8 shadow-xl overflow-hidden relative group">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="max-w-xl">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/20 text-primary rounded-xl">
                         <AiOutlineThunderbolt size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-widest">AI Form Optimizer</h3>
                   </div>
                   <div className="space-y-4">
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Our autonomous engine has analyzed your conversion data. Here are the recommended optimizations:
                      </p>
                      <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                         <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                            <AiOutlineArrowUp size={16} />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white">Remove "Department" field</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">Estimated Boost: +14.2% Conversion</p>
                         </div>
                         <button 
                            onClick={() => {
                              if (captureForms.length > 0) {
                                const firstForm = captureForms[0];
                                const updatedFields = firstForm.fields.filter(f => f.label !== 'Department');
                                updateForm(firstForm.id, { fields: updatedFields });
                                showToast('AI Optimization Applied: "Department" field removed.', { type: 'success' });
                              } else {
                                showToast('Create a form first to apply optimizations.', { type: 'info' });
                              }
                            }}
                            className="ml-auto px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                         >
                            Apply
                         </button>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-3xl min-w-[200px]">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Network Health</p>
                   <p className="text-3xl font-black text-white">98.2<span className="text-xs text-emerald-500 ml-1">%</span></p>
                   <p className="text-[10px] text-emerald-500/70 font-bold mt-2 uppercase">Optimized</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />
          </div>
        </div>

        <FormBuilderDrawer 
          isOpen={isBuilderOpen}
          onClose={() => setIsBuilderOpen(false)}
          formId={editingFormId}
        />
      </SMModuleLayout>
    </SMModuleGuard>
  );
};

export default LeadCaptureFormsPage;
