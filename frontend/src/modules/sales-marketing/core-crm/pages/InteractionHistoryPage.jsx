import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { AiOutlineHistory, AiOutlineSearch, AiOutlinePlus, AiOutlineDownload } from 'react-icons/ai';
import { useDataLayer } from '../data-layer/useDataLayer';
import DynamicForm from '../components/DynamicForm';

const ACTIVITY_FIELD_GROUPS = [{
  id: 'act-main', label: 'Interaction', collapsed: false,
  fields: [
    { id: 'type', key: 'type', label: 'Type', type: 'dropdown', required: true, options: [ { value: 'Call', label: 'Call' }, { value: 'Email', label: 'Email' }, { value: 'Meeting', label: 'Meeting' }, { value: 'Note', label: 'Note' } ] },
    { id: 'subject', key: 'subject', label: 'Subject', type: 'text', required: true },
    { id: 'account_id', key: 'account_id', label: 'Account', type: 'dropdown', options: [] },
    { id: 'contact_id', key: 'contact_id', label: 'Contact', type: 'dropdown', options: [] },
    { id: 'created_at', key: 'created_at', label: 'Date', type: 'date' },
    { id: 'source', key: 'source', label: 'Source', type: 'text' },
    { id: 'notes', key: 'notes', label: 'Notes', type: 'textarea' },
  ]
}];

function downloadCSV(rows, filename = 'interactions.csv') {
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function IconForType({ type }) {
  const common = 'w-4 h-4';
  switch (type) {
    case 'Email':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 8.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
    case 'Call':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M22 16.92V20a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.18 2 2 0 0 1 4 2h3.09a2 2 0 0 1 2 1.72c.12.86.38 1.7.78 2.5a2 2 0 0 1-.45 2.11L8.91 10.09a16 16 0 0 0 6 6l1.74-1.74a2 2 0 0 1 2.11-.45c.8.4 1.64.66 2.5.78A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
    case 'Meeting':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M21 10h-6V4H9v6H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none"><path d="M3 7v13h18V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 3h8v4H8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      );
  }
}

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()) - new Date(d.toDateString())) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString();
}

function groupByDate(items) {
  const map = {};
  (items || []).forEach((it) => {
    const key = new Date(it.created_at).toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(it);
  });
  // sort keys descending
  const keys = Object.keys(map).sort((a,b) => new Date(b) - new Date(a));
  return keys.map(k => ({ date: k, items: map[k].sort((x,y) => new Date(y.created_at) - new Date(x.created_at)) }));
}

function smartTitle(act) {
  if (act.subject && act.subject.trim()) return act.subject;
  if (act.type === 'Call') return `Call with ${act.contact_id || act.account_id || 'contact'}`;
  if (act.type === 'Email') return `Email to ${act.contact_id || act.account_id || 'recipient'}`;
  return `${act.type} - ${act.source || ''}`;
}

const InteractionHistoryPage = () => {
  const { activities, accounts, contacts, addActivity } = useDataLayer();
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fieldGroups = useMemo(() => {
    const fg = JSON.parse(JSON.stringify(ACTIVITY_FIELD_GROUPS));
    const accOpts = (accounts || []).map(a => ({ value: a.id, label: a.name }));
    const contactOpts = (contacts || []).map(c => ({ value: c.id, label: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email }));
    fg[0].fields = fg[0].fields.map(f => {
      if (f.key === 'account_id') return { ...f, options: accOpts };
      if (f.key === 'contact_id') return { ...f, options: contactOpts };
      return f;
    });
    return fg;
  }, [accounts, contacts]);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    const acts = activities || [];

    return acts.filter((a) => {
      if (q) {
        const hay = `${a.type || ''} ${a.subject || ''} ${a.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (accountFilter && a.account_id !== accountFilter) return false;
      if (contactFilter && a.contact_id !== contactFilter) return false;
      if (startDate) {
        const sd = new Date(startDate);
        if (new Date(a.created_at) < sd) return false;
      }
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23,59,59,999);
        if (new Date(a.created_at) > ed) return false;
      }
      return true;
    }).sort((x,y) => new Date(y.created_at) - new Date(x.created_at));
  }, [activities, search, accountFilter, contactFilter, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page-1)*pageSize, page*pageSize);
  const grouped = useMemo(() => groupByDate(paginated), [paginated]);

  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const openCreate = () => { setEditingActivity(null); setDrawerOpen(true); };
  const handleSubmit = (values) => {
    const payload = { ...values, created_at: values.created_at || new Date().toISOString() };
    addActivity(payload);
    setDrawerOpen(false);
  };

  const handleSelect = (act, idx) => {
    setSelectedActivity(act);
    setFocusedIndex(idx);
  };

  const generateSummaryFor = (act) => {
    if (!act) return;
    // Simple mock summarization: aggregate last 5 interactions for same account/contact
    const same = (activities || []).filter(a => (act.account_id && a.account_id === act.account_id) || (act.contact_id && a.contact_id === act.contact_id)).slice(0,5);
    const calls = same.filter(s => s.type === 'Call').length;
    const emails = same.filter(s => s.type === 'Email').length;
    const meetings = same.filter(s => s.type === 'Meeting').length;
    const last = same[0];
    const name = act.account_id ? (accounts.find(a=>a.id===act.account_id)||{}).name : (contacts.find(c=>c.id===act.contact_id)||{}).first_name;
    const summary = `Recent activity with ${name || 'this contact'}: ${calls} calls, ${emails} emails, ${meetings} meetings. Last touch: ${last ? `${last.type} on ${new Date(last.created_at).toLocaleDateString()}` : 'N/A'}.`;
    setSelectedSummary(summary);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(fi => Math.min(fi + 1, paginated.length - 1));
      setSelectedActivity(paginated[Math.min(focusedIndex + 1, paginated.length - 1)] || null);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(fi => Math.max(fi - 1, 0));
      setSelectedActivity(paginated[Math.max(focusedIndex - 1, 0)] || null);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (selectedActivity) {
        setDrawerOpen(true);
        setEditingActivity(selectedActivity);
      }
    }
  };

  useEffect(() => {
    const id = 'crm-tl-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.innerHTML = `@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .ani-fade-up{animation:fadeUp .45s ease both}`;
      document.head.appendChild(s);
    }
  }, []);

  const handleExport = () => {
    const rows = filtered.map(a => ({
      id: a.id,
      type: a.type,
      subject: a.subject,
      date: a.created_at,
      account: (accounts.find(x=>x.id===a.account_id)||{}).name || '',
      contact: ((contacts.find(x=>x.id===a.contact_id)||{}).first_name || '') + ' ' + ((contacts.find(x=>x.id===a.contact_id)||{}).last_name || ''),
      source: a.source || '',
      notes: a.notes || '',
    }));
    downloadCSV(rows, 'interactions.csv');
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="interactions">
      <SMModuleLayout
        title="Interaction History"
        subtitle="Timeline of calls, emails and meetings"
        color="#296374"
        icon={<AiOutlineHistory className="text-white" size={18} />}
        actions={(
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-9 pr-3 py-2 text-sm border border-gray-100 rounded-xl"
                placeholder="Search interactions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            <select value={accountFilter} onChange={(e) => { setAccountFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-100 rounded-xl bg-white">
              <option value="">All accounts</option>
              {(accounts || []).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>

            <select value={contactFilter} onChange={(e) => { setContactFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-100 rounded-xl bg-white">
              <option value="">All contacts</option>
              {(contacts || []).map(c => (
                <option key={c.id} value={c.id}>{`${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-100 rounded-xl bg-white" />
              <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="px-3 py-2 text-sm border border-gray-100 rounded-xl bg-white" />
            </div>

            <button onClick={() => { setAccountFilter(''); setContactFilter(''); setStartDate(''); setEndDate(''); setSearch(''); setPage(1); }} className="px-3 py-2 text-sm bg-gray-50 rounded-xl border">Clear</button>
            <button onClick={openCreate} className="px-3 py-2 text-sm bg-primary text-white rounded-xl">+ Add Interaction</button>
            <button onClick={handleExport} className="px-3 py-2 text-sm bg-gray-50 rounded-xl border flex items-center gap-2"><AiOutlineDownload /> Export</button>
          </div>
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline column */}
          <div className="relative pb-24 lg:pb-36 lg:col-span-9" tabIndex={0} onKeyDown={handleKeyDown}>
            <div className="absolute left-4 sm:left-6 top-6 bottom-24 w-px bg-gradient-to-b from-primary/40 to-primary/10" />

            {grouped.map((grp) => (
              <div key={grp.date} className="mb-6 pl-10 sm:pl-12">
                <div className="text-sm font-semibold text-gray-500 mb-3">{dateLabel(grp.date)}</div>
                <div className="space-y-4">
                  {grp.items.map((act) => {
                    const idx = paginated.findIndex(p => p.id === act.id);
                    return (
                      <div key={act.id} className={`relative group ${selectedActivity?.id===act.id ? 'ring-2 ring-primary/40' : ''}`} role="button" tabIndex={0} onClick={() => handleSelect(act, idx)} onKeyDown={(e) => { if (e.key === 'Enter') { setDrawerOpen(true); setEditingActivity(act); } }}>
                        {/* Node */}
                        <div className="absolute left-2 sm:left-1 top-3 w-10 h-10 flex items-center justify-center -translate-x-1/2 ani-fade-up">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transform transition-transform duration-200 group-hover:scale-110`} style={{ background: act.type === 'Email' ? 'linear-gradient(135deg,#60A5FA,#2563EB)' : act.type === 'Call' ? 'linear-gradient(135deg,#34D399,#059669)' : 'linear-gradient(135deg,#F472B6,#C026D3)'}}>
                            <IconForType type={act.type} />
                          </div>
                        </div>

                        {/* Card */}
                        <div className={`ml-8 sm:ml-10 bg-white/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer focus:outline-none ${selectedActivity?.id===act.id ? 'ring-2 ring-primary/30' : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <div className="text-sm font-semibold text-gray-800 truncate">{smartTitle(act)}</div>
                                <div className="text-xs text-gray-400">{new Date(act.created_at).toLocaleTimeString()}</div>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                {act.account_id && (
                                  <Link to={`/sm/core-crm/accounts/${act.account_id}`} className="flex items-center gap-2 px-2 py-1 bg-white/30 rounded-full border border-white/10 hover:bg-white/50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">{(accounts.find(a=>a.id===act.account_id)||{}).name?.charAt(0) || '?'}</div>
                                    <span>{(accounts.find(a=>a.id===act.account_id)||{}).name}</span>
                                  </Link>
                                )}

                                {act.contact_id && (
                                  <Link to={`/sales/contacts/${act.contact_id}`} className="flex items-center gap-2 px-2 py-1 bg-white/30 rounded-full border border-white/10 hover:bg-white/50 transition-colors">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">{((contacts.find(c=>c.id===act.contact_id)||{}).first_name || ' ')[0] || '?'}</div>
                                    <span>{`${(contacts.find(c=>c.id===act.contact_id)||{}).first_name || ''} ${(contacts.find(c=>c.id===act.contact_id)||{}).last_name || ''}`.trim()}</span>
                                  </Link>
                                )}
                              </div>

                              {act.notes && <p className="mt-3 text-sm text-gray-600" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{act.notes}</p>}
                            </div>

                            <div className="flex-shrink-0 text-xs text-gray-400">{act.source || ''}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer bar (primary column) */}
            <div className="mt-6 lg:static lg:mt-6 lg:col-start-1 lg:col-end-2 bg-white/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">Showing {(filtered.length === 0) ? 0 : ((page-1)*pageSize + 1)} - {Math.min(page*pageSize, filtered.length)} of {filtered.length}</div>
              <div className="flex items-center gap-2">
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 text-sm border rounded bg-white/50">
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <button onClick={() => setPage((p) => Math.max(1, p-1))} className="px-2 py-1 border rounded bg-white/40">Prev</button>
                <div className="px-3 text-sm">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p+1))} className="px-2 py-1 border rounded bg-white/40">Next</button>
              </div>
            </div>

          </div>

          {/* Right sidebar */}
          <aside className="space-y-6 order-first lg:order-last lg:col-span-3 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-white/40 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <h4 className="text-sm font-semibold">Filters</h4>
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> My Interactions</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Team Interactions</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Unresolved Tasks</label>
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <h4 className="text-sm font-semibold">Timeline Insights</h4>
              <p className="mt-2 text-xs text-gray-500">Click an event to generate a concise summary of this relationship's history.</p>
              <div className="mt-3 text-center">
                <button onClick={() => generateSummaryFor(selectedActivity)} disabled={!selectedActivity} className={`px-3 py-2 rounded-xl ${selectedActivity ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Generate Summary</button>
                {selectedSummary && <div className="mt-3 text-sm text-gray-700 text-left bg-white/20 p-2 rounded">{selectedSummary}</div>}
              </div>
            </div>
          </aside>

        </div>
      </SMModuleLayout>

      {/* Drawer for create/edit */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => { setDrawerOpen(false); setEditingActivity(null); }} />
          <div className="w-full sm:w-[520px] max-w-[92vw] bg-white rounded-l-2xl p-4 shadow-lg border-l border-gray-200 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{editingActivity ? 'Edit Interaction' : 'Log Interaction'}</h3>
              <button onClick={() => { setDrawerOpen(false); setEditingActivity(null); }} className="p-2 rounded hover:bg-gray-100">Close</button>
            </div>

            <DynamicForm
              fieldGroups={fieldGroups}
              initialValues={editingActivity || { created_at: new Date().toISOString() }}
              onSubmit={handleSubmit}
              onCancel={() => { setDrawerOpen(false); setEditingActivity(null); }}
              submitLabel={editingActivity ? 'Save' : 'Log Interaction'}
              hideSidebar={true}
            />
          </div>
        </div>
      )}
    </SMModuleGuard>
  );
};

export default InteractionHistoryPage;
