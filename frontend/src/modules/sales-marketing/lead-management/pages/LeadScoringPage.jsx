import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { 
  AiOutlineThunderbolt, AiOutlineUser, AiOutlineLineChart, 
  AiOutlineSetting, AiOutlinePlus, AiOutlineCheckCircle,
  AiOutlineInfoCircle, AiOutlineBarChart, AiOutlineDashboard,
  AiOutlineEye, AiOutlineMail, AiOutlineLink, AiOutlineInteraction
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';

const STORAGE_KEY_SCORING_RULES = 'lead_scoring_rules_v1';
const STORAGE_KEY_SCORING_SETTINGS = 'lead_scoring_settings_v1';

const DEFAULT_FIT_RULES = [
  { id: 'fit-1', name: 'Job Title: Executive', field: 'role', operator: 'contains', value: 'CEO,CTO,VP,Director', points: 30, type: 'fit' },
  { id: 'fit-2', name: 'Industry: Technology', field: 'industry', operator: 'equals', value: 'Software,Technology', points: 20, type: 'fit' },
  { id: 'fit-3', name: 'Company Size: Large', field: 'employee_count', operator: 'greater_than', value: '200', points: 15, type: 'fit' },
];

const DEFAULT_ENGAGEMENT_RULES = [
  { id: 'eng-1', name: 'Form Submission', field: 'interactions', operator: 'event', value: 'form_fill', points: 25, type: 'engagement' },
  { id: 'eng-2', name: 'Email Opened', field: 'interactions', operator: 'event', value: 'email_open', points: 5, type: 'engagement' },
  { id: 'eng-3', name: 'High Value Page View', field: 'interactions', operator: 'event', value: 'pricing_view', points: 15, type: 'engagement' },
];

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export default function LeadScoringPage() {
  const { contacts, updateContact, accounts, activities, communicationLogs } = useCRM();
  const { showToast } = useSMMToast();

  const leads = useMemo(() => Object.values(contacts).filter(c => (c.status || '').toLowerCase() === 'lead'), [contacts]);

  const [fitRules, setFitRules] = useState(() => loadJSON(STORAGE_KEY_SCORING_RULES + '_fit', DEFAULT_FIT_RULES));
  const [engRules, setEngRules] = useState(() => loadJSON(STORAGE_KEY_SCORING_RULES + '_eng', DEFAULT_ENGAGEMENT_RULES));
  const [settings, setSettings] = useState(() => loadJSON(STORAGE_KEY_SCORING_SETTINGS, { 
    thresholdHot: 70, 
    thresholdWarm: 40, 
    autoRecalculate: true,
    decayRate: 0.1 // points lost per day of inactivity
  }));

  const [engineStatus, setEngineStatus] = useState('Idle'); // Running / Idle
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fitRuleDrawer, setFitRuleDrawer] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_SCORING_RULES + '_fit', JSON.stringify(fitRules)); }, [fitRules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SCORING_RULES + '_eng', JSON.stringify(engRules)); }, [engRules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SCORING_SETTINGS, JSON.stringify(settings)); }, [settings]);

  const pushLog = useCallback((entry) => { setLogs(l => [{ ts: new Date().toISOString(), ...entry }, ...l]).slice(0, 100); }, []);

  // --- Scoring Engine Logic ---
  const calculateScore = useCallback((lead) => {
    let score = 0;
    const matchedRules = [];

    // 1. Fit Rules
    fitRules.forEach(rule => {
      let leadVal = lead[rule.field];
      
      // Handle industry/revenue if lead is linked to account
      if (!leadVal && lead.account_id && accounts[lead.account_id]) {
        leadVal = accounts[lead.account_id][rule.field];
      }

      if (!leadVal) return;

      let matched = false;
      const strVal = String(leadVal).toLowerCase();
      const ruleVal = String(rule.value).toLowerCase();

      if (rule.operator === 'equals') matched = strVal === ruleVal;
      if (rule.operator === 'contains') matched = ruleVal.split(',').some(v => strVal.includes(v.trim()));
      if (rule.operator === 'greater_than') matched = Number(leadVal) > Number(rule.value);

      if (matched) {
        score += rule.points;
        matchedRules.push(rule.name);
      }
    });

    // 2. Engagement Rules (Implicit from activities & logs)
    const leadActivities = Object.values(activities).filter(a => a.contact_id === lead.id);
    const leadLogs = Object.values(communicationLogs).filter(l => l.contact_id === lead.id);

    engRules.forEach(rule => {
      if (rule.operator === 'event') {
        const activityCount = leadActivities.filter(a => a.type === rule.value).length;
        const logCount = leadLogs.filter(l => l.status === rule.value || l.type === rule.value).length;
        
        if (activityCount > 0 || logCount > 0) {
          const totalOccurrences = activityCount + logCount;
          score += rule.points * totalOccurrences;
          matchedRules.push(`${rule.name} (x${totalOccurrences})`);
        }
      }
    });

    // 3. Score Decay (Simple)
    const lastActivity = leadActivities.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
    if (lastActivity) {
      const daysInactive = Math.floor((new Date() - new Date(lastActivity.created_at)) / (1000 * 60 * 60 * 24));
      if (daysInactive > 7) {
        const decay = Math.round(daysInactive * settings.decayRate);
        score = Math.max(0, score - decay);
        matchedRules.push(`Decay (-${decay})`);
      }
    }

    return { score, matchedRules };
  }, [fitRules, engRules, accounts, activities, communicationLogs, settings.decayRate]);

  const runScoring = () => {
    setEngineStatus('Running');
    pushLog({ action: 'scoring_started', count: leads.length });
    
    setTimeout(() => {
      leads.forEach(lead => {
        const { score, matchedRules } = calculateScore(lead);
        let priority = 'Cold';
        if (score >= settings.thresholdHot) priority = 'Hot';
        else if (score >= settings.thresholdWarm) priority = 'Warm';

        updateContact(lead.id, { 
          lead_score: score, 
          priority: priority,
          scoring_matched: matchedRules,
          last_scored_at: new Date().toISOString()
        });
      });
      
      setEngineStatus('Idle');
      showToast('Lead scoring complete', { type: 'success' });
      pushLog({ action: 'scoring_finished' });
    }, 1500);
  };

  const sortedLeads = useMemo(() => {
    return leads
      .filter(l => !searchTerm || `${l.first_name} ${l.last_name} ${l.email}`.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a,b) => (b.lead_score || 0) - (a.lead_score || 0));
  }, [leads, searchTerm]);

  const stats = useMemo(() => {
    const hotCount = leads.filter(l => (l.lead_score || 0) >= settings.thresholdHot).length;
    const warmCount = leads.filter(l => (l.lead_score || 0) >= settings.thresholdWarm && (l.lead_score || 0) < settings.thresholdHot).length;
    const avgScore = leads.length ? Math.round(leads.reduce((acc, l) => acc + (l.lead_score || 0), 0) / leads.length) : 0;
    return { hotCount, warmCount, avgScore };
  }, [leads, settings]);

  return (
    <SMModuleLayout
      title={<div className="flex items-center gap-4"><span className="text-gray-800">Lead Scoring</span>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${engineStatus==='Running'? 'bg-emerald-500 animate-pulse':'bg-gray-400'}`}></span>
          <div className={`text-xs px-3 py-1 rounded-full ${engineStatus==='Running'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-700'}`}>{engineStatus}</div>
        </div>
      </div>}
      subtitle="Intelligent qualification based on profile fit and engagement"
      color="#4F46E5"
      icon={<AiOutlineThunderbolt className="text-white" size={18} />}
      actions={(
        <div className="flex items-center gap-2">
          <button onClick={runScoring} disabled={engineStatus==='Running'} className="px-3 py-2 rounded-xl bg-primary text-white text-sm flex items-center gap-2">
            <AiOutlineThunderbolt className={engineStatus==='Running' ? 'animate-spin' : ''} /> 
            {engineStatus==='Running' ? 'Scoring...' : 'Run Engine'}
          </button>
        </div>
      )}
    >
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left: Rules Configuration */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><AiOutlineUser className="text-primary"/> Fit Rules</h3>
              <button onClick={() => setFitRules(r => [...r, { id: Date.now(), name: 'New Fit Rule', field: 'role', operator: 'equals', value: '', points: 10, type: 'fit' }])} className="p-1 hover:bg-gray-50 rounded"><AiOutlinePlus/></button>
            </div>
            <div className="space-y-3">
              {fitRules.map(rule => (
                <div key={rule.id} className="p-3 bg-gray-50 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between font-semibold">
                    <input value={rule.name} onChange={(e) => setFitRules(fitRules.map(r => r.id === rule.id ? {...r, name: e.target.value} : r))} className="bg-transparent border-none p-0 focus:ring-0 w-2/3" />
                    <span className="text-primary">+{rule.points} pts</span>
                  </div>
                  <div className="flex gap-2">
                    <select value={rule.field} onChange={(e) => setFitRules(fitRules.map(r => r.id === rule.id ? {...r, field: e.target.value} : r))} className="bg-white border-none rounded-lg p-1 text-[10px] flex-1">
                      <option value="role">Role</option>
                      <option value="industry">Industry</option>
                      <option value="employee_count">Employees</option>
                    </select>
                    <select value={rule.operator} onChange={(e) => setFitRules(fitRules.map(r => r.id === rule.id ? {...r, operator: e.target.value} : r))} className="bg-white border-none rounded-lg p-1 text-[10px] flex-1">
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">&gt;</option>
                    </select>
                  </div>
                  <input value={rule.value} onChange={(e) => setFitRules(fitRules.map(r => r.id === rule.id ? {...r, value: e.target.value} : r))} placeholder="Value..." className="w-full bg-white border-none rounded-lg p-2 text-[10px]" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><AiOutlineInteraction className="text-amber-500"/> Engagement Rules</h3>
              <button onClick={() => setEngRules(r => [...r, { id: Date.now(), name: 'New Engagement Rule', field: 'interactions', operator: 'event', value: '', points: 5, type: 'engagement' }])} className="p-1 hover:bg-gray-50 rounded"><AiOutlinePlus/></button>
            </div>
            <div className="space-y-3">
              {engRules.map(rule => (
                <div key={rule.id} className="p-3 bg-amber-50/50 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between font-semibold text-amber-900">
                    <input value={rule.name} onChange={(e) => setEngRules(engRules.map(r => r.id === rule.id ? {...r, name: e.target.value} : r))} className="bg-transparent border-none p-0 focus:ring-0 w-2/3" />
                    <span>+{rule.points} pts</span>
                  </div>
                  <div className="flex gap-2">
                    <select value={rule.value} onChange={(e) => setEngRules(engRules.map(r => r.id === rule.id ? {...r, value: e.target.value} : r))} className="bg-white border-none rounded-lg p-1 text-[10px] w-full">
                      <option value="form_fill">Form Submission</option>
                      <option value="email_open">Email Opened</option>
                      <option value="pricing_view">Pricing View</option>
                      <option value="call">Call Logged</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Lead Queue */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm h-full">
            <div className="mb-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Filter leads..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <AiOutlineThunderbolt size={16} />
                </div>
              </div>
            </div>

            <div className="max-h-[800px] overflow-y-auto pr-2 space-y-2">
              {sortedLeads.map(lead => (
                <div 
                  key={lead.id} 
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedLead?.id === lead.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-50 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${lead.lead_score >= settings.thresholdHot ? 'bg-rose-100 text-rose-600' : lead.lead_score >= settings.thresholdWarm ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                        {lead.lead_score || 0}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">{lead.first_name} {lead.last_name}</div>
                        <div className="text-[10px] text-gray-500">{lead.role} • {lead.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[10px] font-black uppercase tracking-wider ${lead.priority === 'Hot' ? 'text-rose-500' : lead.priority === 'Warm' ? 'text-amber-500' : 'text-gray-400'}`}>
                        {lead.priority || 'Cold'}
                      </div>
                      <div className="text-[9px] text-gray-400 mt-1">Scored {lead.last_scored_at ? new Date(lead.last_scored_at).toLocaleDateString() : 'Never'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Engine Details & Metrics */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><AiOutlineBarChart className="text-primary"/> Scoring Thresholds</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">🔥 Hot Lead Threshold</label>
                <input type="range" min="0" max="100" value={settings.thresholdHot} onChange={(e) => setSettings({...settings, thresholdHot: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
                <div className="text-xs text-rose-500 font-bold mt-1 text-right">{settings.thresholdHot}+ points</div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">⚡ Warm Lead Threshold</label>
                <input type="range" min="0" max="100" value={settings.thresholdWarm} onChange={(e) => setSettings({...settings, thresholdWarm: parseInt(e.target.value)})} className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                <div className="text-xs text-amber-500 font-bold mt-1 text-right">{settings.thresholdWarm}+ points</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl border border-primary/10 p-5">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2"><AiOutlineDashboard/> Funnel Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <div className="text-2xl font-black text-rose-500">{stats.hotCount}</div>
                <div className="text-[10px] text-gray-500">Hot Leads</div>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <div className="text-2xl font-black text-amber-500">{stats.warmCount}</div>
                <div className="text-[10px] text-gray-500">Warm Leads</div>
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm col-span-2">
                <div className="text-2xl font-black text-primary">{stats.avgScore}</div>
                <div className="text-[10px] text-gray-500">Average Lead Score</div>
              </div>
            </div>
          </div>

          {selectedLead && (
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Score Details</h3>
                <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600"><AiOutlinePlus className="rotate-45"/></button>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">{selectedLead.first_name}'s matches:</div>
                <div className="flex flex-wrap gap-2">
                  {(selectedLead.scoring_matched || []).map((m,i) => (
                    <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-lg font-medium">{m}</span>
                  ))}
                  {(!selectedLead.scoring_matched || selectedLead.scoring_matched.length === 0) && <div className="text-[10px] text-gray-400 italic">No rules matched yet</div>}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-800 mb-3">Engine Logs</h4>
            <div className="max-h-32 overflow-auto space-y-2">
              {logs.map((l, i) => (
                <div key={i} className="text-[9px] text-gray-500 border-l-2 border-primary/20 pl-2">
                  <span className="font-bold">[{new Date(l.ts).toLocaleTimeString()}]</span> {l.action}
                </div>
              ))}
              {logs.length === 0 && <div className="text-[9px] text-gray-400 italic">Waiting for activity...</div>}
            </div>
          </div>

        </div>
      </div>
    </SMModuleLayout>
  );
}
