import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import SMModuleLayout from '../../components/SMModuleLayout';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';
import { AiOutlineUser, AiOutlineSetting, AiOutlinePlus, AiOutlineReload } from 'react-icons/ai';
import { assignLeadEngine, bulkAssignEngine } from '../services/assignmentEngine';

const STORAGE_KEY_RULES = 'lead_assignment_rules_v2';
const STORAGE_KEY_SETTINGS = 'lead_assignment_settings_v2';

const DEFAULT_TEAM = [
  { id: 'u-1', name: 'Alex Johnson', rep_weight: 1.5, current_load: 2, max_capacity: 8, email: 'alex@example.com' },
  { id: 'u-2', name: 'Priya Singh', rep_weight: 1.2, current_load: 1, max_capacity: 6, email: 'priya@example.com' },
  { id: 'u-3', name: 'Diego Marquez', rep_weight: 1.0, current_load: 4, max_capacity: 10, email: 'diego@example.com' },
];

function loadJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export default function AssignmentPageV2() {
  const { contacts, updateContact, addContact, captureForms, updateForm, accounts } = useCRM();
  const { showToast } = useSMMToast();

  const leads = useMemo(() => Object.values(contacts).filter(c => (c.status || '').toLowerCase() === 'lead'), [contacts]);
  const unassignedLeads = useMemo(() => leads.filter(l => !l.owner || l.owner === 'Unassigned'), [leads]);

  const [team, setTeam] = useState(() => loadJSON('team_data_v1', DEFAULT_TEAM));

  // Engine settings and rules
  const [autoAssignOn, setAutoAssignOn] = useState(() => loadJSON(STORAGE_KEY_SETTINGS, { autoAssign: false, strictCapacity: true, slaMinutes: 10, reassignAfterMinutes: 5 } ).autoAssign);
  const [settings, setSettings] = useState(() => loadJSON(STORAGE_KEY_SETTINGS, { autoAssign: false, strictCapacity: true, slaMinutes: 10, reassignAfterMinutes: 5 }));
  const [rules, setRules] = useState(() => loadJSON(STORAGE_KEY_RULES, []));

  const [selectedFormId, setSelectedFormId] = useState(() => (captureForms && captureForms[0] && captureForms[0].id) || null);
  const [assignMode, setAssignMode] = useState(() => 'manual'); // manual | round-robin | weighted | availability | rule-based
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const slaTimersRef = useRef({});
  const autoIntervalRef = useRef(null);
  const [engineStatus, setEngineStatus] = useState('Idle'); // Running / Idle / Paused

  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');

  // UI/UX state
  const [tick, setTick] = useState(Date.now());
  const [processingLeads, setProcessingLeads] = useState([]); // leadIds being assigned
  const [draggingLeadId, setDraggingLeadId] = useState(null);
  const [repHighlights, setRepHighlights] = useState({});

  useEffect(() => { localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules)); }, [rules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings)); }, [settings]);

  // ticking clock for timers (real-time)
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const filteredLeads = useMemo(() => {
    return unassignedLeads.filter(l => {
      const matchesSearch = !searchTerm || 
        `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.company || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || (l.priority || '').toLowerCase() === filterPriority.toLowerCase();
      const matchesSource = filterSource === 'all' || (l.source || '').toLowerCase() === filterSource.toLowerCase();
      
      const val = Number(l.deal_value || 0);
      const matchesMin = !minValue || val >= Number(minValue);
      const matchesMax = !maxValue || val <= Number(maxValue);

      return matchesSearch && matchesPriority && matchesSource && matchesMin && matchesMax;
    });
  }, [unassignedLeads, searchTerm, filterPriority, filterSource, minValue, maxValue]);

  // Helpers
  const pushAlert = useCallback((msg) => { setAlerts(a => [...a, { id: Date.now(), msg }]); }, []);
  const pushLog = useCallback((entry) => { setLogs(l => [{ ts: new Date().toISOString(), ...entry }, ...l]); }, []);

  // Rule evaluation
  const matchesRule = useCallback((lead, rule) => {
    // rule example: { id, name, conditions: { source, city, minValue, product }, action: { assignTo } }
    if (!rule || !rule.conditions) return false;
    const c = rule.conditions;
    if (c.source && lead.source !== c.source) return false;
    if (c.city && (lead.city || '').toLowerCase() !== (c.city || '').toLowerCase()) return false;
    if (c.minValue && (lead.deal_value || 0) < Number(c.minValue)) return false;
    if (c.product && lead.product_interest !== c.product) return false;
    return true;
  }, []);

  const applyRules = useCallback((lead) => {
    for (const r of rules) {
      if (matchesRule(lead, r)) return r;
    }
    return null;
  }, [rules, matchesRule]);

  // Assignment operation with logging & SLA handling
  const doAssign = useCallback(async (lead, repId, method = 'Manual', rule=null) => {
    const rep = team.find(t => t.id === repId);
    if (!rep) return null;

    // mark as processing to show 'Assigning...' in UI
    setProcessingLeads(prev => Array.from(new Set([...prev, lead.id])));

    // call engine for enrichment/score/etc but force user
    const res = await assignLeadEngine({ lead, team, crm: { accounts }, forceUserId: repId });
    const payload = res.actionablePayload || {};

    updateContact(lead.id, { owner: rep.name, assignment_status: 'Assigned', assigned_via: method, assignment_rule: rule?.name || null, assigned_at: new Date().toISOString(), lead_score: res.lead_score, enriched: res.enriched, actionablePayload: payload });
    pushLog({ action: 'assign', leadId: lead.id, repId, method, reason: res.reason, rule: rule?.name });

    // UI feedback: highlight rep and update last_assigned
    setRepHighlights(prev => ({ ...prev, [repId]: true }));
    setTeam(prev => prev.map(t => t.id === repId ? { ...t, last_assigned: 'Just now' } : t));
    setTimeout(() => {
      setRepHighlights(prev => ({ ...prev, [repId]: false }));
      setTeam(prev => prev.map(t => t.id === repId ? { ...t, last_assigned: new Date().toLocaleTimeString() } : t));
    }, 3000);

    // start SLA timer if configured
    const reassignAfter = (settings.reassignAfterMinutes || 5) * 60 * 1000;
    if (slaTimersRef.current[lead.id]) clearTimeout(slaTimersRef.current[lead.id]);
    slaTimersRef.current[lead.id] = setTimeout(async () => {
      const c = (contacts || []).find(x => x.id === lead.id);
      if (c && c.assignment_status === 'Assigned' && !c.assignment_accepted) {
        pushLog({ action: 'auto-reassign', leadId: lead.id });
        const otherTeam = team.filter(t => t.id !== repId);
        const selected = otherTeam.length ? otherTeam[Math.floor(Math.random()*otherTeam.length)] : rep;
        await doAssign(lead, selected.id, 'Auto-Reassign');
      }
    }, reassignAfter);

    // remove processing state
    setProcessingLeads(prev => prev.filter(id => id !== lead.id));

    return res;
  }, [team, accounts, updateContact, pushLog, settings, contacts]);

  // High-level assignLead by id
  const assignLeadById = useCallback(async (leadId, repId, method='Manual', rule=null) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    // show assigning state
    setProcessingLeads(prev => Array.from(new Set([...prev, leadId])));
    await doAssign(lead, repId, method, rule);
    // update team load locally and brief +1 animation via highlight
    setTeam(prev => prev.map(t => t.id === repId ? { ...t, current_load: (t.current_load||0)+1, last_assigned: 'Just now' } : t));
    setTimeout(() => setTeam(prev => prev.map(t => t.id === repId ? { ...t, last_assigned: new Date().toLocaleTimeString() } : t)), 3000);
    // clear processing mark (if not cleared by doAssign)
    setProcessingLeads(prev => prev.filter(id => id !== leadId));
  }, [leads, doAssign]);

  // Auto-assign loop
  useEffect(() => {
    if (autoAssignOn) {
      setEngineStatus('Running');
      autoIntervalRef.current = setInterval(async () => {
        const queue = [...unassignedLeads];
        if (!queue.length) return;
        // priority: by lead_score desc (if exists) or created_at
        queue.sort((a,b) => (b.lead_score||0) - (a.lead_score||0) || new Date(a.created_at) - new Date(b.created_at));
        for (const lead of queue) {
          // check rules first
          const rule = applyRules(lead);
          if (rule && rule.action && rule.action.assignTo) {
            // assign to specified rep
            const rep = team.find(t => t.id === rule.action.assignTo);
            if (rep) {
              // capacity enforcement
              if (settings.strictCapacity && rep.current_load >= rep.max_capacity) continue;
              await assignLeadById(lead.id, rep.id, 'Rule-Based', rule);
              break; // assign one per interval loop to avoid bursts
            }
          }

          // fallback: pick weighted available rep
          // filter available
          const available = team.filter(t => (t.available !== 'Offline') && (!settings.strictCapacity || (t.current_load || 0) < (t.max_capacity || Infinity)));
          if (!available.length) {
            pushAlert('No available reps for auto-assignment');
            break;
          }
          const selected = available[Math.floor(Math.random()*available.length)];
          await assignLeadById(lead.id, selected.id, 'Auto');
          break;
        }
      }, 3000);
    } else {
      setEngineStatus('Idle');
      if (autoIntervalRef.current) { clearInterval(autoIntervalRef.current); autoIntervalRef.current = null; }
    }
    return () => { if (autoIntervalRef.current) clearInterval(autoIntervalRef.current); };
  }, [autoAssignOn, unassignedLeads, team, applyRules, assignLeadById, settings]);

  // Drag drop handlers
  const onDragStart = useCallback((e, leadId) => { e.dataTransfer.setData('leadId', leadId); setDraggingLeadId(leadId); }, []);
  const onDropOnRep = useCallback((e, repId) => { e.preventDefault(); const leadId = e.dataTransfer.getData('leadId'); setDraggingLeadId(null); if (leadId) assignLeadById(leadId, repId, 'DragDrop'); }, [assignLeadById]);
  const onDragOver = useCallback((e) => { e.preventDefault(); }, []);
  const onDragEnd = useCallback((e) => { setDraggingLeadId(null); }, []);

  // Rules builder simple UI
  const addRule = () => {
    const newRule = { id: `rule-${Date.now()}`, name: `Rule ${rules.length+1}`, conditions: {}, action: {} };
    setRules(r => [newRule, ...r]);
    pushLog({ action: 'add_rule', rule: newRule.name });
  };
  const removeRule = (id) => { setRules(r => r.filter(x => x.id !== id)); pushLog({ action: 'remove_rule', ruleId: id }); };

  // Simulation helpers
  const injectSampleLeads = () => {
    const now = new Date().toISOString();
    addContact({ first_name: 'Demo', last_name: 'Lead', email: `demo.${Date.now()}@example.com`, status: 'lead', company: 'DemoCorp', created_at: now, source: 'Website', priority: 'Warm', deal_value: 12000 });
    addContact({ first_name: 'Acme', last_name: 'Tester', email: `acme.${Date.now()}@acme.com`, status: 'lead', company: 'Acme Corp', created_at: now, source: 'Import', priority: 'Hot', deal_value: 50000 });
    addContact({ first_name: 'Tech', last_name: 'Flow', email: `tech.${Date.now()}@techflow.io`, status: 'lead', company: 'TechFlow Systems', created_at: now, source: 'Website', priority: 'Cold', deal_value: 3000 });
    showToast('Injected sample leads', { type: 'success' });
  };

  const simulateLoad = (count=50) => {
    for (let i=0;i<count;i++) {
      const now = new Date().toISOString();
      addContact({ first_name: `Sim${i}`, last_name: 'Lead', email: `sim${i}@example.com`, status: 'lead', company: 'SimCorp', created_at: now, source: i%2? 'Import':'Website', priority: i%3? 'Warm':'Cold', deal_value: Math.floor(Math.random()*100000) });
    }
    pushLog({ action: 'simulate_load', count });
    showToast(`Simulated ${count} leads`, { type: 'success' });
  };

  // Assignment lifecycle controls: accept/ignore
  const acceptAssignment = (leadId) => {
    updateContact(leadId, { assignment_status: 'Accepted', assignment_accepted: true, accepted_at: new Date().toISOString() });
    pushLog({ action: 'accept', leadId });
  };
  const ignoreAssignment = (leadId) => {
    updateContact(leadId, { assignment_status: 'Ignored', assignment_accepted: false });
    pushLog({ action: 'ignore', leadId });
  };
  const returnToQueue = (leadId) => {
    updateContact(leadId, { owner: 'Unassigned', assignment_status: 'Unassigned', assigned_at: null, assignment_accepted: false });
    pushLog({ action: 'return_to_queue', leadId });
  };

  // Engine overview metrics
  const metrics = useMemo(() => {
    const totalProcessed = logs.filter(l => ['assign','auto-reassign','reassign','accept'].includes(l.action)).length;
    const unassigned = unassignedLeads.length;
    const avgAssignTime = 0; // placeholder
    const slaBreaches = logs.filter(l => l.action === 'auto-reassign').length;
    const mostLoaded = team.reduce((a,b)=> ( (b.current_load||0) > (a.current_load||0)? b : a), team[0]);
    const leastLoaded = team.reduce((a,b)=> ( (b.current_load||0) < (a.current_load||0)? b : a), team[0]);
    return { totalProcessed, unassigned, avgAssignTime, slaBreaches, mostLoaded, leastLoaded };
  }, [logs, unassignedLeads, team]);

  const distribution = useMemo(() => {
    const total = team.reduce((s,t)=> s + (t.current_load||0), 0);
    return team.map(t => ({ id: t.id, name: t.name, load: t.current_load||0, pct: total? Math.round(((t.current_load||0)/total)*100): 0 }));
  }, [team]);

  return (
    <SMModuleLayout
      title={<div className="flex items-center gap-4"><span className="text-gray-800">Lead Assignment</span>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${engineStatus==='Running'? 'bg-emerald-500 animate-pulse':'bg-gray-400'}`}></span>
          <div className={`text-xs px-3 py-1 rounded-full ${engineStatus==='Running'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-700'}`}>{engineStatus}</div>
          {engineStatus==='Running' && <div className="text-xs text-gray-500">Assigning in real-time…</div>}
        </div>
      </div>}
      subtitle="Rule-driven engine with operational controls"
      color="#714B67"
      icon={<AiOutlineUser className="text-white" size={18} />}
      actions={(
        <div className="flex items-center gap-2">
          <button onClick={() => injectSampleLeads()} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm">Inject Sample Leads</button>
          <button onClick={() => simulateLoad(100)} className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-700">Simulate Load</button>
          <button onClick={() => { setAutoAssignOn(s => !s); setSettings(s=>({...s, autoAssign: !s.autoAssign})); showToast('Toggled auto-assign', { type: 'info' }); }} className={`px-3 py-2 rounded-xl text-sm ${autoAssignOn? 'bg-amber-500 text-white' : 'bg-primary text-white'}`}>{autoAssignOn? 'Auto: ON':'Auto: OFF'}</button>
        </div>
      )}
    >
      <div>
        <div className="mb-4 md:hidden flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => injectSampleLeads()} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm">Inject</button>
            <button onClick={() => simulateLoad(100)} className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-700">Simulate</button>
            <button onClick={() => { setAutoAssignOn(s => !s); setSettings(s=>({...s, autoAssign: !s.autoAssign})); showToast('Toggled auto-assign', { type: 'info' }); }} className={`px-3 py-2 rounded-xl text-sm ${autoAssignOn? 'bg-amber-500 text-white' : 'bg-primary text-white'}`}>{autoAssignOn? 'Auto: ON':'Auto: OFF'}</button>
          </div>
        </div>
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Assignment Engine Control Panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800">Assignment Engine</h3>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-500">Strategy</label>
                <select value={assignMode} onChange={(e)=>setAssignMode(e.target.value)} className="w-full mt-2 p-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-700">
                  <option value="manual">Manual</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="weighted">Weighted Round Robin</option>
                  <option value="availability">Availability-Based</option>
                  <option value="rule-based">Rule-Based Routing</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-700">Auto-Assignment</div>
                <input type="checkbox" checked={autoAssignOn} onChange={(e)=>{setAutoAssignOn(e.target.checked); setSettings(s=>({...s, autoAssign: e.target.checked}));}} />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-700">Capacity Enforcement</label>
                  <select value={settings.strictCapacity? 'strict':'flex'} onChange={(e)=>setSettings(s=>({...s, strictCapacity: e.target.value==='strict'}))} className="text-sm">
                    <option value="strict">Strict</option>
                    <option value="flex">Flexible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700">SLA (mins): reassign if not accepted</label>
                <input type="number" value={settings.reassignAfterMinutes} onChange={(e)=>setSettings(s=>({...s, reassignAfterMinutes: Number(e.target.value)}))} className="w-full mt-2 p-2 border rounded-md text-sm" />
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">Rules Builder</h4>
                  <button onClick={addRule} className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-700">Add Rule</button>
                </div>
                <div className="mt-3 space-y-2">
                  {rules.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="text-sm">{r.name}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={()=>removeRule(r.id)} className="text-xs text-rose-500">Remove</button>
                      </div>
                    </div>
                  ))}
                  {rules.length===0 && <div className="text-xs text-gray-400">No active rules</div>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Center: Smart Waiting Queue */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm" style={{touchAction: 'pan-y'}}>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Waiting Queue ({filteredLeads.length})</h3>
                <div className="text-xs text-gray-500">Total Unassigned: {unassignedLeads.length}</div>
              </div>

              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search by name, email or company..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    className="bg-gray-50 border-none rounded-xl text-xs px-3 py-2 focus:ring-2 focus:ring-primary/20"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="hot">🔥 Hot</option>
                    <option value="warm">⚡ Warm</option>
                    <option value="cold">❄️ Cold</option>
                  </select>

                  <select 
                    className="bg-gray-50 border-none rounded-xl text-xs px-3 py-2 focus:ring-2 focus:ring-primary/20"
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="import">Import</option>
                    <option value="referral">Referral</option>
                  </select>

                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold ml-1">Value</span>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="w-16 bg-transparent border-none text-xs p-1 focus:ring-0" 
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="w-16 bg-transparent border-none text-xs p-1 focus:ring-0" 
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                    />
                  </div>

                  {(searchTerm || filterPriority !== 'all' || filterSource !== 'all' || minValue || maxValue) && (
                    <button 
                      onClick={() => { setSearchTerm(''); setFilterPriority('all'); setFilterSource('all'); setMinValue(''); setMaxValue(''); }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto pr-2">
              <div className="divide-y divide-gray-100">
                {filteredLeads.length===0 && <div className="p-8 text-center text-gray-400">No leads match your filters</div>}
                {filteredLeads.map(lead => {
                  const created = new Date(lead.created_at || lead.createdAt || Date.now()).getTime();
                  const elapsed = Math.max(0, tick - created);
                  const waitingMins = Math.floor(elapsed/60000);
                  const waitingSecs = Math.floor((elapsed/1000)%60);
                  const timerStr = `${waitingMins}:${String(waitingSecs).padStart(2,'0')}`;
                  const reassignMs = (settings.reassignAfterMinutes || 5) * 60 * 1000;
                  const progressPct = Math.min(100, Math.round((elapsed / Math.max(1, reassignMs)) * 100));
                  const approaching = progressPct >= 75 && progressPct < 100;
                  const overdue = progressPct >= 100;
                  const processing = processingLeads.includes(lead.id);
                  return (
                    <div key={lead.id} draggable onDragStart={(e)=>onDragStart(e, lead.id)} onDragEnd={onDragEnd} className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all ${processing? 'opacity-60 pointer-events-none':''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">{(lead.first_name||'?')[0]}{(lead.last_name||'?')[0]}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{lead.first_name} {lead.last_name} <span className="text-xs text-gray-500">• {lead.company}</span></div>
                          <div className="text-xs text-gray-400">{lead.email} • {lead.source || 'Website'}</div>
                          <div className="text-xs text-gray-400">Priority: {lead.priority || 'Warm'} • Value: ${lead.deal_value || 0}</div>
                          <div className="text-xs text-gray-500 mt-1">Waiting: {timerStr} <span className="ml-2">{approaching && <span className="text-amber-600">⚠️ Approaching SLA</span>}{overdue && <span className="text-rose-500">Overdue</span>}</span></div>

                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-2">
                            <div className={`${overdue? 'bg-rose-500':'bg-emerald-400'} h-2`} style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {processing ? <div className="text-xs text-gray-500">Assigning…</div> : (
                          <>
                            <button onClick={()=>{ showToast('Enriching...'); }} className="px-3 py-1 rounded-xl bg-gray-100 text-xs text-gray-700">Enrich</button>
                            <select onChange={(e)=>assignLeadById(lead.id, e.target.value, 'Manual')} defaultValue="" className="px-2 py-1 border rounded-md text-sm">
                              <option value="">Assign</option>
                              {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button onClick={()=>returnToQueue(lead.id)} className="px-3 py-1 rounded-xl bg-rose-500 text-xs text-white">Remove</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button onClick={()=>setSelectedLeads(filteredLeads.map(l=>l.id))} className="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700">Select All Filtered</button>
              <button onClick={()=>bulkAssignEngine({ leadIds: selectedLeads, team, crm: { accounts }, contacts: Object.fromEntries((contacts||[]).map(c=>[c.id,c])), updateContact }).then(res=>showToast('Bulk assigned', {type:'success'}))} className="px-3 py-2 bg-primary rounded-md text-sm text-white">Bulk Assign</button>
            </div>

          </div>
        </div>

        {/* Right: Rep Management Panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="space-y-4">
            {team.map(t => {
              const myLeads = leads.filter(l => l.owner === t.name);
              const loadPct = Math.min(100, Math.round(((t.current_load||0) / (t.max_capacity||1)) * 100));
              return (
                <div key={t.id} onDrop={(e)=>onDropOnRep(e, t.id)} onDragOver={onDragOver} className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm ${repHighlights[t.id]? 'ring-2 ring-primary/40':''} ${draggingLeadId? 'hover:bg-gray-50':''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{t.name}</div>
                      <div className="text-xs text-gray-500">Last assigned: {t.last_assigned || '—'}</div>
                    </div>
                    <div className="text-xs text-gray-500">{myLeads.length} leads</div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-emerald-400" style={{ width: `${loadPct}%` }} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-gray-500">Capacity {t.current_load}/{t.max_capacity} ({loadPct}%)</div>
                      {repHighlights[t.id] && <div className="text-xs text-emerald-600 ml-2 animate-pulse">+1</div>}
                    </div>
                    <div className="text-xs text-gray-500">Weight: {t.rep_weight}</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={()=>showToast('Viewing leads...')} className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-700">View leads</button>
                    <button onClick={()=>{ setTeam(prev=>prev.map(p=>p.id===t.id?{...p, paused:!p.paused}:p)); showToast('Toggled pause', {type:'info'});} } className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-700">Pause</button>
                    <button onClick={()=>{ setTeam(prev=>prev.map(p=>p.id===t.id?{...p, current_load:0}:p)); showToast('Cleared load', {type:'success'});} } className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-700">Reassign all</button>
                  </div>
                </div>
              );
            })}

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-800">Engine Overview</div>
                <div className={`text-xs px-2 py-1 rounded-full ${engineStatus==='Running'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-700'}`}>{engineStatus}</div>
              </div>
              <div className="text-xs text-gray-500 mt-3">Processed: {metrics.totalProcessed} • Unassigned: {metrics.unassigned} • SLA breaches: {metrics.slaBreaches}</div>
              <div className="text-xs text-gray-500 mt-2">Most loaded: {metrics.mostLoaded?.name} • Least: {metrics.leastLoaded?.name}</div>
              <div className="mt-3">
                <div className="w-full h-3 rounded overflow-hidden flex">
                  {distribution.map((d,i)=> (
                    <div key={d.id} title={`${d.name}: ${d.load}`} style={{ width: `${d.pct}%` }} className={`${i%3===0? 'bg-indigo-500': i%3===1? 'bg-emerald-400':'bg-sky-400'}`} />
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {distribution.map(d=> `${d.name} ${d.load}`).join(' • ')}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Logs drawer (simple) */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-bold text-gray-800">Assignment Log</h4><div className="text-xs text-gray-500">{logs.length} entries</div></div>
          <div className="text-xs text-gray-600">
            {logs.map(l=> (
              <div key={l.ts} className="mb-2">[{new Date(l.ts).toLocaleTimeString()}] {l.action} {l.leadId?`lead:${l.leadId}`:''} {l.repId?`rep:${l.repId}`:''} {l.rule?`rule:${l.rule}`:''}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </SMModuleLayout>
  );
}
