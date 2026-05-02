import React, { useMemo, useState, useEffect, useCallback } from 'react';
import SMModuleLayout from '../../components/SMModuleLayout';
import { useCRM } from '../../core-crm/context/CRMContext';
import { useSMMToast } from '../../components/SMMToastProvider';
import { AiOutlineUser, AiOutlineReload, AiOutlineSetting, AiOutlinePlus } from 'react-icons/ai';
import { assignLeadEngine, bulkAssignEngine } from '../services/assignmentEngine';

const STORAGE_KEY = 'lead_assignment_rules_v1';

const DEFAULT_TEAM = [
  { id: 'u-1', name: 'Alex Johnson', rep_weight: 1.5, current_load: 2, max_capacity: 8 },
  { id: 'u-2', name: 'Priya Singh', rep_weight: 1.2, current_load: 1, max_capacity: 6 },
  { id: 'u-3', name: 'Diego Marquez', rep_weight: 1.0, current_load: 4, max_capacity: 10 },
];

export default function AssignmentPage() {
  const { contacts, updateContact, addContact, captureForms, updateForm, accounts } = useCRM();
  const { showToast } = useSMMToast();

  const leads = useMemo(() => Object.values(contacts).filter(c => (c.status || '').toLowerCase() === 'lead'), [contacts]);
  const unassignedLeads = useMemo(() => leads.filter(l => !l.owner || l.owner === 'Unassigned'), [leads]);

  const [team] = useState(DEFAULT_TEAM);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [rules, setRules] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });

  const [selectedFormId, setSelectedFormId] = useState(() => (captureForms && captureForms[0] && captureForms[0].id) || null);
  const [assignMode, setAssignMode] = useState(() => 'manual'); // manual | round-robin | load
  const [engineRunning, setEngineRunning] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(rules)); }, [rules]);

  useEffect(() => {
    const form = captureForms?.find(f => f.id === selectedFormId);
    if (form && form.automation?.autoAssignment) setAssignMode(form.automation.autoAssignment);
  }, [selectedFormId, captureForms]);

  const toggleSelectLead = useCallback((id) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const assignLead = useCallback(async (leadId, userId) => {
    const lead = contacts.find ? contacts.find(c => c.id === leadId) : (contacts[leadId] || null);
    if (!lead) return showToast('Lead not found', { type: 'error' });
    const res = await assignLeadEngine({ lead, team, crm: { accounts }, forceUserId: userId });
    if (res.assignedRep) {
      updateContact(leadId, { owner: res.assignedRep.name, lead_score: res.lead_score, enriched: res.enriched, actionablePayload: res.actionablePayload });
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
      showToast(`Assigned lead to ${res.assignedRep.name} (${res.reason})`, { type: 'success' });
    } else {
      showToast('Could not assign lead: ' + res.reason, { type: 'warning' });
    }
  }, [team, updateContact, showToast, contacts, accounts]);

  const bulkAssign = useCallback(async (userId) => {
    const user = team.find(t => t.id === userId);
    if (!user) return showToast('User not found', { type: 'error' });
    const results = await bulkAssignEngine({ leadIds: selectedLeads, team, crm: { accounts }, contacts: Object.fromEntries(contacts.map(c => [c.id, c])), updateContact });
    setSelectedLeads([]);
    const assignedCount = results.filter(r => r.result.assignedRep).length;
    showToast(`Assigned ${assignedCount} lead(s) to ${user.name}`, { type: 'success' });
  }, [selectedLeads, team, updateContact, showToast, contacts, accounts]);

  const applyAutoAssignToForm = useCallback((formId, mode) => {
    setRules(prev => ({ ...prev, [formId]: { autoAssignment: mode } }));
    const form = captureForms.find(f => f.id === formId);
    if (form) {
      updateForm(formId, { automation: { ...form.automation, autoAssignment: mode } });
    }
    showToast('Auto-assignment setting saved', { type: 'success' });
  }, [captureForms, updateForm, showToast]);

  const roundRobinAssign = useCallback(async () => {
    if (!unassignedLeads.length) return showToast('No unassigned leads', { type: 'info' });
    setEngineRunning(true);
    const res = await bulkAssignEngine({ leadIds: unassignedLeads.map(l=>l.id), team, crm: { accounts }, contacts: Object.fromEntries(contacts.map(c => [c.id, c])), updateContact });
    const assigned = res.filter(r => r.result.assignedRep).length;
    setEngineRunning(false);
    showToast(`Weighted round-robin assigned ${assigned} leads`, { type: 'success' });
  }, [unassignedLeads, team, updateContact, showToast, contacts, accounts]);

  return (
    <SMModuleLayout
      title={<div className="flex items-center gap-4">
        <span className="text-gray-800">Lead Assignment</span>
        <span className="ml-4 inline-flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${engineRunning ? 'bg-emerald-50 text-emerald-700 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>{engineRunning ? 'Engine: Running' : 'Engine: Idle'}</span>
        </span>
      </div>}
      subtitle="Route and distribute incoming leads to your team"
      color="#714B67"
      icon={<AiOutlineUser className="text-white" size={18} />}
      actions={(
        <div className="flex items-center gap-2">
          <button onClick={() => { setSelectedLeads([]); showToast('Selection cleared', { type: 'info' }); }} className="px-3 py-2 rounded-xl bg-gray-100 text-sm text-gray-700">Clear</button>
          <button onClick={() => {
            const now = new Date().toISOString();
            addContact({ first_name: 'Demo', last_name: 'Lead', email: `demo.${Date.now()}@example.com`, status: 'lead', company: 'DemoCorp', created_at: now });
            addContact({ first_name: 'Acme', last_name: 'Tester', email: `acme.${Date.now()}@acme.com`, status: 'lead', company: 'Acme Corp', created_at: now });
            addContact({ first_name: 'Tech', last_name: 'Flow', email: `tech.${Date.now()}@techflow.io`, status: 'lead', company: 'TechFlow Systems', created_at: now });
            showToast('Injected sample leads', { type: 'success' });
          }} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm">Inject Sample Leads</button>
          <button onClick={() => roundRobinAssign()} className={`px-3 py-2 rounded-xl text-white text-sm ${engineRunning ? 'bg-amber-500' : 'bg-primary'}`}>{engineRunning ? 'Running...' : 'Run Round-Robin'}</button>
        </div>
      )}
    >
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Configuration Panel */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500">Capture Form</label>
                <select value={selectedFormId || ''} onChange={(e) => setSelectedFormId(e.target.value)} className="w-full mt-2 p-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-700">
                  {captureForms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Assignment Mode</label>
                <select value={assignMode} onChange={(e) => setAssignMode(e.target.value)} className="w-full mt-2 p-3 bg-white rounded-xl border border-gray-100 text-sm text-gray-700">
                  <option value="manual">Manual</option>
                  <option value="round-robin">Round Robin</option>
                  <option value="load">Load Balancing</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => applyAutoAssignToForm(selectedFormId, assignMode)} className="flex-1 px-4 py-2 rounded-xl bg-primary text-white">Save</button>
                <button onClick={() => { setAssignMode('manual'); setRules({}); showToast('Reset to manual', { type: 'info' }); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700">Reset</button>
              </div>
              <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">Auto-assignment settings are per-capture-form. Manual assignments do not change form settings.</div>
            </div>
          </div>
        </div>

        {/* Center: Leads Pipeline (Waiting Room) */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Waiting Room</h3>
              <div className="text-xs text-gray-500">Unassigned: {unassignedLeads.length}</div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[620px] overflow-auto">
              {unassignedLeads.length === 0 && (
                <div className="p-12 text-center text-gray-400">No leads waiting. Inject sample leads to test flow.</div>
              )}

              {unassignedLeads.map(l => (
                <div key={l.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 transition-all rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">{(l.first_name||'?')[0]}{(l.last_name||'?')[0]}</div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{l.first_name} {l.last_name}</div>
                      <div className="text-xs text-gray-400">{l.email} • {l.company}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { /* Enrich action */ showToast('Enriching...', { type: 'info' }); }} className="px-3 py-1 rounded-xl bg-gray-100 text-xs text-gray-700">Enrich</button>
                    <div className="relative">
                      <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                        <select onChange={(e) => assignLead(l.id, e.target.value)} defaultValue="" className="bg-transparent text-xs text-gray-700 p-1">
                          <option value="">Assign</option>
                          {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => { /* delete */ updateContact(l.id, { status: 'deleted' }); showToast('Deleted lead', { type: 'info' }); }} className="px-3 py-1 rounded-xl bg-rose-500 text-xs text-white">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Team Intelligence (cards + gauges) */}
        <div className="col-span-12 lg:col-span-3">
          <div className="space-y-4">
            {team.map(t => {
              const myLeads = leads.filter(l => l.owner === t.name);
              const loadPct = Math.min(100, Math.round(((t.current_load||0) / (t.max_capacity||1)) * 100));
              return (
                <div key={t.id} className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{t.name}</div>
                      <div className="text-xs text-gray-500">Weight: <span className="font-semibold">{t.rep_weight}</span></div>
                    </div>
                    <div className="text-xs text-gray-500">{myLeads.length} leads</div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="h-2 bg-emerald-400" style={{ width: `${loadPct}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Capacity {t.current_load}/{t.max_capacity} ({loadPct}%)</div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => { /* view profile */ }} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs">Profile</button>
                    <a href={`mailto:${t.email || ''}`} className="px-3 py-1 rounded-xl bg-gray-100 text-gray-700 text-xs">Email</a>
                  </div>
                </div>
              );
            })}

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-800">Engine Overview</div>
                <div className={`text-xs px-2 py-1 rounded-full ${engineRunning ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>{engineRunning ? 'Running' : 'Idle'}</div>
              </div>
              <div className="text-xs text-gray-500 mt-3">Weighted distribution based on rep weight & capacity. Account affinity routes to incumbent owners.</div>
            </div>
          </div>
        </div>
      </div>
    </SMModuleLayout>
  );
}
