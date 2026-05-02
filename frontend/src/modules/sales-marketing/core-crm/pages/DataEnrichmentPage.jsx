import React, { useMemo, useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  AiOutlineDatabase, 
  AiOutlineThunderbolt, 
  AiOutlineSafetyCertificate, 
  AiOutlineCloudSync,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineExclamationCircle,
  AiOutlineRobot,
  AiOutlineGlobal,
  AiOutlineLinkedin,
  AiOutlineMail,
  AiOutlineNodeIndex,
  AiOutlineSetting,
  AiOutlineMore,
  AiOutlinePlayCircle,
  AiOutlineStop,
  AiOutlineClose // Import for closing the drawer
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMStatsCard, SMFilterBar, SMEmptyState } from '../../components/shared';
// Import useCRM hook
import { useCRM } from '../context/CRMContext';
// Import the new Settings Drawer component
import EnrichmentSettingsDrawer from '../components/EnrichmentSettingsDrawer';
import { useSMMToast } from '../../components/SMMToastProvider';

// Placeholder for CRM entity options - will be populated from context later
const CRM_ENTITY_OPTIONS = [
  { value: '', label: 'Select CRM Entity' },
  { value: 'account', label: 'Account' },
  { value: 'contact', label: 'Contact' },
  { value: 'lead', label: 'Lead' },
];

// ─── Form Component for Data Enrichment Inputs ──────────────────────────
const DataEnrichmentForm = ({ onEnrich, crmAccounts, crmContacts }) => {
  const [email, setEmail] = useState('');
  const [domain, setDomain] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(CRM_ENTITY_OPTIONS[0].value);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation could be added here
    onEnrich({
      email,
      domain,
      linkedinUrl,
      companyName,
      entityType: selectedEntity,
      // In a real scenario, you might also pass selected entity ID if applicable
    });
  };

  // Populate CRM entity options dynamically if data is available
  const dynamicEntityOptions = useMemo(() => {
    const options = [...CRM_ENTITY_OPTIONS];
    if (crmAccounts && crmAccounts.length > 0) {
      options.push({ label: 'Existing Accounts', options: crmAccounts.map(acc => ({ value: `account_${acc.id}`, label: acc.name })) });
    }
    if (crmContacts && crmContacts.length > 0) {
      options.push({ label: 'Existing Contacts', options: crmContacts.map(contact => ({ value: `contact_${contact.id}`, label: contact.name })) });
    }
    return options;
  }, [crmAccounts, crmContacts]);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mb-6">
      <div className="col-span-1">
        <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., example@domain.com"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="domain" className="block text-xs font-bold text-gray-500 uppercase mb-1">Domain Name</label>
        <input
          id="domain"
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g., example.com"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="linkedinUrl" className="block text-xs font-bold text-gray-500 uppercase mb-1">LinkedIn URL</label>
        <input
          id="linkedinUrl"
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="e.g., https://linkedin.com/in/..."
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="companyName" className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
        <input
          id="companyName"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g., Example Corp"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>
      <div className="col-span-1">
        <label htmlFor="crmEntity" className="block text-xs font-bold text-gray-500 uppercase mb-1">Enrich For</label>
        <select
          id="crmEntity"
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 bg-white"
        >
          {/* Render dynamic options */}
          {dynamicEntityOptions.map((group, index) => (
            <optgroup key={index} label={group.label}>
              {group.options ? (
                group.options.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))
              ) : (
                <option key={group.value} value={group.value}>{group.label}</option>
              )}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
        <button
          type="submit"
          className="w-full px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <AiOutlineCloudSync size={18} />
          <span>Enrich Data</span>
        </button>
      </div>
    </form>
  );
};

// ─── Constants & Mock Data ──────────────────────────────────────────

const COLORS = ['#296374', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const HEALTH_HISTORY = [
  { month: 'Jan', score: 65, coverage: 40 },
  { month: 'Feb', score: 68, coverage: 45 },
  { month: 'Mar', score: 72, coverage: 55 },
  { month: 'Apr', score: 84, coverage: 78 },
];

const SOURCE_DATA = [
  { name: 'LinkedIn', value: 450, color: '#0077b5' },
  { name: 'Clearbit', value: 320, color: '#3b82f6' },
  { name: 'Crunchbase', value: 210, color: '#0284c7' },
  { name: 'ZeroBounce', value: 180, color: '#10b981' },
  { name: 'Manual', value: 90, color: '#6b7280' },
];

const HEALTH_DISTRIBUTION = [
  { name: 'Complete', value: 55 },
  { name: 'Partial', value: 30 },
  { name: 'Raw', value: 15 },
];

const PREDICTIONS = [
  { id: 1, entity: 'TechFlow Systems', suggestion: 'High-propensity deal detected via funding news', confidence: 92, action: 'Update Revenue' },
  { id: 2, entity: 'John Doe', suggestion: 'Contact has moved to a new role at Microsoft', confidence: 88, action: 'Verify Email' },
  { id: 3, entity: 'Global Logistics', suggestion: 'Tech stack change identified: AWS -> Azure', confidence: 76, action: 'Tag CRM' },
];

// ─── Sub-Components ─────────────────────────────────────────────────

const FlowChart = () => {
  return (
    <div className="relative p-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
      <h3 className="text-sm font-bold text-gray-800 mb-8 flex items-center gap-2">
        <AiOutlineNodeIndex className="text-primary" /> Enrichment Pipeline Flow
      </h3>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Step 1: Raw Data */}
        <div className="flex flex-col items-center group">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:border-primary/50 group-hover:text-primary transition-all duration-500 shadow-sm">
            <AiOutlineDatabase size={24} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Raw Input</span>
          <div className="hidden md:block absolute left-24 top-1/2 w-16 h-0.5 bg-gradient-to-r from-gray-100 to-primary/20" />
        </div>

        {/* Step 2: Enrichment Engine */}
        <div className="flex flex-col items-center group">
          <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500 relative">
            <AiOutlineCloudSync size={28} className="animate-spin-slow" />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <AiOutlineThunderbolt size={12} className="text-white" />
            </div>
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-3">AI Engine</span>
          <div className="hidden md:block absolute left-1/2 translate-x-12 top-1/2 w-16 h-0.5 bg-gradient-to-r from-primary/20 to-emerald-100" />
        </div>

        {/* Step 3: Verified Record */}
        <div className="flex flex-col items-center group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-110 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm">
            <AiOutlineSafetyCertificate size={24} />
          </div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-3">Verified</span>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
    </div>
  );
};

const PredictionCard = ({ item }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all group ani-fade-up">
    <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex flex-col items-center justify-center shrink-0">
      <span className="text-sm font-black">{item.confidence}%</span>
      <span className="text-[8px] font-bold uppercase opacity-60">Conf</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <h4 className="text-sm font-bold text-gray-800 truncate">{item.entity}</h4>
        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-tighter">AI_MATCH</span>
      </div>
      <p className="text-xs text-gray-500 truncate leading-relaxed">{item.suggestion}</p>
    </div>
    <button className="px-3 py-1.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-600 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest border border-gray-100 group-hover:border-primary">
      {item.action}
    </button>
  </div>
);

// ─── Main Page Architecture ─────────────────────────────────────────

const DataEnrichmentPage = () => {
  // Get enrichmentJobs, accounts, contacts, triggerEnrichment, and settings from context
  const { 
    enrichmentJobs, 
    accounts, 
    contacts, 
    triggerEnrichment, 
  } = useCRM();

  const { showToast } = useSMMToast();

  // State for managing the settings drawer
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // State to hold current settings, could be loaded from context or localStorage
  const [currentSettings, setCurrentSettings] = useState({
    apiKey: '',
    defaultSource: 'linkedin',
    enrichmentLimit: 1000,
    crmMapping: '{}',
  });

  // Load settings from local storage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('enrichmentSettings');
    if (savedSettings) {
      setCurrentSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Handle saving settings
  const handleSaveSettings = (newSettings) => {
    console.log('Saving settings:', newSettings);
    localStorage.setItem('enrichmentSettings', JSON.stringify(newSettings));
    setCurrentSettings(newSettings);
    showToast('Enrichment settings updated successfully', { type: 'success' });
  };

  const stats = useMemo(() => ({
    totalEnriched: 1245,
    healthScore: 84,
    missingFields: 242,
    aiConfidence: 91
  }), []);

  // Updated handleEnrich function to use triggerEnrichment
  const handleEnrich = (data) => {
    console.log('Initiating enrichment with data:', data);
    triggerEnrichment(data);
    showToast('Data enrichment job started', { type: 'info' });
  };

  const handleBulkEnrich = () => {
    console.log('Initiating bulk enrichment');
    triggerEnrichment({
      companyName: 'Bulk CRM Enrichment',
      entityType: 'bulk',
      domain: 'Multiple'
    });
    showToast('Bulk enrichment job queued for all CRM records', { type: 'success' });
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="data-enrichment">
      <SMModuleLayout
        title="Data Enrichment Center"
        subtitle="Autonomous data harvesting and intelligence layer"
        color="#296374"
        icon={<AiOutlineCloudSync className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkEnrich}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-primary/20"
            >
              <AiOutlinePlayCircle size={18} />
              <span>Bulk Enrich</span>
            </button>
            {/* Settings Button - Now triggers the drawer */}
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-500 shadow-sm"
            >
              <AiOutlineSetting size={20} />
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* NEW INPUT FORM SECTION */}
          <DataEnrichmentForm 
            onEnrich={handleEnrich} 
            crmAccounts={accounts} 
            crmContacts={contacts}
          />

          {/* 1. Top Tier: Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SMStatsCard 
              title="Total Enriched" value={stats.totalEnriched.toLocaleString()} icon={<AiOutlineDatabase />} color="#296374" 
              change="14%" changeType="positive"
            />
            <SMStatsCard 
              title="Data Health" value={`${stats.healthScore}%`} icon={<AiOutlineSafetyCertificate />} color="#10B981" 
              change="3.2%" changeType="positive"
            />
            <SMStatsCard 
              title="Missing Data" value={stats.missingFields} icon={<AiOutlineExclamationCircle />} color="#EF4444" 
              change="-12%" changeType="positive"
            />
            <SMStatsCard 
              title="AI Confidence" value={`${stats.aiConfidence}%`} icon={<AiOutlineRobot />} color="#8B5CF6" 
            />
          </div>

          {/* 2. Visualization Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health History Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Enrichment Performance</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Data Quality & Coverage over time</p>
                </div>
                <select className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-none rounded-lg px-3 py-1 outline-none">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HEALTH_HISTORY}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#296374" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#296374" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="score" name="Health Score" stroke="#296374" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    <Area type="monotone" dataKey="coverage" name="Coverage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCoverage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Source Distribution Pie */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col">
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-800">Source Distribution</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Provider contribution mix</p>
              </div>
              <div className="flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SOURCE_DATA}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {SOURCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Logic & Prediction Tier */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Flow Visualization */}
            <FlowChart />

            {/* AI Predictions */}
            <div className="bg-[#1e293b] rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-xl text-primary border border-primary/20">
                      <AiOutlineRobot size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">AI Prediction Stream</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Real-time enrichment insights</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-white/10 text-white/60 text-[9px] font-bold rounded-lg border border-white/5">AUTO_PILOT: ON</span>
               </div>

               <div className="space-y-3 relative z-10">
                  {PREDICTIONS.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10">
                           {item.confidence}%
                         </div>
                         <div>
                           <p className="text-[11px] font-black text-white">{item.entity}</p>
                           <p className="text-[10px] text-slate-400 line-clamp-1">{item.suggestion}</p>
                         </div>
                       </div>
                       <AiOutlineArrowRight className="text-slate-500 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
               </div>

               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            </div>
          </div>

          {/* 4. Operations Tier: Jobs Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Recent Enrichment Jobs</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">System processing logs</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg bg-white shadow-sm text-primary">All Jobs</button>
                <button className="px-3 py-1.5 text-[10px] font-black uppercase rounded-lg text-gray-400 hover:text-gray-600 transition-all">Schedules</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Name</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Results</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {enrichmentJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${job.type === 'contact' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'} flex items-center justify-center`}>
                            {job.type === 'contact' ? <AiOutlineLinkedin /> : <AiOutlineGlobal />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{job.name}</p>
                            <p className="text-[10px] text-gray-400">{new Date(job.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase">{job.source}</td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                           <div className="flex items-center justify-between mb-1">
                             <span className="text-[9px] font-black text-gray-400">{job.progress}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary rounded-full transition-all duration-1000" 
                               style={{ width: `${job.progress}%` }} 
                             />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                          job.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                          job.status === 'running' ? 'bg-blue-50 text-blue-600 animate-pulse' : 
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-gray-700">{job.enriched}</span>
                        <span className="text-[10px] text-gray-400 ml-1">enriched</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                          <AiOutlineMore size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SMModuleLayout>

      {/* Settings Drawer Integration */}
      <EnrichmentSettingsDrawer
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={currentSettings}
        onSave={handleSaveSettings}
      />

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .ani-fade-up { animation: fadeUp 0.5s ease-out both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </SMModuleGuard>
  );
};

export default DataEnrichmentPage;
