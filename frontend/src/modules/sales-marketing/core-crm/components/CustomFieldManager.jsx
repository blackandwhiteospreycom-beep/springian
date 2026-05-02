import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FIELD_TYPES, DEFAULT_FIELD_GROUPS, PRESET_FIELDS } from '../utils/fieldRegistry';
import {
  AiOutlinePlus, AiOutlineClose, AiOutlineDrag, AiOutlineEdit,
  AiOutlineDelete, AiOutlineDown, AiOutlineUp, AiOutlineAppstore,
  AiOutlineCheck, AiOutlinePlusCircle, AiOutlineSetting, AiOutlineSearch,
  AiOutlineCopy, AiOutlineMore, AiOutlineSave
} from 'react-icons/ai';

const FIELD_ITEM_TYPE = 'FIELD_ITEM';
const GROUP_ITEM_TYPE = 'GROUP_ITEM';

// Soft type colors — darker for visibility
const FIELD_DISPLAY = {
  text:         { bg: 'bg-sky-100',      text: 'text-sky-600',      ring: 'ring-sky-200',      icon: 'T' },
  email:        { bg: 'bg-violet-100',    text: 'text-violet-600',   ring: 'ring-violet-200',   icon: '@' },
  phone:        { bg: 'bg-emerald-100',   text: 'text-emerald-600',  ring: 'ring-emerald-200',  icon: '📞' },
  number:       { bg: 'bg-amber-100',     text: 'text-amber-600',    ring: 'ring-amber-200',    icon: '#' },
  date:         { bg: 'bg-rose-100',      text: 'text-rose-600',     ring: 'ring-rose-200',     icon: '📅' },
  textarea:     { bg: 'bg-teal-100',      text: 'text-teal-600',     ring: 'ring-teal-200',     icon: '¶' },
  dropdown:     { bg: 'bg-indigo-100',    text: 'text-indigo-600',   ring: 'ring-indigo-200',   icon: '▾' },
  multiselect:  { bg: 'bg-purple-100',    text: 'text-purple-600',   ring: 'ring-purple-200',   icon: '☑' },
  checkbox:     { bg: 'bg-green-100',     text: 'text-green-600',    ring: 'ring-green-200',    icon: '☐' },
  url:          { bg: 'bg-cyan-100',      text: 'text-cyan-600',     ring: 'ring-cyan-200',     icon: '🔗' },
  file:         { bg: 'bg-orange-100',    text: 'text-orange-600',   ring: 'ring-orange-200',   icon: '📎' },
  currency:     { bg: 'bg-yellow-100',    text: 'text-yellow-700',   ring: 'ring-yellow-200',   icon: '$' },
  time:         { bg: 'bg-slate-100',     text: 'text-slate-600',    ring: 'ring-slate-200',    icon: '🕐' },
};

// Group accent colors — darker
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

// ─── Auto-scroll ───────────────────────────────────────────────────────
function useAutoScroll(ref, speed = 12, threshold = 60) {
  useEffect(() => {
    if (!ref.current) return;
    const c = ref.current;
    const fn = (e) => {
      const r = c.getBoundingClientRect();
      const y = e.clientY - r.top;
      let d = 0;
      if (y < threshold && c.scrollTop > 0) d = -speed;
      else if (y > r.height - threshold && c.scrollTop + c.clientHeight < c.scrollHeight) d = speed;
      if (d) c.scrollTop += d;
    };
    c.addEventListener('dragover', fn);
    return () => c.removeEventListener('dragover', fn);
  }, [ref, speed, threshold]);
}

// ─── Draggable field type (sidebar) ────────────────────────────────────
// Group name display + rename on click
function GroupNameDisplay({ value, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    if (draft.trim()) onChange(draft.trim());
    else setDraft(value); // revert if empty
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setIsEditing(false); }
        }}
        className="flex-1 px-2 py-0.5 text-[13px] font-semibold text-gray-800 border border-primary/30 rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary/20"
        placeholder="Group name..."
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="flex-1 text-left px-2 py-0.5 text-[13px] font-semibold text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-text"
      title="Click to rename"
    >
      {value}
    </button>
  );
}

// Draggable field type (sidebar)
function DraggableFieldType({ type, info, onAdd }) {
  const [{ isDragging }, drag] = useDrag({
    type: FIELD_ITEM_TYPE,
    item: { type: FIELD_ITEM_TYPE, fieldType: type, ...info },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  const d = FIELD_DISPLAY[type] || FIELD_DISPLAY.text;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={drag}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border transition-all duration-150 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-30 scale-[0.97]' : hovered ? 'border-gray-200 shadow-sm' : 'border-transparent'
      }`}
    >
      <AiOutlineDrag size={11} className="text-gray-500 flex-shrink-0 hidden lg:block" />
      <div className={`w-6 h-6 rounded-md ${d.bg} ${d.text} flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
        {d.icon}
      </div>
      <span className="text-[13px] text-gray-700 flex-1 font-medium">{info.label}</span>
      {onAdd && (
        <button onClick={onAdd} className="sm:hidden p-1 rounded hover:bg-gray-100 active:scale-90 transition-transform">
          <AiOutlinePlus size={12} className="text-gray-500" />
        </button>
      )}
    </div>
  );
}

// ─── Field row inside a group ──────────────────────────────────────────
function FieldRow({ field, index, groupId, moveField, removeField, editField, duplicateField }) {
  const [{ isDragging }, drag] = useDrag({
    type: GROUP_ITEM_TYPE,
    item: { type: GROUP_ITEM_TYPE, fieldId: field.id, index },
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: GROUP_ITEM_TYPE,
    hover: (item) => {
      if (item.index !== undefined && item.index !== index) {
        moveField(item.groupId, item.index, index);
        item.index = index;
      }
    },
  });
  const d = FIELD_DISPLAY[field.type] || FIELD_DISPLAY.text;
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <div
      ref={(n) => drag(drop(n))}
      className={`group flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-gray-100 transition-all duration-150 ${
        isDragging ? 'opacity-30' : 'hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      <AiOutlineDrag size={12} className="text-gray-500 cursor-grab flex-shrink-0" />
      <div className={`w-7 h-7 rounded-md ${d.bg} ${d.text} flex items-center justify-center text-[10px] font-bold flex-shrink-0 ring-1 ${d.ring}`}>
        {d.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-gray-800 truncate">{field.label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-gray-500 capitalize">{field.type}</span>
          {field.required && <span className="text-[9px] px-1.5 py-px rounded-full bg-red-100 text-red-500 font-medium">required</span>}
        </div>
      </div>
      <div className="relative flex items-center gap-0.5">
        <button onClick={() => editField(field)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Edit">
          <AiOutlineEdit size={13} className="text-gray-500 hover:text-blue-600" />
        </button>
        {duplicateField && (
          <button onClick={() => duplicateField(groupId, field)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="Duplicate">
            <AiOutlineCopy size={13} className="text-gray-500 hover:text-blue-600" />
          </button>
        )}
        <button onClick={() => removeField(field.id)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Delete">
          <AiOutlineDelete size={13} className="text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Group card ────────────────────────────────────────────────────────
function GroupCard({ group, index, onRemoveGroup, moveField, removeField, editField, duplicateField, onDropField, moveGroup }) {
  const [, drop] = useDrop({
    accept: FIELD_ITEM_TYPE,
    drop: (item) => { onDropField(group.id, item); },
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [showMobilePicker, setShowMobilePicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!showActions) return;
    const handler = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [showActions]);

  const ac = GROUP_ACCENTS[index % GROUP_ACCENTS.length];

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-l-4 ${ac.border}`}>
        <div className="cursor-grab active:cursor-grabbing p-0.5" onDragStart={(e) => e.preventDefault()}>
          <AiOutlineDrag size={14} className="text-gray-400 hover:text-gray-500" />
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="p-0.5 hover:bg-gray-100 rounded transition-colors cursor-pointer">
          {isExpanded ? <AiOutlineUp size={14} className="text-gray-500" /> : <AiOutlineDown size={14} className="text-gray-500" />}
        </button>
        <GroupNameDisplay
          value={group.label}
          onChange={(val) => group.onLabelChange?.(val)}
        />
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ac.badge}`}>{group.fields.length}</span>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}
            onMouseDown={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <AiOutlineMore size={15} className="text-gray-600" />
          </button>
          {showActions && (
            <div ref={actionsRef} className="absolute right-0 top-9 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[140px]">
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveGroup(group.id); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <AiOutlineDelete size={13} /> Delete Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      {isExpanded && (
        <div ref={drop} className="p-3 space-y-1.5 min-h-[60px]">
          {group.fields.length === 0 && !showMobilePicker && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-100 rounded-lg">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <AiOutlinePlusCircle size={18} className="text-gray-500" />
              </div>
              <p className="hidden sm:block text-xs text-gray-500">Drop field types here</p>
              <button onClick={() => setShowMobilePicker(true)} className="sm:hidden px-3 py-1 text-xs text-primary bg-primary/5 rounded">
                Tap to add
              </button>
            </div>
          )}
          {group.fields.map((field, idx) => (
            <FieldRow
              key={field.id}
              field={field}
              index={idx}
              groupId={group.id}
              moveField={moveField}
              removeField={removeField}
              editField={editField}
              duplicateField={duplicateField}
            />
          ))}
        </div>
      )}

      {/* Mobile add */}
      <div className="sm:hidden px-3 pb-3">
        {showMobilePicker ? (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Add Field</span>
              <button onClick={() => setShowMobilePicker(false)} className="p-0.5"><AiOutlineClose size={12} className="text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {Object.entries(FIELD_TYPES).map(([key, info]) => {
                const fd = FIELD_DISPLAY[key] || FIELD_DISPLAY.text;
                return (
                  <button key={key} onClick={() => { onDropField(group.id, { type: FIELD_ITEM_TYPE, fieldType: key, ...info }); }} className="flex flex-col items-center gap-1 p-1.5 bg-white rounded active:scale-90 transition-transform">
                    <div className={`w-6 h-6 rounded ${fd.bg} ${fd.text} flex items-center justify-center text-[10px] font-bold ring-1 ${fd.ring}`}>{fd.icon}</div>
                    <span className="text-[9px] text-gray-500 truncate w-full text-center">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <button onClick={() => setShowMobilePicker(true)} className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-500 bg-gray-50 rounded-lg active:bg-gray-100">
            <AiOutlinePlus size={12} /> Add Field
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Field editor modal ────────────────────────────────────────────────
function FieldEditorModal({ field, onSave, onClose }) {
  const [editData, setEditData] = useState({ ...field });
  const [editingOptionIdx, setEditingOptionIdx] = useState(null);
  const d = FIELD_DISPLAY[editData.type] || FIELD_DISPLAY.text;
  const isDropdown = editData.type === 'dropdown' || editData.type === 'multiselect';
  const options = editData.options || [];

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

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeIn_0.15s_ease-out]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-md ${d.bg} ${d.text} flex items-center justify-center text-[10px] font-bold ring-1 ${d.ring}`}>{d.icon}</div>
            <h3 className="text-[14px] font-semibold text-gray-800">{field.id ? 'Edit' : 'Create'} Field</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <AiOutlineClose size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); onSave(editData); }} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Label</label>
              <input type="text" value={editData.label} onChange={(e) => setEditData({ ...editData, label: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Key</label>
              <input type="text" value={editData.key} onChange={(e) => setEditData({ ...editData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all font-mono" required />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Type</label>
            <select value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all bg-white">
              {Object.entries(FIELD_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer flex-1">
              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${editData.required ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onClick={() => setEditData({ ...editData, required: !editData.required })}>
                {editData.required && <AiOutlineCheck size={10} className="text-white" />}
              </div>
              <input type="checkbox" checked={editData.required || false} onChange={(e) => setEditData({ ...editData, required: e.target.checked })} className="hidden" />
              <span className="text-[13px] text-gray-600 font-medium">Required</span>
            </label>
            {editData.type === 'checkbox' && (
              <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer flex-1">
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${editData.defaultValue ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`} onClick={() => setEditData({ ...editData, defaultValue: !editData.defaultValue })}>
                  {editData.defaultValue && <AiOutlineCheck size={10} className="text-white" />}
                </div>
                <input type="checkbox" checked={editData.defaultValue || false} onChange={(e) => setEditData({ ...editData, defaultValue: e.target.checked })} className="hidden" />
                <span className="text-[13px] text-gray-600 font-medium">Default: On</span>
              </label>
            )}
          </div>
          {isDropdown && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Options</label>
                <button type="button" onClick={addOption} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                  <AiOutlinePlus size={12} /> Add Option
                </button>
              </div>
              {options.length === 0 && (
                <div className="flex flex-col items-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                  <AiOutlineAppstore size={18} className="text-gray-300 mb-1" />
                  <p className="text-xs text-gray-300">No options added yet</p>
                </div>
              )}
              <div className="space-y-1.5">
                {options.map((opt, idx) => (
                  editingOptionIdx === idx ? (
                    <div key={idx} className="bg-gray-50 rounded-lg p-2.5 space-y-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Value (key)</label>
                        <input type="text" value={opt.value} onChange={(e) => updateOption(idx, 'value', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded font-mono focus:outline-none focus:ring-1 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Label (display)</label>
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
                        <div className="text-[12px] font-medium text-gray-700 truncate">{opt.label}</div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Placeholder</label>
              <input type="text" value={editData.placeholder || ''} onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Help text</label>
              <input type="text" value={editData.helpText || ''} onChange={(e) => setEditData({ ...editData, helpText: e.target.value })} className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="px-5 py-2 text-[13px] font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition-all">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────
function CustomFieldManager({ groups, onGroupsChange }) {
  const [editingField, setEditingField] = useState(null);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [pendingField, setPendingField] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const groupsContainerRef = useRef(null);
  useAutoScroll(groupsContainerRef);

  const addFieldToGroup = (groupId, ft) => {
    const nf = { id: `field-${Date.now()}`, key: ft.key || ft.fieldType, label: ft.label || FIELD_TYPES[ft.fieldType]?.label || 'New Field', type: ft.fieldType || ft.type || 'text', required: ft.required || false, placeholder: ft.placeholder || '', helpText: ft.helpText || '', options: ft.options || (ft.type === 'dropdown' ? [] : undefined), group: groupId, order: groups.find((g) => g.id === groupId)?.fields.length || 0 };
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, fields: [...g.fields, nf] } : g));
  };

  const moveField = (gid, from, to) => {
    const g = groups.find((x) => x.id === gid);
    if (!g) return;
    const nf = [...g.fields];
    const [m] = nf.splice(from, 1);
    nf.splice(to, 0, m);
    onGroupsChange(groups.map((x) => (x.id === gid ? { ...x, fields: nf } : x)));
  };

  const moveGroup = (from, to) => {
    const nf = [...groups];
    const [m] = nf.splice(from, 1);
    nf.splice(to, 0, m);
    onGroupsChange(nf);
  };

  const removeField = (fid) => onGroupsChange(groups.map((g) => ({ ...g, fields: g.fields.filter((f) => f.id !== fid) })));
  const duplicateField = (groupId, field) => {
    const nf = { ...field, id: `field-${Date.now()}`, label: `${field.label} (copy)`, key: `${field.key}_copy` };
    onGroupsChange(groups.map((g) => g.id === groupId ? { ...g, fields: [...g.fields, nf] } : g));
  };
  const editField = (f) => setEditingField(f);
  const saveField = (uf) => { onGroupsChange(groups.map((g) => ({ ...g, fields: g.fields.map((f) => (f.id === uf.id ? uf : f)) }))); setEditingField(null); };
  const removeGroup = (gid) => onGroupsChange(groups.filter((g) => g.id !== gid));
  const addGroup = () => {
    const ng = { id: `group-${Date.now()}`, label: 'New Group', collapsed: false, fields: [], onLabelChange: (nl) => onGroupsChange(groups.map((g) => (g.id === ng.id ? { ...g, label: nl } : g))) };
    onGroupsChange([...groups, ng]);
  };
  const addPreset = (gid, pk) => { (PRESET_FIELDS[pk] || []).forEach((f) => addFieldToGroup(gid, { ...f, fieldType: f.type })); setShowPresetPicker(false); };

  const totalFields = groups.reduce((s, g) => s + g.fields.length, 0);

  // Filtered field types
  const filteredTypes = useMemo(() => {
    if (!searchQuery) return Object.entries(FIELD_TYPES);
    const q = searchQuery.toLowerCase();
    return Object.entries(FIELD_TYPES).filter(([key, info]) => key.includes(q) || info.label.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AiOutlineSetting size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-gray-800">Field Builder</h2>
              <p className="text-[10px] text-gray-500">Design your contact data structure</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[12px] text-gray-500"><span className="font-semibold text-gray-700">{groups.length}</span> groups</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[12px] text-gray-500"><span className="font-semibold text-gray-700">{totalFields}</span> fields</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition-all">
            <AiOutlineSave size={13} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Mobile palette toggle */}
      <div className="sm:hidden mb-4">
        <button onClick={() => setShowPalette(!showPalette)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-700 shadow-sm">
          <span className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><AiOutlineAppstore size={14} className="text-primary" /></div>
            Field Types
          </span>
          <svg className={`w-4 h-4 text-gray-500 transition-transform ${showPalette ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showPalette && showPalette !== 'picker' && (
          <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            <div className="grid grid-cols-3 gap-1">
              {filteredTypes.map(([key, info]) => (
                <DraggableFieldType key={key} type={key} info={info} onAdd={() => { if (groups.length === 1) addFieldToGroup(groups[0].id, { fieldType: key, ...info }); else { setPendingField({ fieldType: key, ...info }); setShowPalette('picker'); } }} />
              ))}
            </div>
          </div>
        )}
        {showPalette === 'picker' && pendingField && (
          <div className="mt-2 bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <p className="text-xs text-gray-500 mb-2">Add <strong className="text-gray-700">{pendingField.label}</strong> to:</p>
            <div className="space-y-1">
              {groups.map((g) => <button key={g.id} onClick={() => { addFieldToGroup(g.id, pendingField); setPendingField(null); setShowPalette(true); }} className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg">{g.label}</button>)}
            </div>
            <button onClick={() => { setPendingField(null); setShowPalette(true); }} className="mt-2 text-xs text-gray-500">Cancel</button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left sidebar */}
        <div className="hidden sm:block sm:w-60 lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-20 overflow-hidden">
            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <AiOutlineSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search types..."
                  className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="px-3 pb-2">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider px-1 mb-1.5">Field Types</p>
            </div>
            <div className="px-2 pb-3 space-y-0.5 max-h-[50vh] overflow-y-auto">
              {filteredTypes.map(([key, info]) => (
                <DraggableFieldType key={key} type={key} info={info} />
              ))}
              {filteredTypes.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No matching types</p>
              )}
            </div>

            {/* Presets */}
            <div className="border-t border-gray-50 px-3 py-2.5">
              <button onClick={() => setShowPresetPicker(!showPresetPicker)} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors">
                <AiOutlineAppstore size={12} /> Preset Bundles
              </button>
              {showPresetPicker && (
                <div className="mt-1.5 space-y-1">
                  {Object.entries(PRESET_FIELDS).map(([key]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 capitalize flex-1">{key.replace('-', ' ')}</span>
                      <div className="flex gap-0.5">
                        {groups.map((g) => <button key={g.id} onClick={() => addPreset(g.id, key)} className="px-1.5 py-0.5 text-[9px] bg-gray-100 rounded hover:bg-primary hover:text-white transition-colors">+{g.label.split(' ')[0]}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center workspace */}
        <div ref={groupsContainerRef} className="flex-1 space-y-4 sm:max-h-[calc(100vh-10rem)] sm:overflow-y-auto pr-0 sm:pr-2 pb-12">
          {groups.map((group, idx) => (
            <GroupCard
              key={group.id}
              group={group}
              
              index={idx}
              onRemoveGroup={removeGroup}
              moveField={moveField}
              moveGroup={moveGroup}
              removeField={removeField}
              editField={editField}
              duplicateField={duplicateField}
              onDropField={(gid, item) => addFieldToGroup(gid, item)}
            />
          ))}

          {/* Add group */}
          <button onClick={addGroup} className="w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-100 rounded-xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all group">
            <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <AiOutlinePlus size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[13px] font-medium text-gray-500 group-hover:text-primary transition-colors">Add New Group</span>
          </button>
        </div>
      </div>

      {editingField && <FieldEditorModal field={editingField} onSave={saveField} onClose={() => setEditingField(null)} />}
    </DndProvider>
  );
}

export default CustomFieldManager;
