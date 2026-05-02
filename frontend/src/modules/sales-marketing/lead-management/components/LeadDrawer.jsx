import React, { useState } from 'react';
import { 
  AiOutlineClose, AiOutlineUser, AiOutlineMail, AiOutlinePhone, 
  AiOutlineThunderbolt, AiOutlineHistory, AiOutlineSafetyCertificate,
  AiOutlineGlobal, AiOutlineLinkedin, AiOutlineEdit, AiOutlineDelete,
  AiOutlineCheckCircle, AiOutlineLoading3Quarters
} from 'react-icons/ai';

const LeadDrawer = ({ lead, isOpen, onClose, onEnrich, onUpdate }) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!lead) return null;

  const handleEnrich = async () => {
    setIsEnriching(true);
    await onEnrich(lead.id);
    setIsEnriching(false);
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-[60] w-full sm:w-[540px] bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary border border-primary/20">
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{lead.first_name} {lead.last_name}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{lead.job_title || 'Lead'} @ {lead.company || 'Private'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-gray-400 border border-transparent hover:border-gray-100 shadow-sm">
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-8 py-4 border-b border-gray-50 flex items-center gap-3">
          <button 
            onClick={handleEnrich}
            disabled={isEnriching}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e293b] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isEnriching ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineThunderbolt className="text-amber-400" />}
            {isEnriching ? 'ENRICHING...' : 'AI ENRICH'}
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            <AiOutlineEdit /> Edit
          </button>
          <button className="px-4 py-2.5 bg-white border border-gray-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all">
            <AiOutlineDelete />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-gray-50">
          {['overview', 'activities', 'insights'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Score Widget */}
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <AiOutlineSafetyCertificate className="text-emerald-500" size={20} />
                     <h3 className="text-xs font-black text-emerald-900 uppercase tracking-widest">Lead Quality Score</h3>
                   </div>
                   <span className="text-2xl font-black text-emerald-600">{lead.score || 0}%</span>
                 </div>
                 <div className="h-2 w-full bg-emerald-200/50 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score || 0}%` }} />
                 </div>
                 <p className="text-[10px] text-emerald-700/70 mt-4 italic font-medium">
                   "Based on high data completeness and recent engagement levels."
                 </p>
              </div>

              {/* Contact Info */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400"><AiOutlineMail /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Email Address</p>
                        <p className="text-sm font-semibold text-gray-700">{lead.email || '—'}</p>
                      </div>
                    </div>
                    {lead.email && <AiOutlineCheckCircle className="text-emerald-500" />}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400"><AiOutlinePhone /></div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-700">{lead.phone || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Company Info */}
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Industry</p>
                      <p className="text-xs font-bold text-gray-700">{lead.industry || 'Tech'}</p>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">Company Size</p>
                      <p className="text-xs font-bold text-gray-700">50-200</p>
                   </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
               {[1, 2, 3].map(i => (
                 <div key={i} className="relative pl-8 border-l-2 border-gray-100 pb-6 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-primary rounded-full" />
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-xs font-bold text-gray-800">Demo Meeting Scheduled</h4>
                        <span className="text-[9px] text-gray-400 font-bold uppercase">2 days ago</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Lead expressed interest in enterprise features after visiting pricing page.</p>
                      <div className="flex items-center gap-2 mt-3">
                         <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">Sales</span>
                         <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[8px] font-black uppercase">Note</span>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDrawer;
