import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMFilterBar, SMEmptyState } from '../../components/shared';
import { 
  AiOutlinePlus, AiOutlineImport, AiOutlineUser, AiOutlineTable, 
  AiOutlineBlock, AiOutlineSearch, AiOutlineThunderbolt, AiOutlineRobot,
  AiOutlineBell, AiOutlineMail, AiOutlinePhone, AiOutlineMessage,
  AiOutlineEye, AiOutlineCheckCircle, AiOutlineLoading3Quarters
} from 'react-icons/ai';
import { useCRM } from '../context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';

// Import New Components from lead-management module
import LeadMetrics from '../../lead-management/components/LeadMetrics';
import LeadCharts from '../../lead-management/components/LeadCharts';
import LeadKanban from '../../lead-management/components/LeadKanban';
import LeadDrawer from '../../lead-management/components/LeadDrawer';
import QuickCreateDrawer from '../../lead-management/components/QuickCreateDrawer';

const LeadDatabasePage = () => {
  const { contacts, updateContact, addContact, getCRMStats } = useCRM();
  const { showToast } = useSMMToast();
  const navigate = useNavigate();

  // 1. State Management
  const [viewMode, setViewMode] = useState('kanban'); // 'table' or 'kanban'
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ stage: 'all', owner: 'all' });

  // 2. Data Enhancement (AI Simulation)
  // We augment the CRM contacts with lead-specific metadata for this simulation
  const leads = useMemo(() => {
    return Object.values(contacts)
      .filter(c => (c.status || '').toLowerCase() === 'lead')
      .map(l => ({
        ...l,
        stage: l.stage || 'new',
        score: l.score || Math.floor(Math.random() * 40) + 40, // Base mock score
        owner: l.owner || 'Unassigned',
        source: l.source || 'Website'
      }));
  }, [contacts]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = !search || (`${l.first_name} ${l.last_name} ${l.email} ${l.company}`).toLowerCase().includes(search.toLowerCase());
      const matchesStage = activeFilters.stage === 'all' || l.stage === activeFilters.stage;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, activeFilters]);

  // 3. Analytics Logic
  const stats = useMemo(() => {
    const openCount = leads.filter(l => l.stage !== 'lost' && l.stage !== 'converted').length;
    return {
      total: leads.length,
      open: openCount,
      conversionRate: leads.length ? Math.round((leads.filter(l => l.stage === 'qualified').length / leads.length) * 100) : 0,
      lost: leads.filter(l => l.stage === 'lost').length
    };
  }, [leads]);

  const chartData = useMemo(() => {
    const sources = {};
    leads.forEach(l => { sources[l.source] = (sources[l.source] || 0) + 1; });
    return {
      sources: Object.entries(sources).map(([name, value]) => ({ name, value })),
      trends: [
        { name: 'Mon', leads: 4 }, { name: 'Tue', leads: 7 }, { name: 'Wed', leads: 5 },
        { name: 'Thu', leads: 12 }, { name: 'Fri', leads: 8 }, { name: 'Sat', leads: 3 }, { name: 'Sun', leads: 1 }
      ]
    };
  }, [leads]);

  // 4. Action Handlers
  const handleMoveLead = (leadId, newStage) => {
    updateContact(leadId, { stage: newStage });
    showToast(`Lead moved to ${newStage}`, { type: 'info' });
    
    if (newStage === 'qualified') {
       showToast('High intent detected! Notifying account executive...', { type: 'success' });
    }
  };

  const handleEnrich = async (leadId) => {
    // Simulate AI Enrichment
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateContact(leadId, { 
      score: Math.min(100, (leads.find(l => l.id === leadId)?.score || 0) + 15),
      industry: 'Software & Technology',
      job_title: 'Senior Product Manager'
    });
    showToast('AI Enrichment complete. Data points updated.', { type: 'success' });
  };

  const runDatabaseScan = () => {
    setIsScanning(true);
    showToast('Running predictive lead scoring algorithm...', { type: 'info' });
    setTimeout(() => {
      setIsScanning(false);
      showToast('Scan complete. 12 high-priority leads identified.', { type: 'success' });
    }, 2500);
  };

  const handleQuickCreate = () => {
    navigate('/sm/core-crm/contacts/create?status=lead');
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="leads">
      <DndProvider backend={HTML5Backend}>
        <SMModuleLayout
          title="Lead Management Center"
          subtitle="Autonomous acquisition and predictive intelligence layer"
          color="#296374"
          icon={<AiOutlineUser className="text-white" size={18} />}
          actions={
            <div className="flex items-center gap-2">
              <button 
                onClick={runDatabaseScan}
                disabled={isScanning}
                className="px-4 py-2.5 bg-[#1e293b] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              >
                {isScanning ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineRobot className="text-amber-400" />}
                <span>{isScanning ? 'SCANNIG...' : 'AI SCAN'}</span>
              </button>
              <button 
                onClick={() => setIsQuickCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-xs font-bold shadow-lg shadow-primary/20"
              >
                <AiOutlinePlus size={16} />
                <span>QUICK CREATE</span>
              </button>
            </div>
          }
        >
          <div className="space-y-8">
            {/* Top Metrics */}
            <LeadMetrics stats={stats} />

            {/* Main Controls & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex-1 max-w-2xl relative">
                  <AiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Global lead search: name, email, company or industry..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  />
               </div>

               <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl">
                  <button 
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <AiOutlineBlock size={14} /> Kanban
                  </button>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <AiOutlineTable size={14} /> Table
                  </button>
               </div>
            </div>

            {/* Analytics Section - only visible in table view or toggleable */}
            <LeadCharts sourcesData={chartData.sources} trendsData={chartData.trends} />

            {/* Primary View */}
            <div className="min-h-[600px]">
              {viewMode === 'kanban' ? (
                <LeadKanban 
                  leads={filteredLeads} 
                  onMoveLead={handleMoveLead}
                  onSelectLead={(l) => { setSelectedLeadId(l.id); setIsDrawerOpen(true); }}
                />
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stage</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredLeads.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50/30 transition-all group">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {l.first_name?.[0]}{l.last_name?.[0]}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{l.first_name} {l.last_name}</p>
                                  <p className="text-[10px] text-gray-400">{l.company}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <div className="flex-1 h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${l.score >= 80 ? 'bg-emerald-500' : l.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                    style={{ width: `${l.score}%` }} 
                                  />
                               </div>
                               <span className="text-[10px] font-bold text-gray-500">{l.score}%</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-black uppercase tracking-tighter">
                               {l.stage}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={() => { setSelectedLeadId(l.id); setIsDrawerOpen(true); }}
                                  className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm text-gray-400 hover:text-primary transition-all"
                                >
                                  <AiOutlineEye size={16} />
                                </button>
                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-sm text-gray-400 hover:text-emerald-500 transition-all">
                                  <AiOutlinePhone size={16} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <LeadDrawer 
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            lead={leads.find(l => l.id === selectedLeadId)}
            onEnrich={handleEnrich}
          />

          <QuickCreateDrawer 
            isOpen={isQuickCreateOpen}
            onClose={() => setIsQuickCreateOpen(false)}
          />
        </SMModuleLayout>
      </DndProvider>
    </SMModuleGuard>
  );
};

export default LeadDatabasePage;