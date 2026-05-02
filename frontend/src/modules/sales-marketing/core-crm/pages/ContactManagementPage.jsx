import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import DynamicForm, { EntityPreview, QuickTips } from '../components/DynamicForm';
import CustomFieldManager from '../components/CustomFieldManager';
import { SMDataTable, SMFilterBar, SMStatsCard } from '../../components/shared';
import RightSidePanel from '../components/RightSidePanel';
import CustomizeFieldsDrawer from '../components/CustomizeFieldsDrawer';
import { useDataLayer } from '../data-layer/useDataLayer';
import { FIELD_TYPES } from '../utils/fieldRegistry';
import {
  AiOutlineContacts, AiOutlinePlus, AiOutlineSetting, AiOutlineUser,
  AiOutlineTeam, AiOutlineCheckCircle, AiOutlineEdit, AiOutlineDelete,
  AiOutlineExport, AiOutlineDownload, AiOutlineClose, AiOutlineMail,
  AiOutlinePhone, AiOutlineEnvironment, AiOutlineLink, AiOutlineEye
} from 'react-icons/ai';

// Section icon mapping for detail view
const SECTION_ICONS = {
  'personal-info': <AiOutlineUser size={14} />,
  'business-info': <AiOutlineEnvironment size={14} />,
  'location': <AiOutlineEnvironment size={14} />,
  'classification': <AiOutlineContacts size={14} />,
};

// ─── Helpers ─────────────────────────────────────────────────────────

function findField(groups, key) {
  for (const g of groups) {
    for (const f of g.fields) {
      if (f.key === key) return f;
    }
  }
  return null;
}

const STATUS_CONFIG = {
  active:    { bg: 'bg-green-50',    text: 'text-green-700',    dot: 'bg-green-500',    border: 'border-green-200' },
  lead:      { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500',     border: 'border-blue-200' },
  prospect:  { bg: 'bg-purple-50',   text: 'text-purple-700',   dot: 'bg-purple-500',   border: 'border-purple-200' },
  customer:  { bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500',    border: 'border-amber-200' },
  inactive:  { bg: 'bg-gray-50',     text: 'text-gray-500',     dot: 'bg-gray-400',     border: 'border-gray-200' },
};

const AVATAR_COLORS = ['#296374', '#714B67', '#25A8E1', '#00AEEF', '#16A34A', '#DC2626', '#9333EA'];

function getAvatarColor(name) {
  const idx = (name || '').charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(first, last) {
  return `${(first || '?')[0]}${(last || '')[0]}`.toUpperCase();
}

// ─── Card-Style Row Renderer ────────────────────────────────────────

function ContactRow({ contact, isSelected, onSelect, onEdit, onView, onOpen360, accountName }) {
  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
  const initials = getInitials(contact.first_name, contact.last_name);
  const color = getAvatarColor(contact.first_name);
  const sc = STATUS_CONFIG[contact.status] || STATUS_CONFIG.inactive;

  return (
    <div className="flex flex-col gap-3 py-3 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect?.(contact.id)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 truncate text-sm hover:text-primary cursor-pointer transition-colors" onClick={() => onView?.(contact)}>
              {fullName}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-0.5">
              {contact.email && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <AiOutlineMail size={11} className="flex-shrink-0" /> {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <AiOutlinePhone size={11} /> {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-auto pl-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} hidden sm:inline`} />
            {contact.status || '—'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-6 sm:ml-14 flex-wrap">
        {accountName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <AiOutlineEnvironment size={12} className="text-gray-300" />
            <span className="truncate">{accountName}</span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto sm:ml-0 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onView?.(contact); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Details"
          >
            <AiOutlineEye size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen360?.(contact); }}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Open 360 View"
          >
            <AiOutlineLink size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(contact); }}
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

function ContactManagementContent({ view: controlledView, accountId, onCancel: forcedCancel, onViewChange, onValuesChange }) {
  const { 
    contacts, 
    accounts, 
    addContact, 
    updateContact, 
    deleteContact, 
    contactFieldGroups: fieldGroups, 
    setContactFieldGroups: setFieldGroups,
    getAccountById 
  } = useDataLayer();
  
  const navigate = useNavigate();
  const [internalView, setInternalView] = useState('list');
  const view = controlledView || internalView;
  
  const setView = (newView) => {
    if (onViewChange) onViewChange(newView);
    else setInternalView(newView);
  };

  const [selectedContact, setSelectedContact] = useState(null);
  const [formValues, setFormValues] = useState({});
  
  const handleValuesChange = (newValues) => {
    setFormValues(newValues);
    if (onValuesChange) onValuesChange(newValues);
  };
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saveStatus, setSaveStatus] = useState('');
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);

  // Filtered data
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesAccount = !accountId || c.account_id === accountId;
      const matchSearch = !search || `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesAccount && matchSearch && matchStatus;
    });
  }, [contacts, search, statusFilter, accountId]);

  // Stats
  const stats = useMemo(() => ({
    total: filtered.length,
    active: filtered.filter((c) => c.status === 'active').length,
    leads: filtered.filter((c) => c.status === 'lead').length,
    customers: filtered.filter((c) => c.status === 'customer').length,
  }), [filtered]);

  // Merge field type definitions and add Account lookup
  const enrichedGroups = useMemo(() => {
    const groups = fieldGroups.map((g) => ({
      ...g,
      fields: g.fields.filter(f => !f._hidden).map((f) => ({
        ...f,
        _typeDef: FIELD_TYPES[f.type] || FIELD_TYPES.text,
      })),
    }));

    // Inject Account selection into Business Information if not present
    const bizGroup = groups.find(g => g.id === 'business-info');
    if (bizGroup && !bizGroup.fields.find(f => f.key === 'account_id')) {
      bizGroup.fields.unshift({
        id: 'account_id',
        key: 'account_id',
        label: 'Account / Company',
        type: 'dropdown',
        required: true,
        options: accounts.map(acc => ({ value: acc.id, label: acc.name })),
        _typeDef: FIELD_TYPES.dropdown
      });
    }

    return groups;
  }, [fieldGroups, accounts]);

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setView('edit');
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setView('detail');
  };

  const handleOpen360 = (contact) => {
    navigate(`/sm/core-crm/customer-360/${contact.id}`);
  };

  const handleCreate = (data) => {
    addContact({ ...data, account_id: accountId || data.account_id });
    setView('list');
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleUpdate = (data) => {
    if (selectedContact) {
      updateContact(selectedContact.id, data);
      setView('list');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const handleCancel = () => {
    if (forcedCancel) forcedCancel();
    else setView('list');
  };

  if (view === 'create' || view === 'edit') {
    const isEdit = view === 'edit';
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <AiOutlineUser size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                {isEdit ? `Edit ${selectedContact?.first_name}` : 'Create New Contact'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium">Cancel</button>
            <button form="dynamic-form" type="submit" className="px-5 py-2 text-sm text-white bg-primary rounded-xl hover:opacity-90 transition-all font-medium shadow-sm">
              {isEdit ? 'Save Changes' : 'Create Contact'}
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <DynamicForm
            fieldGroups={enrichedGroups}
            initialValues={isEdit ? selectedContact : { status: 'active', account_id: accountId }}
            onSubmit={isEdit ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            mode="contact"
            showTips={!accountId}
            hideSidebar={true}
            onValuesChange={handleValuesChange}
          />
        </div>
      </div>
    );
  }

  if (view === 'detail' && selectedContact) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm" style={{ backgroundColor: getAvatarColor(selectedContact.first_name) }}>
              {getInitials(selectedContact.first_name, selectedContact.last_name)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{selectedContact.first_name} {selectedContact.last_name}</h2>
              <p className="text-sm text-gray-400">{getAccountById(selectedContact.account_id)?.name || 'Independent'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('edit')} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-primary transition-colors"><AiOutlineEdit size={20} /></button>
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"><AiOutlineClose size={20} /></button>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-6">
           {enrichedGroups.map((group) => {
              const hasValues = group.fields.some((f) => selectedContact[f.key]);
              if (!hasValues) return null;
              return (
                <div key={group.id}>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    {SECTION_ICONS[group.id]} {group.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0 sm:ml-6">
                    {group.fields.map(field => {
                      const val = selectedContact[field.key];
                      if (!val) return null;
                      return (
                        <div key={field.key} className="bg-gray-50 p-3 rounded-xl">
                          <div className="text-[10px] text-gray-400 mb-0.5">{field.label}</div>
                          <div className="text-sm font-medium text-gray-700">
                            {field.key === 'account_id' ? (getAccountById(val)?.name || val) : val}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
           })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats only if global */}
      {!accountId && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SMStatsCard title="Total Contacts" value={stats.total} icon={<AiOutlineContacts />} color="#296374" />
          <SMStatsCard title="Active" value={stats.active} icon={<AiOutlineCheckCircle />} color="#16A34A" />
          <SMStatsCard title="Leads" value={stats.leads} icon={<AiOutlineUser />} color="#25A8E1" />
          <SMStatsCard title="Customers" value={stats.customers} icon={<AiOutlineTeam />} color="#9333EA" />
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SMFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              filters={[{ key: 'status', value: statusFilter, options: [{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'lead', label: 'Lead' }, { value: 'customer', label: 'Customer' }] }]}
              onFilterChange={(k, v) => setStatusFilter(v)}
              onCustomizeFields={() => setShowFieldsDrawer(true)}
            />
            <SMDataTable
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'status', label: 'Status' }
              ]}
              data={filtered}
              renderRow={(row, globalIdx, isSel, onSel) => (
                <ContactRow 
                  contact={row} 
                  isSelected={isSel} 
                  onSelect={() => onSel(globalIdx)} 
                  onEdit={handleEdit} 
                  onView={handleView}
                  onOpen360={handleOpen360}
                  accountName={getAccountById(row.account_id)?.name}
                />
              )}
            />
          </div>
        </div>

        {/* Right Sidebar only if global */}
        {!accountId && (
          <div className="hidden xl:block w-80 flex-shrink-0">
            {(view === 'create' || view === 'edit') ? (
              <div className="space-y-4 xl:sticky xl:top-24">
                <EntityPreview values={formValues} mode="contact" />
                <QuickTips />
              </div>
            ) : (
              <RightSidePanel stats={stats} onCustomizeFields={() => setShowFieldsDrawer(true)} />
            )}
          </div>
        )}
      </div>

      <CustomizeFieldsDrawer open={showFieldsDrawer} onClose={() => setShowFieldsDrawer(false)} groups={fieldGroups} onGroupsChange={setFieldGroups} />
    </div>
  );
}

function ContactManagementPage() {
  const [view, setView] = useState('list');
  return (
    <SMModuleGuard sectionId="core-crm">
      <SMModuleLayout
        title="Contact Management"
        subtitle="Manage all organizational contacts"
        color="#296374"
        icon={<AiOutlineContacts className="text-white" size={18} />}
        actions={
          view === 'list' && (
            <button onClick={() => setView('create')} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm">
              <AiOutlinePlus size={16} /> Add Contact
            </button>
          )
        }
      >
        <ContactManagementContent view={view} onViewChange={setView} />
      </SMModuleLayout>
    </SMModuleGuard>
  );
}

export default ContactManagementPage;
export { ContactManagementContent };
