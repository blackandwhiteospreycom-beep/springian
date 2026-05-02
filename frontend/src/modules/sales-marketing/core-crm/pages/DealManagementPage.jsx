import React, { useMemo, useState, useEffect } from 'react';
import SMModuleLayout from '../../components/SMModuleLayout';
import SMModuleGuard from '../../components/SMModuleGuard';
import { AiOutlinePlus, AiOutlineDollar, AiOutlineEdit } from 'react-icons/ai';
import { useDataLayer } from '../data-layer/useDataLayer';
import DynamicForm from '../components/DynamicForm';
import CustomizeFieldsDrawer from '../components/CustomizeFieldsDrawer';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Closed Won', 'Closed Lost'];

const DealCard = ({ deal, onMoveLeft, onMoveRight, onEdit }) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div onClick={() => onEdit(deal)} className="cursor-pointer">
          <div className="text-sm font-semibold text-gray-800">{deal.name || 'Untitled Deal'}</div>
          <div className="text-xs text-gray-500">{deal.account_name || '—'}</div>
          <div className="text-xs text-gray-600 mt-2">Amount: <span className="font-medium">${deal.amount || 0}</span></div>
        </div>
        <div className="flex flex-col gap-2 ml-3">
          <button onClick={() => onMoveLeft(deal)} className="px-2 py-1 rounded bg-gray-50 border text-xs">◀</button>
          <button onClick={() => onMoveRight(deal)} className="px-2 py-1 rounded bg-gray-50 border text-xs">▶</button>
        </div>
      </div>
    </div>
  );
};

const DealColumn = ({ stage, deals, moveLeft, moveRight, onEdit }) => (
  <div className="flex-1 min-w-[200px] sm:min-w-[240px]">
    <div className="text-xs font-semibold text-gray-500 mb-2">{stage}</div>
    <div className="space-y-2">
      {deals.map(d => (
        <DealCard key={d.id} deal={d} onMoveLeft={moveLeft} onMoveRight={moveRight} onEdit={onEdit} />
      ))}
    </div>
  </div>
);

// Deal form definition
const makeDealFieldGroups = (accounts) => ([{
  id: 'deal-info', label: 'Deal Information', collapsed: false,
  fields: [
    { id: 'name', key: 'name', label: 'Deal Name', type: 'text', required: true },
    { id: 'account_id', key: 'account_id', label: 'Account', type: 'dropdown', searchable: true, required: false, options: accounts.map(a=>({ value: a.id, label: a.name })) },
    { id: 'amount', key: 'amount', label: 'Amount', type: 'currency', required: false },
    { id: 'close_date', key: 'close_date', label: 'Close Date', type: 'date' },
    { id: 'probability', key: 'probability', label: 'Probability (%)', type: 'number', min:0, max:100 },
    { id: 'stage', key: 'stage', label: 'Stage', type: 'dropdown', options: STAGES.map(s=>({ value: s, label: s })), required: true },
  ]
}]);

const DRAFT_KEY = 'crm_deal_draft_v1';

const DealManagementPage = () => {
  const { deals, addDeal, updateDeal, getAccountById, accounts } = useDataLayer();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [fieldGroups, setFieldGroups] = useState(() => makeDealFieldGroups(accounts || []));
  const [showFieldsDrawer, setShowFieldsDrawer] = useState(false);
  const [currentValues, setCurrentValues] = useState({});

  useEffect(() => {
    // initialize field groups when accounts become available
    setFieldGroups(makeDealFieldGroups(accounts || []));
  }, [accounts]);

  // group deals by stage
  const grouped = useMemo(() => {
    const map = {};
    STAGES.forEach(s => map[s] = []);
    (deals || []).forEach(d => {
      const s = d.stage || 'Prospecting';
      if (!map[s]) map[s] = [];
      map[s].push(d);
    });
    return map;
  }, [deals]);

  const moveDeal = (deal, direction) => {
    const idx = STAGES.indexOf(deal.stage || 'Prospecting');
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;
    updateDeal(deal.id, { stage: STAGES[nextIdx] });
  };

  const openCreate = () => {
    setEditingDeal(null);
    // load draft if present
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setCurrentValues(JSON.parse(draft));
    else setCurrentValues({ stage: 'Prospecting' });
    setDrawerOpen(true);
  };
  const openEdit = (deal) => {
    setEditingDeal(deal);
    setCurrentValues({ ...deal });
    setDrawerOpen(true);
  };

  const handleSubmit = (values) => {
    const account = values.account_id ? getAccountById(values.account_id) : null;
    const payload = { ...values, account_name: account?.name || null };
    if (editingDeal) {
      updateDeal(editingDeal.id, payload);
    } else {
      addDeal(payload);
    }
    localStorage.removeItem(DRAFT_KEY);
    setDrawerOpen(false);
    setEditingDeal(null);
    setCurrentValues({});
  };

  const handleValuesChange = (vals) => {
    setCurrentValues(vals);
    // auto-save draft (debounced inside DynamicForm via onAutoSave)
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(vals)); } catch (e) { /* ignore */ }
  };

  const handleDuplicate = () => {
    if (!currentValues || !currentValues.name) return;
    const account = currentValues.account_id ? getAccountById(currentValues.account_id) : null;
    const payload = { ...currentValues, account_name: account?.name || null };
    const newDeal = addDeal(payload);
    // open the duplicated one for quick edits
    setEditingDeal(newDeal);
    setCurrentValues({ ...newDeal });
  };

  const handleSaveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(currentValues)); } catch (e) {}
    alert('Draft saved locally');
  };

  return (
    <SMModuleGuard sectionId="core-crm" featureId="deals">
      <SMModuleLayout
        title="Deal Management"
        subtitle="Visual sales pipeline and deal tracking"
        color="#296374"
        icon={<AiOutlineDollar className="text-white" size={18} />}
        actions={(
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all text-sm font-medium shadow-sm">
              <AiOutlinePlus size={16} /> Add Deal
            </button>
          </div>
        )}
      >
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              {STAGES.map(stage => (
                <DealColumn key={stage} stage={stage} deals={(grouped[stage]||[])} moveLeft={(d)=>moveDeal(d,-1)} moveRight={(d)=>moveDeal(d,1)} onEdit={openEdit} />
              ))}
            </div>
          </div>
        </div>

        {/* Right-side drawer for create/edit */}
        {drawerOpen && (
          <div className="fixed inset-y-0 right-0 z-50 flex">
            <div className="w-full sm:w-[520px] max-w-[92vw] bg-white rounded-l-2xl p-4 shadow-lg border-l border-gray-200 overflow-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{editingDeal ? 'Edit Deal' : 'Create Deal'}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowFieldsDrawer(true)} className="px-3 py-2 text-xs bg-gray-50 rounded-lg border">Customize Fields</button>
                  <button onClick={() => { setDrawerOpen(false); setEditingDeal(null); }} className="p-2 rounded hover:bg-gray-100">Close</button>
                </div>
              </div>

              <DynamicForm
                fieldGroups={fieldGroups}
                initialValues={editingDeal || currentValues || { stage: 'Prospecting' }}
                onSubmit={handleSubmit}
                onCancel={() => { setDrawerOpen(false); setEditingDeal(null); setCurrentValues({}); }}
                onValuesChange={handleValuesChange}
                submitLabel={editingDeal ? 'Save Changes' : 'Create Deal'}
                hideSidebar={true}
              />

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button onClick={handleDuplicate} className="px-3 py-2 text-sm bg-primary text-white rounded-xl">Duplicate</button>
                  <button onClick={handleSaveDraft} className="px-3 py-2 text-sm bg-gray-50 rounded-xl border">Save Draft</button>
                </div>
                <div className="text-xs text-gray-400">Draft auto-saves locally while editing</div>
              </div>

            </div>
            <div className="flex-1" onClick={() => { setDrawerOpen(false); setEditingDeal(null); setCurrentValues({}); }} />

            {/* Customize Fields Drawer */}
            <CustomizeFieldsDrawer open={showFieldsDrawer} onClose={() => setShowFieldsDrawer(false)} groups={fieldGroups} onGroupsChange={setFieldGroups} />
          </div>
        )}
      </SMModuleLayout>
    </SMModuleGuard>
  );
};

export default DealManagementPage;
