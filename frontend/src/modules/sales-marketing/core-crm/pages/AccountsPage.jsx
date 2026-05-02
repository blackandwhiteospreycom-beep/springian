import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { SMDataTable, SMFilterBar, SMStatsCard } from '../../components/shared';
import RightSidePanel from '../components/RightSidePanel';
import DynamicForm, { EntityPreview, QuickTips } from '../components/DynamicForm';
import CustomizeFieldsDrawer from '../components/CustomizeFieldsDrawer';
import { useDataLayer } from '../data-layer/useDataLayer';
import { FIELD_TYPES } from '../utils/fieldRegistry';
import {
  AiOutlinePlus, AiOutlineBank, AiOutlineTeam, AiOutlineCheckCircle,
  AiOutlineUser, AiOutlineGlobal, AiOutlineEdit, AiOutlineEye, AiOutlineLink,
  AiOutlineEnvironment, AiOutlineSetting, AiOutlineDelete, AiOutlineDownload,
  AiOutlineHistory, AiOutlineMore, AiOutlineClose
} from 'react-icons/ai';

const STATUS_CONFIG = {
  'Customer': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  'Prospect': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  'Active': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
  'Inactive': { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200' },
};

const AVATAR_COLORS = ['#296374', '#714B67', '#25A8E1', '#00AEEF', '#16A34A', '#DC2626', '#9333EA'];

function getAvatarColor(name) {
  const idx = (name || '').charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

// ─── Card-Style Row Renderer ────────────────────────────────────────

function AccountRow({ account, isSelected, onSelect, onEdit, onView, onOpen360, contactsCount, lastActivity }) {
  const initials = account.name.charAt(0).toUpperCase();
  const color = getAvatarColor(account.name);
  const sc = STATUS_CONFIG[account.status] || STATUS_CONFIG.Inactive;

  return (
    <div className="flex flex-col gap-3 py-3 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(account.id)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 truncate text-sm hover:text-primary cursor-pointer transition-colors" onClick={() => onView?.(account)}>
              {account.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
              {account.website && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <AiOutlineGlobal size={11} className="flex-shrink-0" /> {account.website}
                </span>
              )}
              {account.industry && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <AiOutlineEnvironment size={11} /> {account.industry}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-auto pl-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} hidden sm:inline`} />
            {account.status || '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-6 sm:ml-14 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <AiOutlineTeam size={12} className="text-gray-300" />
          <span>{contactsCount} Contacts</span>
        </div>

        {lastActivity && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <AiOutlineHistory size={12} className="text-gray-300" />
            <span className="capitalize">{lastActivity.type}: {new Date(lastActivity.created_at).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto sm:ml-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(account); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <AiOutlineEye size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen360?.(account); }}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Open 360 View"
          >
            <AiOutlineLink size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(account); }}
            className="p-1.5 rounded-lg hover:bg-primary/5 text-gray-400 hover:text-primary transition-colors"
            title="Edit"
          >
            <AiOutlineEdit size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ───────────────────────────────────────────────────

function AccountsContent({ view, setView, fieldGroups, onEdit, editingAccount, onValuesChange, formValues }) {
  const { accounts, getCRMStats, getContactsByAccount, getActivitiesByAccount, addAccount, updateAccount } = useDataLayer();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const stats = getCRMStats;

  const filtered = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch = !search || acc.name.toLowerCase().includes(search.toLowerCase()) || acc.industry.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || acc.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [accounts, search, statusFilter]);

  const columns = [
    { key: 'name', label: 'Account Name', sortable: true },
    { key: 'industry', label: 'Industry', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: '', sortable: false },
  ];

  const handleView = (account) => {
    navigate(`/sm/core-crm/accounts/${account.id}`);
  };

  const handleOpen360 = (account) => {
    navigate(`/sm/core-crm/customer-360/${account.id}`);
  };

  const handleCreate = (data) => {
    addAccount(data);
    setView('list');
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleUpdate = (data) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
      setView('list');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const renderAccountRow = useCallback((row, globalIdx, isSelected, handleSelectRow) => {
    const contactsCount = getContactsByAccount(row.id).length;
    const activities = getActivitiesByAccount(row.id);
    const lastActivity = activities[0];

    return (
      <AccountRow
        account={row}
        isSelected={isSelected}
        onSelect={(id) => handleSelectRow(globalIdx)}
        onView={handleView}
        onOpen360={handleOpen360}
        onEdit={onEdit}
        contactsCount={contactsCount}
        lastActivity={lastActivity}
      />
    );
  }, [getContactsByAccount, getActivitiesByAccount, onEdit]);

  // Merge field type definitions
  const enrichedGroups = useMemo(() =>
    fieldGroups.map((g) => ({
      ...g,
      fields: g.fields.filter(f => !f._hidden).map((f) => ({
        ...f,
        _typeDef: FIELD_TYPES[f.type] || FIELD_TYPES.text,
      })),
    })),
    [fieldGroups]
  );

  if (view === 'create' || view === 'edit') {
    const isEdit = view === 'edit';
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <AiOutlineBank size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                {isEdit ? `Edit ${editingAccount?.name}` : 'Create New Account'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEdit ? 'Update company information' : 'Add a new company to your database'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              form="dynamic-form"
              type="submit"
              className="px-5 py-2 text-sm text-white bg-primary rounded-xl hover:opacity-90 transition-all font-medium shadow-sm"
            >
              {isEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Form (now cleaner with external sidebar) */}
        <div className="p-5 sm:p-6">
          <DynamicForm
            fieldGroups={enrichedGroups}
            initialValues={isEdit ? editingAccount : { status: 'Active' }}
            onSubmit={isEdit ? handleUpdate : handleCreate}
            onCancel={() => setView('list')}
            submitLabel={isEdit ? 'Save Changes' : 'Create Account'}
            mode="account"
            isEdit={isEdit}
            hideSidebar={true}
            onValuesChange={onValuesChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
      <div className="flex-1 min-w-0 order-1">
        {saveStatus === 'saved' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center font-medium animate-pulse">
            ✓ Operation successful
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <SMStatsCard title="Total Accounts" value={stats.totalAccounts} icon={<AiOutlineBank />} color="#296374" />
          <SMStatsCard title="Active Customers" value={stats.customerAccounts} icon={<AiOutlineBank />} color="#16A34A" />
          <SMStatsCard title="Prospects" value={stats.prospectAccounts} icon={<AiOutlineBank />} color="#25A8E1" />
          <SMStatsCard title="Active This Month" value={stats.activeAccounts} icon={<AiOutlineBank />} color="#9333EA" />
        </div>

        <SMFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search accounts by name or industry..."
          filters={[
            { key: 'status', value: statusFilter, options: [
              { value: 'all', label: 'All Status' },
              { value: 'Customer', label: 'Customer' },
              { value: 'Prospect', label: 'Prospect' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]},
          ]}
          onFilterChange={(key, val) => { if (key === 'status') setStatusFilter(val); }}
        />

        <SMDataTable
          columns={columns}
          data={filtered}
          pageSize={8}
          selectable
          onSelectionChange={setSelectedIds}
          emptyMessage="No accounts match your filters."
          renderRow={renderAccountRow}
        />
      </div>

      <div className="hidden xl:block w-80 flex-shrink-0 order-2">
        <div className="xl:sticky xl:top-24 space-y-4">
          {view === 'list' ? (
            <RightSidePanel 
              stats={{ 
                total: stats.totalAccounts, 
                active: stats.activeAccounts, 
                leads: stats.prospectAccounts, 
                customers: stats.customerAccounts 
              }} 
            />
          ) : (
            <div className="space-y-4">
               <EntityPreview values={formValues} mode="account" />
               <QuickTips />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountsPage() {
  const [view, setView] = useState('list'); // 'list' or 'create' or 'edit'
  const [editingAccount, setEditingAccount] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const { accountFieldGroups: groups, setAccountFieldGroups: setGroups } = useDataLayer();
  
  const handleEdit = (account) => {
    setEditingAccount(account);
    setView('edit');
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="accounts">
      <SMModuleLayout
        title="Account Management"
        subtitle="Core CRM — Manage your companies and organizational relationships"
        color="#296374"
        icon={<AiOutlineBank className="text-white" size={18} />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFieldsDrawer(true)}
              className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 rounded-xl transition-all shadow-sm"
              title="Customize Fields"
            >
              <AiOutlineSetting size={20} />
            </button>
            {view === 'list' && (
              <button
                onClick={() => setView('create')}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm hover:shadow"
              >
                <AiOutlinePlus size={16} />
                <span className="hidden sm:inline">Add Account</span>
              </button>
            )}
          </div>
        }
      >
        <AccountsContent 
          view={view} 
          setView={setView} 
          fieldGroups={groups}
          onEdit={handleEdit}
          editingAccount={editingAccount}
          onValuesChange={setFormValues}
          formValues={formValues}
        />

        <CustomizeFieldsDrawer
          open={showFieldsDrawer}
          onClose={() => setShowFieldsDrawer(false)}
          groups={groups}
          onGroupsChange={setGroups}
        />
      </SMModuleLayout>
    </SMModuleGuard>
  );
}

export default AccountsPage;
