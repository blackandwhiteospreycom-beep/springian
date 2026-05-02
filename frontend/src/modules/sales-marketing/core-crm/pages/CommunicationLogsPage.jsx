import React, { useMemo, useState } from 'react';
import { 
  AiOutlineMessage, 
  AiOutlineMail, 
  AiOutlineWhatsApp, 
  AiOutlineMobile, 
  AiOutlineSearch, 
  AiOutlineFilter, 
  AiOutlineArrowRight, 
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineExclamationCircle,
  AiOutlineEye,
  AiOutlineDownload,
  AiOutlineClose
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMFilterBar, SMStatsCard, SMEmptyState } from '../../components/shared';
import { useCRM } from '../context/CRMContext';

// ─── Constants ──────────────────────────────────────────────────────

const LOG_TYPES = {
  email: { icon: <AiOutlineMail />, label: 'Email', color: 'text-blue-500', bg: 'bg-blue-50' },
  sms: { icon: <AiOutlineMobile />, label: 'SMS', color: 'text-purple-500', bg: 'bg-purple-50' },
  whatsapp: { icon: <AiOutlineWhatsApp />, label: 'WhatsApp', color: 'text-emerald-500', bg: 'bg-emerald-50' },
};

const STATUS_CONFIG = {
  sent: { label: 'Sent', color: 'text-blue-600', bg: 'bg-blue-50', icon: <AiOutlineClockCircle /> },
  delivered: { label: 'Delivered', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <AiOutlineCheckCircle /> },
  read: { label: 'Read', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <AiOutlineCheckCircle /> },
  opened: { label: 'Opened', color: 'text-orange-600', bg: 'bg-orange-50', icon: <AiOutlineEye /> },
  failed: { label: 'Failed', color: 'text-rose-600', bg: 'bg-rose-50', icon: <AiOutlineExclamationCircle /> },
};

// ─── Sub-Components ─────────────────────────────────────────────────

const LogRow = ({ log, contact, account, onClick }) => {
  const type = LOG_TYPES[log.type] || LOG_TYPES.email;
  const status = STATUS_CONFIG[log.status] || STATUS_CONFIG.sent;
  const date = new Date(log.created_at);

  return (
    <div 
      onClick={() => onClick(log)}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-md transition-all cursor-pointer ani-fade-up"
    >
      {/* Type Icon */}
      <div className={`w-12 h-12 rounded-xl ${type.bg} ${type.color} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
        {React.cloneElement(type.icon, { size: 24 })}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-800 truncate">{log.subject}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color} flex items-center gap-1`}>
            {status.icon} {status.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {log.direction === 'outbound' ? <AiOutlineArrowRight className="text-blue-400" /> : <AiOutlineArrowLeft className="text-emerald-400" />}
            {log.direction === 'outbound' ? `To: ${log.recipient}` : `From: ${log.sender}`}
          </span>
          {contact && <span className="font-medium text-primary">@{contact.first_name} {contact.last_name}</span>}
          {account && <span className="text-gray-400">/ {account.name}</span>}
        </div>
      </div>

      {/* Date & Action */}
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
        <span className="text-[11px] font-medium text-gray-400">
          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="p-2 text-gray-300 group-hover:text-primary transition-colors">
          <AiOutlineEye size={18} />
        </div>
      </div>
    </div>
  );
};

const LogDetailDrawer = ({ log, contact, account, onClose }) => {
  if (!log) return null;
  const type = LOG_TYPES[log.type] || LOG_TYPES.email;
  const status = STATUS_CONFIG[log.status] || STATUS_CONFIG.sent;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-[70] flex flex-col animate-[slideIn_0.3s_ease-out] border-l border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Communication Detail</h2>
            <p className="text-xs text-gray-400">System log for {type.label} interaction</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <AiOutlineClose size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${type.bg} ${type.color} flex items-center justify-center`}>
                {type.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                <p className="text-sm font-bold text-gray-800">{type.label}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                {status.icon} {status.label}
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Direction</p>
              <p className="text-xs font-bold text-gray-700 capitalize">{log.direction}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Created At</p>
              <p className="text-xs font-bold text-gray-700">{new Date(log.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sender</p>
              <p className="text-xs font-bold text-gray-700 truncate" title={log.sender}>{log.sender}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Recipient</p>
              <p className="text-xs font-bold text-gray-700 truncate" title={log.recipient}>{log.recipient}</p>
            </div>
          </div>

          {/* Relationship Context */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Related To</h4>
             <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                 {contact?.first_name?.charAt(0) || 'U'}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-gray-800 truncate">{contact?.first_name} {contact?.last_name}</p>
                 <p className="text-[10px] text-gray-500 truncate">{account?.name}</p>
               </div>
               <button className="text-primary hover:underline text-[10px] font-bold">VIEW</button>
             </div>
          </div>

          {/* Content Block */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Content</h4>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 min-h-[100px] text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {log.content || 'No content recorded for this log.'}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all">
            Download Payload
          </button>
          <button className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
            Retry Delivery
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Main Page Architecture ─────────────────────────────────────────

const CommunicationLogsPage = () => {
  const { communicationLogs, contacts, accounts } = useCRM();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    status: 'all',
    direction: 'all'
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const filtered = useMemo(() => {
    return communicationLogs.filter(log => {
      const matchSearch = !search || 
        (log.subject || '').toLowerCase().includes(search.toLowerCase()) || 
        (log.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.sender || '').toLowerCase().includes(search.toLowerCase());
      
      const matchType = activeFilters.type === 'all' || log.type === activeFilters.type;
      const matchStatus = activeFilters.status === 'all' || log.status === activeFilters.status;
      const matchDirection = activeFilters.direction === 'all' || log.direction === activeFilters.direction;

      return matchSearch && matchType && matchStatus && matchDirection;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [communicationLogs, search, activeFilters]);

  const stats = useMemo(() => {
    return {
      total: communicationLogs.length,
      emails: communicationLogs.filter(l => l.type === 'email').length,
      delivered: communicationLogs.filter(l => l.status === 'delivered' || l.status === 'read' || l.status === 'opened').length,
      failed: communicationLogs.filter(l => l.status === 'failed').length,
    };
  }, [communicationLogs]);

  const deliveryRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.delivered / stats.total) * 100);
  }, [stats]);

  return (
    <SMModuleGuard sectionId="core-crm" featureId="communication-logs">
      <SMModuleLayout
        title="Communication Logs"
        subtitle="Full audit trail of outbound and inbound messages"
        color="#296374"
        icon={<AiOutlineMessage className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-gray-700 bg-white shadow-sm">
              <AiOutlineDownload size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SMStatsCard 
              title="Total Logs" value={stats.total} icon={<AiOutlineMessage />} color="#296374" 
            />
            <SMStatsCard 
              title="Delivery Rate" value={`${deliveryRate}%`} icon={<AiOutlineCheckCircle />} color="#10B981" 
              change="2.4%" changeType="positive"
            />
            <SMStatsCard 
              title="Failed Logs" value={stats.failed} icon={<AiOutlineExclamationCircle />} color="#EF4444" 
              change="0.5%" changeType="negative"
            />
            <SMStatsCard 
              title="Email Volume" value={stats.emails} icon={<AiOutlineMail />} color="#3B82F6" 
            />
          </div>

          {/* Smart Filtering */}
          <SMFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by subject, sender or recipient..."
            filters={[
              {
                key: 'type',
                value: activeFilters.type,
                options: [
                  { value: 'all', label: 'All Channels' },
                  { value: 'email', label: 'Email' },
                  { value: 'sms', label: 'SMS' },
                  { value: 'whatsapp', label: 'WhatsApp' },
                ]
              },
              {
                key: 'status',
                value: activeFilters.status,
                options: [
                  { value: 'all', label: 'All Statuses' },
                  { value: 'sent', label: 'Sent' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'read', label: 'Read' },
                  { value: 'failed', label: 'Failed' },
                ]
              },
              {
                key: 'direction',
                value: activeFilters.direction,
                options: [
                  { value: 'all', label: 'All Directions' },
                  { value: 'outbound', label: 'Outbound' },
                  { value: 'inbound', label: 'Inbound' },
                ]
              }
            ]}
            onFilterChange={(key, val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
          />

          {/* Logs List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <SMEmptyState 
                title="No logs found"
                description="Try adjusting your filters or search terms."
                icon={<AiOutlineMessage size={48} />}
              />
            ) : (
              filtered.map(log => (
                <LogRow 
                  key={log.id} 
                  log={log} 
                  contact={contacts.find(c => c.id === log.contact_id)}
                  account={accounts.find(a => a.id === log.account_id)}
                  onClick={setSelectedLog}
                />
              ))
            )}
          </div>
        </div>

        {/* Detail Drawer */}
        <LogDetailDrawer 
          log={selectedLog} 
          contact={contacts.find(c => c.id === selectedLog?.contact_id)}
          account={accounts.find(a => a.id === selectedLog?.account_id)}
          onClose={() => setSelectedLog(null)}
        />
      </SMModuleLayout>

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .ani-fade-up { animation: fadeUp 0.4s ease-out both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </SMModuleGuard>
  );
};

export default CommunicationLogsPage;
