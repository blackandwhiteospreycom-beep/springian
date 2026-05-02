import React, { useMemo, useState, useEffect } from 'react';
import { 
  AiOutlineHistory, 
  AiOutlinePlus, 
  AiOutlinePhone, 
  AiOutlineMail, 
  AiOutlineFileText, 
  AiOutlineUser, 
  AiOutlineBank,
  AiOutlineCalendar,
  AiOutlineSearch,
  AiOutlineClockCircle,
  AiOutlineAlert,
  AiOutlineMessage,
  AiOutlineSend,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineRocket,
  AiOutlineThunderbolt,
  AiOutlineCheckCircle,
  AiOutlineEye,
  AiOutlineSmile,
  AiOutlineMeh,
  AiOutlineFrown,
  AiOutlineFilter,
  AiOutlineStar,
  AiOutlineFlag,
  AiOutlinePlusCircle,
  AiOutlineTeam,
  AiOutlineMore,
  AiOutlineAppstore,
  AiOutlineClose,
  AiOutlineSetting
} from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMFilterBar, SMStatsCard, SMEmptyState } from '../../components/shared';
import { useDataLayer } from '../data-layer/useDataLayer';
import DynamicForm from '../components/DynamicForm';
import CustomizeFieldsDrawer from '../components/CustomizeFieldsDrawer';
import { FIELD_TYPES } from '../utils/fieldRegistry';

// ─── Constants & Helpers ────────────────────────────────────────────

const PRIORITY_LEVELS = {
  low: { label: 'Low', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' },
  medium: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const SENTIMENTS = {
  positive: { icon: <AiOutlineSmile />, label: 'Positive', color: 'text-emerald-500' },
  neutral: { icon: <AiOutlineMeh />, label: 'Neutral', color: 'text-gray-400' },
  negative: { icon: <AiOutlineFrown />, label: 'Negative', color: 'text-rose-500' },
};

const STATUS_BADGES = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
  completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  awaiting_reply: { label: 'Awaiting Reply', bg: 'bg-blue-50', text: 'text-blue-700' },
};

function groupActivitiesByDate(activities) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeek = new Date(today.getTime() - 86400000 * 7);

  const groups = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Earlier': []
  };

  activities.forEach(act => {
    const d = new Date(act.created_at);
    if (d >= today) groups['Today'].push(act);
    else if (d >= yesterday) groups['Yesterday'].push(act);
    else if (d >= thisWeek) groups['This Week'].push(act);
    else groups['Earlier'].push(act);
  });

  return Object.entries(groups).filter(([_, list]) => list.length > 0);
}

// ─── Sub-Components ─────────────────────────────────────────────────

function FAB({ onAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { type: 'call', icon: <AiOutlinePhone />, label: 'Log Call', color: 'bg-blue-500' },
    { type: 'email', icon: <AiOutlineMail />, label: 'Send Email', color: 'bg-orange-500' },
    { type: 'note', icon: <AiOutlineFileText />, label: 'Add Note', color: 'bg-purple-500' },
    { type: 'meeting', icon: <AiOutlineCalendar />, label: 'Meeting', color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-5 duration-300">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                onAction(opt.type);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 pr-4 pl-3 py-2 bg-white rounded-full shadow-xl border border-gray-100 hover:scale-105 transition-all group"
            >
              <span className={`w-8 h-8 rounded-full ${opt.color} text-white flex items-center justify-center shadow-sm`}>
                {opt.icon}
              </span>
              <span className="text-xs font-bold text-gray-700">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${isOpen ? 'bg-gray-900 rotate-45' : 'bg-primary hover:scale-110'}`}
      >
        <AiOutlinePlus size={24} />
      </button>
    </div>
  );
}

function ActivityCard({ activity, contact, account, isManager, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const date = new Date(activity.created_at);
  const replies = activity.replies || [];
  const priority = (activity.priority || 'medium').toLowerCase();
  const pc = PRIORITY_LEVELS[priority] || PRIORITY_LEVELS.medium;
  const sentiment = (activity.sentiment || 'neutral').toLowerCase();
  const sc = SENTIMENTS[sentiment] || SENTIMENTS.neutral;
  const status = (activity.status || 'completed').toLowerCase();
  const sb = STATUS_BADGES[status] || STATUS_BADGES.completed;

  const typeConfig = {
    call: { icon: <AiOutlinePhone />, color: 'bg-blue-500', text: 'Logged a Call' },
    email: { icon: <AiOutlineMail />, color: 'bg-orange-500', text: 'Sent an Email' },
    note: { icon: <AiOutlineFileText />, color: 'bg-purple-500', text: 'Added a Note' },
    meeting: { icon: <AiOutlineCalendar />, color: 'bg-emerald-500', text: 'Scheduled Meeting' },
  }[(activity.type || '').toLowerCase()] || { icon: <AiOutlineHistory />, color: 'bg-gray-500', text: 'Logged Activity' };

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      text: replyText,
      performer: isManager ? 'Manager (Admin)' : 'System User',
      created_at: new Date().toISOString()
    };
    onUpdate(activity.id, { replies: [...replies, newReply] });
    setReplyText('');
  };

  return (
    <div className={`relative pl-8 pb-8 last:pb-0 group transition-all duration-300`}>
      {/* Vertical Line Connector */}
      <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-100 group-last:bg-transparent" />

      {/* Type Icon Circle */}
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white z-10 shadow-lg ${typeConfig.color} transition-all hover:scale-110`}>
        {React.cloneElement(typeConfig.icon, { size: 14 })}
      </div>

      {/* Card Content */}
      <div className={`bg-white rounded-2xl border transition-all duration-300 ml-0 sm:ml-4 shadow-sm hover:shadow-md ${priority === 'urgent' ? 'border-red-100 ring-1 ring-red-50' : 'border-gray-100'}`}>
        
        <div className="p-4 sm:p-5">
          {/* Top Header: Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${sb.bg} ${sb.text}`}>
                {sb.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${pc.bg} ${pc.color} ${pc.border}`}>
                <AiOutlineFlag size={10} /> {pc.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${sc.color} bg-gray-50`}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-gray-400">
               <span className="flex items-center gap-1"><AiOutlineClockCircle size={12} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               {priority === 'urgent' && <span className="text-red-500 font-bold animate-pulse tracking-tighter">ACTION_REQUIRED</span>}
            </div>
          </div>

          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-800 flex flex-wrap items-center gap-2">
                {typeConfig.text}
                <span className="text-gray-300 font-normal">/</span>
                <span className="text-primary truncate max-w-[150px] sm:max-w-none">{account?.name || 'Root_Entity'}</span>
              </h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
                {activity.description}
              </p>
            </div>
            <div className="flex -space-x-2 flex-shrink-0">
               <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500" title={activity.performer}>
                 {activity.performer?.charAt(0)}
               </div>
            </div>
          </div>

          {/* Relationship Context Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 my-4 bg-gray-50/50 rounded-xl px-4 border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Role</span>
              <span className="text-[11px] font-bold text-gray-700 truncate">{contact?.role || 'Stakeholder'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Deal Stage</span>
              <span className="text-[11px] font-bold text-blue-600 uppercase">Discovery</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Past Interactions</span>
              <span className="text-[11px] font-bold text-gray-700">14 Touchpoints</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Sensitivity</span>
              <span className="text-[11px] font-bold text-orange-600 truncate">Follow up &lt; 24h</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-50">
            <button 
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${showChat ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              <AiOutlineMessage size={14} />
              <span>{replies.length > 0 ? `${replies.length} Replies` : 'Quick Reply'}</span>
            </button>
            
            <div className="flex flex-wrap items-center gap-1 sm:ml-auto">
              <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Schedule Follow-up"><AiOutlineCalendar size={16} /></button>
              <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Assign to Team"><AiOutlineTeam size={16} /></button>
              <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Mark Completed"><AiOutlineCheckCircle size={16} /></button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${isExpanded ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {isExpanded ? <AiOutlineUp /> : <AiOutlineEye />} {isExpanded ? 'Collapse' : 'Insights'}
              </button>
            </div>
          </div>

          {/* AI Intelligence Layer & Detailed Stats */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Opportunity Score</span>
                  <span className="text-2xl font-black text-primary">78%</span>
                  <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter mt-1">High Confidence</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Engagement Trend</span>
                  <span className="text-2xl font-black text-emerald-500 flex items-center justify-center gap-1">↑ 12%</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">Last 7 Days</span>
                </div>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex flex-col justify-center">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <AiOutlineRocket /> Recommendation
                  </h4>
                  <p className="text-[11px] text-gray-600 font-medium mb-3">Schedule deep-dive call to finalize pricing.</p>
                  <div className="flex gap-2">
                    <button className="flex-1 text-[10px] bg-primary text-white py-1.5 rounded-lg font-bold uppercase">Schedule Call</button>
                    <button className="px-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"><AiOutlineMore /></button>
                  </div>
                </div>
              </div>

              {/* Conversation History / Attachments Stub */}
              <div className="p-4 rounded-xl border border-dashed border-gray-200">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <AiOutlineHistory /> Context_Stream
                 </h4>
                 <div className="space-y-3 opacity-60 grayscale pointer-events-none">
                    <div className="h-2 w-3/4 bg-gray-200 rounded-full" />
                    <div className="h-2 w-1/2 bg-gray-200 rounded-full" />
                 </div>
              </div>
            </div>
          )}

          {/* Quick Reply / Chat Box */}
          {showChat && (
            <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {replies.length > 0 && replies.map(reply => (
                  <div key={reply.id} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 shrink-0 border border-gray-200">
                      {reply.performer.charAt(0)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 flex-1 border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-gray-800">{reply.performer}</span>
                        <span className="text-[9px] text-gray-400">{new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-tight">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleAddReply} className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-2">
                  <AiOutlineMessage size={14} />
                  <div className="w-px h-4 bg-gray-200" />
                </div>
                <input 
                  type="text" 
                  placeholder="Type a message or use /template..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:scale-105 transition-all shadow-lg"
                >
                  <AiOutlineSend size={14} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Architecture ─────────────────────────────────────────

const ActivityTimelinePage = () => {
  const { activities: crmActivities, contacts, accounts, updateActivity, addActivity, activityFieldGroups, setActivityFieldGroups } = useDataLayer();
  
  const [localActivities, setLocalActivities] = useState(null);
  const [isManager, setIsManager] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: 'all',
    priority: 'all',
    sentiment: 'all',
    status: 'all'
  });

  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const [drawerInitialValues, setDrawerInitialValues] = useState({});

  // Derived activities with extended fields for decision support
  const activities = useMemo(() => {
    const raw = localActivities || crmActivities;
    return raw.map(act => ({
      ...act,
      priority: act.priority || (act.id === 'act-1' ? 'urgent' : act.id === 'act-2' ? 'high' : 'medium'),
      sentiment: act.sentiment || (act.id === 'act-1' ? 'positive' : act.id === 'act-3' ? 'negative' : 'neutral'),
      status: act.status || (act.id === 'act-1' ? 'completed' : 'awaiting_reply'),
      replies: act.replies || []
    }));
  }, [crmActivities, localActivities]);

  const handleUpdateActivity = (id, updates) => {
    const next = activities.map(a => a.id === id ? { ...a, ...updates } : a);
    setLocalActivities(next);
    if (updateActivity) updateActivity(id, updates);
  };

  const handleCreateActivity = (data) => {
    addActivity({ ...data, replies: [] });
    setShowCreateDrawer(false);
  };

  const openCreateDrawer = (type = 'note') => {
    setDrawerInitialValues({
      type,
      priority: 'medium',
      sentiment: 'neutral',
      status: 'completed',
      performer: 'System User',
      created_at: new Date().toISOString()
    });
    setShowCreateDrawer(true);
  };

  const filtered = useMemo(() => {
    return activities.filter(act => {
      const matchSearch = !search || (act.description || '').toLowerCase().includes(search.toLowerCase()) || 
                          (act.performer || '').toLowerCase().includes(search.toLowerCase());
      const matchType = activeFilters.type === 'all' || act.type === activeFilters.type;
      const matchPriority = activeFilters.priority === 'all' || act.priority === activeFilters.priority;
      const matchSentiment = activeFilters.sentiment === 'all' || act.sentiment === activeFilters.sentiment;
      const matchStatus = activeFilters.status === 'all' || act.status === activeFilters.status;
      
      return matchSearch && matchType && matchPriority && matchSentiment && matchStatus;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activities, search, activeFilters]);

  const grouped = useMemo(() => groupActivitiesByDate(filtered), [filtered]);

  const stats = useMemo(() => {
    return {
      total: activities.length,
      urgent: activities.filter(a => a.priority === 'urgent').length,
      calls: activities.filter(a => a.type === 'call').length,
      emails: activities.filter(a => a.type === 'email').length,
      avgResponse: '2.4h',
      engagementScore: 84
    };
  }, [activities]);

  const handleStatClick = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const enrichedGroups = useMemo(() => {
    const groups = (activityFieldGroups || []).map((g) => ({
      ...g,
      fields: g.fields.filter(f => !f._hidden).map((f) => ({
        ...f,
        _typeDef: FIELD_TYPES[f.type] || FIELD_TYPES.text,
      })),
    }));

    // Add Account & Contact lookups if not present
    const basicGroup = groups.find(g => g.id === 'basic-info');
    if (basicGroup) {
      if (!basicGroup.fields.find(f => f.key === 'account_id')) {
        basicGroup.fields.unshift({
          id: 'account_id', key: 'account_id', label: 'Related Account', type: 'dropdown', required: false,
          options: accounts.map(a => ({ value: a.id, label: a.name })), _typeDef: FIELD_TYPES.dropdown
        });
      }
      if (!basicGroup.fields.find(f => f.key === 'contact_id')) {
        basicGroup.fields.splice(1, 0, {
          id: 'contact_id', key: 'contact_id', label: 'Related Contact', type: 'dropdown', required: false,
          options: contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` })), _typeDef: FIELD_TYPES.dropdown
        });
      }
    }
    return groups;
  }, [activityFieldGroups, accounts, contacts]);

  return (
    <SMModuleGuard sectionId="core-crm" featureId="activity-timeline">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .sticky-header { position: sticky; top: 4.5rem; z-index: 20; background: #f5f6f8; padding: 1rem 0; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      <SMModuleLayout
        title="Activity Nexus"
        subtitle="Intelligent decision-support stream"
        color="#296374"
        icon={<AiOutlineHistory className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-3">Global Trend</span>
               <span className="text-xs font-black text-emerald-500">↑ 4.2%</span>
            </div>
            <button 
              onClick={() => openCreateDrawer()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-lg hover:shadow-primary/20"
            >
              <AiOutlinePlusCircle size={18} />
              <span className="hidden sm:inline">New Signal</span>
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* 1. Global Header Stats & Interactive Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SMStatsCard 
              title="Global Stream" value={stats.total} icon={<AiOutlineHistory />} color="#296374" 
              onClick={() => setActiveFilters({ type: 'all', priority: 'all', sentiment: 'all', status: 'all' })}
            />
            <SMStatsCard 
              title="Urgent Actions" value={stats.urgent} icon={<AiOutlineAlert />} color="#EF4444" 
              onClick={() => handleStatClick('priority', 'urgent')}
            />
            <SMStatsCard 
              title="Avg Response" value={stats.avgResponse} icon={<AiOutlineClockCircle />} color="#9333EA" 
              change="12%" changeType="positive"
            />
            <SMStatsCard 
              title="Engagement" value={`${stats.engagementScore}%`} icon={<AiOutlineStar />} color="#F59E0B" 
              change="8%" changeType="positive"
            />
          </div>

          {/* AI Summary Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-4 rounded-r-2xl flex items-center justify-between gap-4 animate-in fade-in duration-500">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                 <AiOutlineThunderbolt size={20} className="animate-pulse" />
               </div>
               <div className="min-w-0">
                 <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Decision_AI_Insight</p>
                 <p className="text-sm font-bold text-gray-800 truncate sm:whitespace-normal">You have <span className="text-red-500">2 pending follow-ups</span> and 1 high-opportunity lead requiring action within 24 hours.</p>
               </div>
             </div>
             <button className="hidden md:flex items-center gap-2 text-xs font-bold text-primary hover:underline flex-shrink-0">View Recommendations <AiOutlineRocket /></button>
          </div>

          {/* 2. Smart Filtering System */}
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1">
              <SMFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Analyze interaction signals..."
                filters={[
                  { 
                    key: 'type', 
                    value: activeFilters.type, 
                    options: [
                      { value: 'all', label: 'All Types' },
                      { value: 'call', label: 'Calls' },
                      { value: 'email', label: 'Emails' },
                      { value: 'note', label: 'Notes' },
                    ]
                  },
                  {
                    key: 'priority',
                    value: activeFilters.priority,
                    options: [
                      { value: 'all', label: 'Priority' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'high', label: 'High' },
                      { value: 'medium', label: 'Medium' },
                    ]
                  },
                  {
                    key: 'sentiment',
                    value: activeFilters.sentiment,
                    options: [
                      { value: 'all', label: 'Sentiment' },
                      { value: 'positive', label: 'Positive' },
                      { value: 'neutral', label: 'Neutral' },
                      { value: 'negative', label: 'Negative' },
                    ]
                  },
                  {
                    key: 'status',
                    value: activeFilters.status,
                    options: [
                      { value: 'all', label: 'Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'awaiting_reply', label: 'Awaiting' },
                    ]
                  }
                ]}
                onFilterChange={(key, val) => setActiveFilters(prev => ({ ...prev, [key]: val }))}
                onCustomizeFields={() => setShowFieldsDrawer(true)}
              />
            </div>
          </div>

          {/* 3. Timeline Structure with Date Grouping */}
          <div className="max-w-5xl">
            {grouped.length === 0 ? (
              <SMEmptyState 
                title="No signals detected"
                description="Adjust your parameters to capture interaction intelligence."
                icon={<AiOutlineHistory size={28} />}
              />
            ) : (
              <div className="space-y-12 pb-24">
                {grouped.map(([dateGroup, items]) => (
                  <div key={dateGroup} className="relative">
                    <div className="sticky-header">
                       <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] flex items-center gap-3">
                         <span className="w-12 h-px bg-gray-200" /> {dateGroup}
                       </h2>
                    </div>
                    
                    <div className="pt-8">
                      {items.map(act => (
                        <ActivityCard 
                          key={act.id} 
                          activity={act} 
                          contact={contacts.find(c => c.id === act.contact_id)}
                          account={accounts.find(a => a.id === act.account_id)}
                          isManager={isManager}
                          onUpdate={handleUpdateActivity}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Activity Drawer */}
        {showCreateDrawer && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowCreateDrawer(false)} />
            <div className="fixed top-0 right-0 h-full w-full sm:w-[520px] max-w-[92vw] bg-white rounded-l-3xl shadow-2xl z-50 flex flex-col animate-[slideIn_0.3s_ease-out] border-l border-gray-100">
              <div className="px-5 sm:px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10 rounded-tl-3xl">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full bg-primary" />
                    New Signal
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 truncate">Capture relationship touchpoint</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowFieldsDrawer(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary bg-primary/5 rounded-xl hover:bg-primary/10 transition-all"
                    title="Manage activity fields"
                  >
                    <AiOutlineSetting size={14} />
                    <span className="hidden xs:inline">Fields</span>
                  </button>
                  <button onClick={() => setShowCreateDrawer(false)} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                    <AiOutlineClose size={22} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
                <div className="max-w-full">
                  <DynamicForm 
                    fieldGroups={enrichedGroups}
                    initialValues={drawerInitialValues}
                    onSubmit={handleCreateActivity}
                    onCancel={() => setShowCreateDrawer(false)}
                    submitLabel="Log Signal"
                    hideSidebar={true}
                    cols={1}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* 11. FAB System */}
        <FAB onAction={(type) => openCreateDrawer(type)} />
      </SMModuleLayout>

      {/* Customize Fields Drawer - Moved outside SMModuleLayout to ensure it stacks on top of all page drawers */}
      <CustomizeFieldsDrawer 
        open={showFieldsDrawer} 
        onClose={() => setShowFieldsDrawer(false)} 
        groups={activityFieldGroups} 
        onGroupsChange={setActivityFieldGroups} 
        zIndex={100}
      />
    </SMModuleGuard>
  );
};

export default ActivityTimelinePage;
