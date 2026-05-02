import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AiOutlineBank, AiOutlineGlobal, AiOutlineTeam, AiOutlineHistory, 
  AiOutlineArrowLeft, AiOutlineEdit, AiOutlinePlus, AiOutlineMail,
  AiOutlinePhone, AiOutlineEnvironment, AiOutlineUser, AiOutlineCheckCircle,
  AiOutlineClose, AiOutlineSetting, AiOutlineDashboard, AiOutlineDollar
} from 'react-icons/ai';
import { useDataLayer } from '../data-layer/useDataLayer';
import ActivityTimeline from '../components/ActivityTimeline';
import { SMDataTable } from '../../components/shared';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { ContactManagementContent } from './ContactManagementPage';
import RightSidePanel from '../components/RightSidePanel';
import { EntityPreview, QuickTips } from '../components/DynamicForm';

const STATUS_CONFIG = {
  'Customer': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  'Prospect': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  'Active': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
};

const AccountDetailContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getAccountById, 
    getContactsByAccount, 
    getActivitiesByAccount, 
    addActivity,
    accountFieldGroups 
  } = useDataLayer();
  
  const account = getAccountById(id);
  const contacts = getContactsByAccount(id);
  const activities = getActivitiesByAccount(id);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [contactView, setContactView] = useState('list');
  const [formValues, setFormValues] = useState({});

  // Contact stats for the sidebar when in contacts tab
  const contactStats = useMemo(() => ({
    total: contacts.length,
    active: contacts.filter(c => c.status === 'active').length,
    leads: contacts.filter(c => c.status === 'lead').length,
    customers: contacts.filter(c => c.status === 'customer').length,
  }), [contacts]);

  if (!account) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Account not found</h2>
        <button onClick={() => navigate('/sm/core-crm/accounts')} className="mt-4 text-primary hover:underline font-medium">
          Back to accounts
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <AiOutlineDashboard size={16} /> },
    { id: 'contacts', label: 'Contacts', icon: <AiOutlineTeam size={16} /> },
    { id: 'deals', label: 'Deals', icon: <AiOutlineDollar size={16} /> },
    { id: 'activities', label: 'Timeline', icon: <AiOutlineHistory size={16} /> },
    { id: 'comms', label: 'Comms', icon: <AiOutlineMail size={16} /> },
  ];

  const sc = STATUS_CONFIG[account.status] || STATUS_CONFIG.Active;

  return (
    <div className="space-y-6">
      {/* Account Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold flex-shrink-0 shadow-inner">
            {account.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{account.name}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><AiOutlineGlobal size={14} className="text-gray-400" /> {account.website}</span>
              <span className="flex items-center gap-1"><AiOutlineEnvironment size={14} className="text-gray-400" /> {account.industry}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                {account.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {activeTab === 'contacts' && contactView === 'list' && (
                <button 
                  onClick={() => setContactView('create')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-sm"
                >
                  <AiOutlinePlus size={16} /> Add Contact
                </button>
             )}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all text-gray-700 shadow-sm">
              <AiOutlineEdit size={16} /> Edit Account
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-t border-gray-50 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setContactView('list'); }}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {/* 360 Info */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <AiOutlineBank className="text-primary" /> Company Profile
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Revenue</div>
                    <div className="text-sm font-semibold text-gray-700">{account.annual_revenue || '—'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Employees</div>
                    <div className="text-sm font-semibold text-gray-700">{account.employee_count || '—'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Owner</div>
                    <div className="text-sm font-semibold text-gray-700">{account.owner || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Key Contacts Snapshot */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <AiOutlineTeam className="text-green-500" /> Key People
                  </h3>
                  <button onClick={() => setActiveTab('contacts')} className="text-xs text-primary font-bold">See All</button>
                </div>
                <div className="space-y-3">
                  {contacts.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {c.first_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-700 truncate">{c.first_name} {c.last_name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{c.role}</div>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">No contacts yet</div>}
                </div>
              </div>

              {/* Recent Activity Snapshot */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-full">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <AiOutlineHistory className="text-purple-500" /> Recent Timeline
                  </h3>
                  <button onClick={() => setActiveTab('activities')} className="text-xs text-primary font-bold">Full History</button>
                </div>
                <ActivityTimeline activities={activities.slice(0, 2)} />
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <ContactManagementContent 
                accountId={id} 
                view={contactView} 
                onCancel={() => setContactView('list')} 
                onViewChange={setContactView}
                onValuesChange={setFormValues}
              />
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <AiOutlineDollar size={32} />
              </div>
              <h3 className="font-bold text-gray-800">Sales Pipeline</h3>
              <p className="text-sm text-gray-500 mt-2">No active opportunities found for this account.</p>
              <button className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 shadow-sm">Create Opportunity</button>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <AiOutlineHistory size={18} className="text-purple-600" /> Full Activity Log
                </h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-sm">
                  <AiOutlinePlus size={12} /> Log Activity
                </button>
              </div>
              <ActivityTimeline activities={activities} />
            </div>
          )}

          {activeTab === 'comms' && (
            <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <AiOutlineMail size={32} />
              </div>
              <h3 className="font-bold text-gray-800">Communication History</h3>
              <p className="text-sm text-gray-500 mt-2">Emails and call recordings will appear here.</p>
            </div>
          )}
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-6">
          {(activeTab === 'contacts' && (contactView === 'create' || contactView === 'edit')) ? (
            <div className="space-y-4 sticky top-24">
              <EntityPreview values={formValues} mode="contact" />
              <QuickTips />
            </div>
          ) : activeTab === 'contacts' ? (
            <RightSidePanel stats={contactStats} />
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <AiOutlineSetting size={48} className="text-primary" />
                </div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  AI Performance Score
                </h3>
                <div className="p-4 bg-gradient-to-br from-primary/5 to-indigo-50 rounded-2xl border border-primary/10">
                  <div className="text-3xl font-black text-primary mb-2">84%</div>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {account.name} shows high engagement probability. Last quarter's growth matches your "Target Enterprise" profile.
                  </p>
                  <button className="w-full mt-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2">
                    <AiOutlineMail size={14} /> Send Engagement Draft
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Quick Communication</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 transition-all flex flex-col items-center gap-2 group border border-transparent hover:border-primary/10">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                      <AiOutlineMail size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Team</span>
                  </button>
                  <button className="p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all flex flex-col items-center gap-2 group border border-transparent hover:border-green-100">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                      <AiOutlinePhone size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Office</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AccountDetailPage = () => {
  const navigate = useNavigate();
  return (
    <SMModuleGuard sectionId="core-crm" featureId="accounts">
      <SMModuleLayout
        title="Account 360 View"
        subtitle="Complete overview of organizational relationship"
        color="#296374"
        icon={<AiOutlineBank className="text-white" size={18} />}
        actions={
          <button
            onClick={() => navigate('/sm/core-crm/accounts')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
          >
            <AiOutlineArrowLeft size={16} />
            Back to Accounts
          </button>
        }
      >
        <AccountDetailContent />
      </SMModuleLayout>
    </SMModuleGuard>
  );
};

export default AccountDetailPage;
