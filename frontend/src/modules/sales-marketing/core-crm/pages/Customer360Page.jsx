import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineUser, AiOutlineBank, AiOutlineHistory } from 'react-icons/ai';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import ActivityTimeline from '../components/ActivityTimeline';
import RightSidePanel from '../components/RightSidePanel';
import { useDataLayer } from '../data-layer/useDataLayer';
import Customer360Widget from '../../../../dashboard/components/widgets/Customer360Widget';
import AnalyticsWidgetWrapper, { AnalyticsWidgetProvider } from '../components/AnalyticsWidget';

const Customer360Content = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccountById, getContactById, getContactsByAccount, getActivitiesByAccount, getActivitiesByContact, accounts } = useDataLayer();

  const [selectedId, setSelectedId] = useState(id || (accounts && accounts.length > 0 ? accounts[0].id : null));

  // If route param exists, use it; otherwise use selectedId from state
  const effectiveId = id || selectedId;

  // Try to resolve id as account first, then contact
  const account = getAccountById(effectiveId);
  const contact = account ? null : getContactById(effectiveId);
  const resolvedAccount = account || (contact ? getAccountById(contact.account_id) : null);

  const contacts = resolvedAccount ? getContactsByAccount(resolvedAccount.id) : (contact ? [contact] : []);
  const activities = resolvedAccount ? getActivitiesByAccount(resolvedAccount.id) : (contact ? getActivitiesByContact(contact.id) : []);

  if (!resolvedAccount && !contact) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">No record selected</h2>
        <p className="text-sm text-gray-500 mt-2">Choose an account or contact from the selector to view the 360 overview.</p>
        <div className="mt-4">
          <button onClick={() => navigate('/sm/core-crm/accounts')} className="text-primary hover:underline font-medium">Go to Accounts</button>
        </div>
      </div>
    );
  }

  const title = resolvedAccount ? resolvedAccount.name : `${contact.first_name} ${contact.last_name}`;
  const subtitle = resolvedAccount ? resolvedAccount.industry : (contact.role || 'Contact');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">{title.charAt(0)}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
          <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm"> <AiOutlineArrowLeft /> Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Top row: 360 summary */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Contacts</div>
                  <div className="text-sm font-semibold text-gray-700">{contacts.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Recent Activity</div>
                  <div className="text-sm font-semibold text-gray-700">{activities.length}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Owner</div>
                  <div className="text-sm font-semibold text-gray-700">{resolvedAccount?.owner || (contact && contact.owner) || '—'}</div>
                </div>
              </div>

              {/* Selector when no explicit id in route */}
              {!id && (
                <div className="flex items-center gap-2">
                  <select value={selectedId || ''} onChange={(e) => setSelectedId(e.target.value)} className="px-3 py-2 border rounded-lg">
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <button onClick={() => { if (selectedId) navigate(`/sm/core-crm/customer-360/${selectedId}`); }} className="px-3 py-2 bg-primary text-white rounded-lg">Open 360</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Contacts</div>
                <div className="text-sm font-semibold text-gray-700">{contacts.length}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Recent Activity</div>
                <div className="text-sm font-semibold text-gray-700">{activities.length}</div>
              </div>
            </div>
          </div>

          {/* Key People */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><AiOutlineUser /> Key People</h3>
            <div className="space-y-3 mt-4">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{c.first_name?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-700 truncate">{c.first_name} {c.last_name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{c.role}</div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">No contacts yet</div>}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><AiOutlineHistory /> Activity Timeline</h3>
            </div>
            <ActivityTimeline activities={activities} showEntity />
          </div>
        </div>

        <div className="space-y-6">
          <RightSidePanel stats={{ total: contacts.length }} />

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800">Enrichment</h3>
            <p className="text-sm text-gray-500 mt-2">Enrichment data will appear here once the backend connector is configured.</p>

            {/* Modular AI Predictive Analytics widget */}
            <div className="mt-4">
              <AnalyticsWidgetWrapper accountId={resolvedAccount?.id} />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

const Customer360Page = () => {
  return (
    <SMModuleGuard sectionId="core-crm" featureId="customer360">
      <SMModuleLayout
        title="Customer 360"
        subtitle="Unified view of customer relationship"
        color="#296374"
        icon={<AiOutlineBank className="text-white" size={18} />}
      >
        <Customer360Content />
      </SMModuleLayout>
    </SMModuleGuard>
  );
};

export default Customer360Page;
