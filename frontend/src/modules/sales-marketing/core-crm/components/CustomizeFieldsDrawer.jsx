import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AiOutlineClose, AiOutlinePlus, AiOutlineDrag, AiOutlineEye, AiOutlineEyeInvisible, AiOutlineDelete, AiOutlineEdit, AiOutlineSearch, AiOutlineCheck, AiOutlineAppstore, AiOutlineCopy } from 'react-icons/ai';
import { FIELD_TYPES, PRESET_FIELDS } from '../utils/fieldRegistry';

// ─── Type display map ─────────────────────────────────────────────────
const FIELD_DISPLAY = {
  text:         { bg: 'bg-sky-100',      text: 'text-sky-600',      ring: 'ring-sky-200',      icon: 'T' },
  email:        { bg: 'bg-violet-100',    text: 'text-violet-600',   ring: 'ring-violet-200',   icon: '@' },
  phone:        { bg: 'bg-emerald-100',   text: 'text-emerald-600',  ring: 'ring-emerald-200',  icon: '📞' },
  number:       { bg: 'bg-amber-100',     text: 'text-amber-600',    ring: 'ring-amber-200',    icon: '#' },
  date:         { bg: 'bg-rose-100',      text: 'text-rose-600',     ring: 'ring-rose-200',     icon: '📅' },
  textarea:     { bg: 'bg-teal-100',      text: 'text-teal-600',     ring: 'ring-teal-200',     icon: '¶' },
  dropdown:     { bg: 'bg-indigo-100',    text: 'text-indigo-600',   ring: 'ring-indigo-200',   icon: '▾' },
  multiselect:  { bg: 'bg-purple-100',    text: 'text-purple-600',   ring: 'ring-purple-200',   icon: '☑' },
  checkbox:     { bg: 'bg-green-100',    text: 'text-green-600',    ring: 'ring-green-200',    icon: '☐' },
  url:          { bg: 'bg-cyan-100',      text: 'text-cyan-600',     ring: 'ring-cyan-200',     icon: '🔗' },
  file:         { bg: 'bg-orange-100',    text: 'text-orange-600',   ring: 'ring-orange-200',   icon: '📎' },
  currency:     { bg: 'bg-yellow-100',    text: 'text-yellow-700',   ring: 'ring-yellow-200',   icon: '$' },
  time:         { bg: 'bg-slate-100',     text: 'text-slate-600',    ring: 'ring-slate-200',    icon: '🕐' },
};

const GROUP_ACCENTS = [
  { border: 'border-l-sky-500',    badge: 'bg-sky-100 text-sky-700',     dot: 'bg-sky-500' },
  { border: 'border-l-violet-500', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  { border: 'border-l-emerald-500',badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  { border: 'border-l-amber-500',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500' },
  { border: 'border-l-rose-500',   badge: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500' },
  { border: 'border-l-teal-500',   badge: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-500' },
  { border: 'border-l-indigo-500', badge: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-500' },
  { border: 'border-l-cyan-500',   badge: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-500' },
];

// ─── Field Editor Panel (inside drawer) ───────────────────────────────
function FieldEditorPanel({ field, isNew, onSave, onClose, allGroups, currentGroupId }) {
  const [editData, setEditData] = useState({ ...field });
  const [editingOptionIdx, setEditingOptionIdx] = useState(null);
  const d = FIELD_DISPLAY[editData.type] || FIELD_DISPLAY.text;
  const isDropdown = editData.type === 'dropdown' || editData.type === 'multiselect';
  const options = editData.options || [];
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  const addOption = () => {
    setEditData({ ...editData, options: [...options, { value: `option_${options.length}`, label: `Option ${options.length + 1}` }] });
    setEditingOptionIdx(options.length);
  };
  const updateOption = (idx, key, val) => {
    const n = [...options]; n[idx] = { ...n[idx], [key]: val };
    setEditData({ ...editData, options: n });
  };
  const removeOption = (idx) => {
    setEditData({ ...editData, options: options.filter((_, i) => i !== idx) });
    if (editingOptionIdx === idx) setEditingOptionIdx(null);
  };
  const toggleOpt = (val) => setEditData({ ...editData, [val]: !editData[val] });

  const handleSave = () => {
    if (!editData.label?.trim() || !editData.key?.trim()) return;
    onSave(editData);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-md ${d.bg} ${d.text} flex items-center justify-center text-[10px] font-bold ring-1 ${d.ring}`}>{d.icon}</div>
          <h3 className="text-sm font-semibold text-gray-800">{isNew ? 'Add' : 'Edit'} Field</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
          <AiOutlineClose size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Editor body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Label + Key */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Label</label>
            <input type="text" value={editData.label || ''} onChange={(e) => setEditData({ ...editData, label: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Key</label>
            <input type="text" value={editData.key || ''} onChange={(e) => setEditData({ ...editData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none font-mono" required />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
          <select value={editData.type || 'text'} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none bg-white">
            {Object.entries(FIELD_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
          </select>
        </div>

        {/* Group assignment */}
        <div>
          <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Group</label>
          <select value={editData.group || currentGroupId || ''} onChange={(e) => setEditData({ ...editData, group: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none bg-white">
            {allGroups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>

        {/* Required + Default toggles */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer flex-1">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editData.required ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onClick={() => toggleOpt('required')}>
              {editData.required && <AiOutlineCheck size={10} className="text-white" />}
            </div>
            <input type="checkbox" checked={editData.required || false} onChange={() => toggleOpt('required')} className="hidden" />
            <span className="text-sm text-gray-600 font-medium">Required</span>
          </label>
          {editData.type === 'checkbox' && (
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer flex-1">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${editData.defaultValue ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onClick={() => toggleOpt('defaultValue')}>
                {editData.defaultValue && <AiOutlineCheck size={10} className="text-white" />}
              </div>
              <input type="checkbox" checked={editData.defaultValue || false} onChange={() => toggleOpt('defaultValue')} className="hidden" />
              <span className="text-sm text-gray-600 font-medium">Default: On</span>
            </label>
          )}
        </div>

        {/* Placeholder + Help */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Placeholder</label>
            <input type="text" value={editData.placeholder || ''} onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Help text</label>
            <input type="text" value={editData.helpText || ''} onChange={(e) => setEditData({ ...editData, helpText: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
          </div>
        </div>

        {/* Validation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Min length</label>
            <input type="number" value={editData.minLength || ''} onChange={(e) => setEditData({ ...editData, minLength: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Max length</label>
            <input type="number" value={editData.maxLength || ''} onChange={(e) => setEditData({ ...editData, maxLength: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
          </div>
        </div>
        {editData.type === 'number' || editData.type === 'currency' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Min value</label>
              <input type="number" value={editData.min ?? ''} onChange={(e) => setEditData({ ...editData, min: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Max value</label>
              <input type="number" value={editData.max ?? ''} onChange={(e) => setEditData({ ...editData, max: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
            </div>
          </div>
        ) : null}
        {editData.type === 'date' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Min date</label>
              <input type="date" value={editData.minDate || ''} onChange={(e) => setEditData({ ...editData, minDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Max date</label>
              <input type="date" value={editData.maxDate || ''} onChange={(e) => setEditData({ ...editData, maxDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" />
            </div>
          </div>
        )}

        {/* Pattern */}
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Regex pattern</label>
          <input type="text" value={editData.pattern || ''} onChange={(e) => setEditData({ ...editData, pattern: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none font-mono" placeholder="e.g. ^[A-Z]{2}\d{4}$" />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Pattern message</label>
          <input type="text" value={editData.patternMessage || ''} onChange={(e) => setEditData({ ...editData, patternMessage: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none" placeholder="Error shown when pattern fails" />
        </div>

        {/* Dropdown/Multiselect options */}
        {isDropdown && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Options</label>
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                <AiOutlinePlus size={12} /> Add Option
              </button>
            </div>
            {options.length === 0 && (
              <div className="flex flex-col items-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                <AiOutlineAppstore size={18} className="text-gray-300 mb-1" />
                <p className="text-xs text-gray-300">No options yet</p>
              </div>
            )}
            <div className="space-y-1.5">
              {options.map((opt, idx) => (
                editingOptionIdx === idx ? (
                  <div key={idx} className="bg-white rounded-lg p-3 space-y-2 border border-gray-200">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Value (key)</label>
                      <input type="text" value={opt.value} onChange={(e) => updateOption(idx, 'value', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded font-mono focus:outline-none focus:ring-1 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Label (display)</label>
                      <input type="text" value={opt.label} onChange={(e) => updateOption(idx, 'label', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/20" />
                    </div>
                    <div className="flex items-center justify-end gap-1 pt-1">
                      <button type="button" onClick={() => setEditingOptionIdx(null)} className="px-2 py-1 text-[10px] bg-gray-200 rounded hover:bg-gray-300 transition-colors">Done</button>
                      <button type="button" onClick={() => removeOption(idx)} className="px-2 py-1 text-[10px] text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors">Delete</button>
                    </div>
                  </div>
                ) : (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group">
                    <span className="text-[10px] text-gray-300 font-mono w-4">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">{opt.label}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{opt.value}</div>
                    </div>
                    <button type="button" onClick={() => setEditingOptionIdx(idx)} className="p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                      <AiOutlineEdit size={12} className="text-gray-400" />
                    </button>
                    <button type="button" onClick={() => removeOption(idx)} className="p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                      <AiOutlineClose size={12} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor footer */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-2 flex-shrink-0">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
        <button type="button" onClick={handleSave} disabled={!editData.label?.trim() || !editData.key?.trim()} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:opacity-90 disabled:opacity-50 transition-all">Save Field</button>
      </div>
    </div>
  );
}

// ─── Field row inside group list ───────────────────────────────────────
function FieldRowItem({ field, groupIndex, onEdit, onDelete, onDuplicate, onToggle, index }) {
  const d = FIELD_DISPLAY[field.type] || FIELD_DISPLAY.text;

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-gray-100 transition-all duration-150 hover:border-gray-200 hover:shadow-sm"
    >
      <div className="cursor-grab text-gray-400 group-hover:text-gray-500 transition-colors flex-shrink-0">
        <AiOutlineDrag size={12} />
      </div>
      <div className={`w-7 h-7 rounded-md ${d.bg} ${d.text} flex items-center justify-center text-[10px] font-bold flex-shrink-0 ring-1 ${d.ring}`}>
        {d.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{field.label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-gray-400 capitalize">{field.type}</span>
          {field.required && <span className="text-[9px] px-1.5 py-px rounded-full bg-red-100 text-red-500 font-medium">required</span>}
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onToggle(field.id)}
          className={`p-1.5 rounded-md transition-colors ${field._hidden ? 'text-gray-300 hover:text-gray-500 hover:bg-gray-100' : 'text-primary/60 hover:text-primary hover:bg-primary/5'}`}
          title={field._hidden ? 'Show' : 'Hide'}
        >
          {field._hidden ? <AiOutlineEyeInvisible size={13} /> : <AiOutlineEye size={13} />}
        </button>
        <button onClick={() => onEdit(field)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Edit">
          <AiOutlineEdit size={13} className="text-gray-400 hover:text-primary" />
        </button>
        <button onClick={() => onDuplicate(field)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Duplicate">
          <AiOutlineCopy size={13} className="text-gray-400 hover:text-blue-600" />
        </button>
        <button onClick={() => onDelete(field.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Delete">
          <AiOutlineDelete size={13} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────
function CustomizeFieldsDrawer({ open, onClose, groups, onGroupsChange, zIndex = 50 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingField, setEditingField] = useState(null); // null = none, { isNew: true } = new field, { ... } = edit existing
  const [editingGroupId, setEditingGroupId] = useState(null); // which group the new field goes into
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [viewMode, setViewMode] = useState('fields'); // 'fields' | 'addFromType'

  // Scroll container ref for the groups list
  const groupsContainerRef = useRef(null);

  // Auto-scroll on drag (simplified)
  useEffect(() => {
    if (!groupsContainerRef.current) return;
    const el = groupsContainerRef.current;
    let animFrame;
    const handleDrag = (e) => {
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;
      if (y < 40 && el.scrollTop > 0) el.scrollTop -= 2;
      else if (y > rect.height - 40 && el.scrollTop + el.clientHeight < el.scrollHeight) el.scrollTop += 2;
      animFrame = requestAnimationFrame(() => handleDrag(e));
    };
    const start = () => el.addEventListener('mousemove', handleDrag);
    const stop = () => { cancelAnimationFrame(animFrame); el.removeEventListener('mousemove', handleDrag); };
    el.addEventListener('dragenter', start);
    el.addEventListener('dragend', stop);
    return () => { el.removeEventListener('dragenter', start); el.removeEventListener('dragend', stop); };
  }, []);

  // Filtered field types for the "Add from type" panel
  const filteredTypes = useMemo(() => {
    if (!searchQuery) return Object.entries(FIELD_TYPES);
    const q = searchQuery.toLowerCase();
    return Object.entries(FIELD_TYPES).filter(([key, info]) => key.includes(q) || info.label.toLowerCase().includes(q));
  }, [searchQuery]);

  const totalFields = groups.reduce((s, g) => s + g.fields.length, 0);

  if (!open) return null;

  // ─── Actions ────────────────────────────────────────────────────────
  const addFieldToGroup = (groupId, ft) => {
    const nf = {
      id: `field-${Date.now()}`,
      key: ft.key || ft.fieldType || '',
      label: ft.label || FIELD_TYPES[ft.fieldType]?.label || 'New Field',
      type: ft.fieldType || ft.type || 'text',
      required: ft.required || false,
      placeholder: ft.placeholder || '',
      helpText: ft.helpText || '',
      options: ft.options || (ft.type === 'dropdown' || ft.fieldType === 'dropdown' ? [] : ft.options),
      group: groupId,
      order: groups.find((g) => g.id === groupId)?.fields.length || 0,
    };
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, fields: [...g.fields, nf] } : g));
  };

  const removeField = (fid) => onGroupsChange(groups.map((g) => ({ ...g, fields: g.fields.filter((f) => f.id !== fid) })));
  const duplicateField = (groupId, field) => {
    const nf = { ...field, id: `field-${Date.now()}`, label: `${field.label} (copy)`, key: `${field.key}_copy` };
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, fields: [...g.fields, nf] } : g));
  };
  const toggleField = (fid) => onGroupsChange(groups.map((g) => ({ ...g, fields: g.fields.map((f) => f.id === fid ? { ...f, _hidden: !f._hidden } : f) })));

  const saveField = (updated) => {
    if (editingField?.isNew) {
      addFieldToGroup(editingField.group || editingGroupId || groups[0]?.id, updated);
    } else {
      onGroupsChange(groups.map((g) => ({ ...g, fields: g.fields.map((f) => f.id === updated.id ? updated : f) })));
    }
    setEditingField(null);
  };

  const removeGroup = (gid) => onGroupsChange(groups.filter((g) => g.id !== gid));
  const addGroup = () => {
    const ng = { id: `group-${Date.now()}`, label: 'New Group', collapsed: false, fields: [] };
    onGroupsChange([...groups, ng]);
  };
  const renameGroup = (gid, newLabel) => onGroupsChange(groups.map((g) => g.id === gid ? { ...g, label: newLabel } : g));
  const toggleGroupCollapse = (gid) => onGroupsChange(groups.map((g) => g.id === gid ? { ...g, collapsed: !g.collapsed } : g));

  const addPreset = (gid, pk) => {
    (PRESET_FIELDS[pk] || []).forEach((f) => addFieldToGroup(gid, { ...f, fieldType: f.type }));
    setShowPresetPicker(false);
  };

  const openNewFieldEditor = (groupId) => {
    setEditingGroupId(groupId);
    setEditingField({ isNew: true, id: `field-temp-${Date.now()}`, key: '', label: '', type: 'text', required: false, group: groupId });
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300" 
        style={{ zIndex: zIndex - 1 }}
        onClick={onClose} 
      />

      {/* Drawer — full-screen on mobile, fixed width on desktop */}
      <div 
        className="fixed top-0 right-0 h-full w-full sm:w-[560px] bg-white shadow-2xl flex flex-col" 
        style={{ zIndex: zIndex, animation: 'slideIn 0.3s ease-out' }}
      >

        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800">Customize Fields</h2>
            <p className="text-xs text-gray-400 mt-0.5">{groups.length} groups · {totalFields} fields</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addGroup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors font-medium"
            >
              <AiOutlinePlus size={14} /> <span className="hidden sm:inline">Group</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
            >
              <AiOutlineClose size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Drawer Body — 2-column if editing, else full list */}
        {editingField ? (
          /* ─── Editor mode ─── */
          <div className="flex-1 overflow-hidden">
            <FieldEditorPanel
              field={editingField}
              isNew={editingField.isNew}
              onSave={saveField}
              onClose={() => setEditingField(null)}
              allGroups={groups}
              currentGroupId={editingGroupId}
            />
          </div>
        ) : (
          /* ─── List mode ─── */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search + Add from type bar */}
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search field types..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none bg-gray-50"
                  />
                </div>
                <button
                  onClick={() => setShowPresetPicker(!showPresetPicker)}
                  className="flex items-center gap-1 px-2.5 py-2 text-xs text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
                >
                  <AiOutlineAppstore size={13} /> Presets
                </button>
              </div>

              {/* Preset picker */}
              {showPresetPicker && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-2">
                  {Object.entries(PRESET_FIELDS).map(([key]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize flex-1">{key.replace('-', ' ')}</span>
                      <div className="flex gap-1">
                        {groups.map((g) => (
                          <button key={g.id} onClick={() => addPreset(g.id, key)} className="px-2 py-1 text-[10px] bg-white border border-gray-200 rounded hover:bg-primary hover:text-white hover:border-primary transition-colors">
                            + {g.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick add from type grid — shows when searching */}
              {searchQuery && filteredTypes.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {filteredTypes.map(([key, info]) => {
                    const fd = FIELD_DISPLAY[key] || FIELD_DISPLAY.text;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          const targetGroup = editingGroupId || groups[0]?.id;
                          if (targetGroup) {
                            setEditingGroupId(targetGroup);
                            setEditingField({
                              isNew: true,
                              id: `field-temp-${Date.now()}`,
                              key: '',
                              label: '',
                              type: key,
                              required: false,
                              group: targetGroup,
                            });
                          }
                        }}
                        className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <div className={`w-6 h-6 rounded ${fd.bg} ${fd.text} flex items-center justify-center text-[10px] font-bold ring-1 ${fd.ring}`}>{fd.icon}</div>
                        <span className="text-[9px] text-gray-500 truncate w-full text-center">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Groups + Fields list */}
            <div ref={groupsContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
              {groups.map((group, idx) => {
                const ac = GROUP_ACCENTS[idx % GROUP_ACCENTS.length];
                return (
                  <div key={group.id} className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-l-4 ${ac.border}`}>
                    {/* Group header */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <button onClick={() => toggleGroupCollapse(group.id)} className="p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0">
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${group.collapsed ? '' : 'rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <input
                        type="text"
                        value={group.label}
                        onChange={(e) => renameGroup(group.id, e.target.value)}
                        className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 py-0.5"
                      />
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ac.badge}`}>{group.fields.length}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openNewFieldEditor(group.id)} className="p-1 rounded hover:bg-primary/5 transition-colors" title="Add field">
                          <AiOutlinePlus size={14} className="text-gray-400 hover:text-primary" />
                        </button>
                        <button onClick={() => removeGroup(group.id)} className="p-1 rounded hover:bg-red-50 transition-colors" title="Delete group">
                          <AiOutlineDelete size={14} className="text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Group fields */}
                    {!group.collapsed && (
                      <div className="px-3 pb-3 space-y-1.5">
                        {group.fields.length === 0 && (
                          <button onClick={() => openNewFieldEditor(group.id)} className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-lg hover:border-primary/30 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center mb-2">
                              <AiOutlinePlus size={16} className="text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-400">Add a field</p>
                          </button>
                        )}
                        {group.fields.map((field, fIdx) => (
                          <FieldRowItem
                            key={field.id}
                            field={field}
                            index={fIdx}
                            groupIndex={idx}
                            onEdit={(f) => setEditingField(f)}
                            onDelete={(fid) => removeField(fid)}
                            onDuplicate={(f) => duplicateField(group.id, f)}
                            onToggle={(fid) => toggleField(fid)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Group button */}
              <button onClick={addGroup} className="w-full flex items-center justify-center gap-2 px-4 py-5 border-2 border-dashed border-gray-100 rounded-xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all group">
                <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <AiOutlinePlus size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-primary transition-colors">Add New Group</span>
              </button>

              <div className="h-4" /> {/* spacer */}
            </div>

            {/* Drawer Footer */}
            <div className="px-4 sm:px-5 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> {groups.length} groups</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400" /> {totalFields} fields</span>
                </div>
                <button
                  onClick={() => {
                    if (groups.length > 0) openNewFieldEditor(groups[groups.length - 1].id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-xl hover:opacity-90 transition-all font-medium shadow-sm"
                >
                  <AiOutlinePlus size={15} />
                  Add Field
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>,
    document.body
  );
}

export default CustomizeFieldsDrawer;
