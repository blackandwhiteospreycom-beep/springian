import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DynamicField } from './DynamicField';
import {
  AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment,
  AiOutlineTags, AiOutlineCheck, AiOutlineCloudUpload,
} from 'react-icons/ai';

// Section icon mapping
const SECTION_ICONS = {
  'personal-info': <AiOutlineUser size={16} />,
  'business-info': <AiOutlineEnvironment size={16} />,
  'location': <AiOutlineEnvironment size={16} />,
  'classification': <AiOutlineTags size={16} />,
};

function buildDefaultValues(fieldGroups, overrides = {}) {
  const defaults = {};
  fieldGroups.forEach((g) => {
    g.fields.forEach((f) => {
      const ft = f._typeDef || {};
      defaults[f.key] = overrides[f.key] ?? f.defaultValue ?? ft.defaultValue ?? '';
    });
  });
  return defaults;
}

// ─── Sub-Components for Sidebar ─────────────────────────────────────

export function EntityPreview({ values, mode = 'contact' }) {
  const firstName = values.first_name || '';
  const lastName = values.last_name || '';
  const name = values.name || '';
  const company = values.company || '';
  const email = values.email || '';
  const phone = values.phone || '';
  const status = values.status || '';
  
  const displayTitle = mode === 'account' ? name : (firstName || lastName ? `${firstName} ${lastName}`.trim() : '');
  const initials = mode === 'account' ? (name ? name[0] : '?') : `${(firstName || '?')[0]}${(lastName || '')[0]}`.toUpperCase();
  
  const AVATAR_COLORS = ['#296374', '#714B67', '#25A8E1', '#00AEEF', '#16A34A', '#DC2626', '#9333EA'];
  const avatarColor = AVATAR_COLORS[(displayTitle || '').charCodeAt(0) % AVATAR_COLORS.length];

  const STATUS_CONFIG = {
    active:    { bg: 'bg-green-50',    text: 'text-green-700',    dot: 'bg-green-500' },
    Active:    { bg: 'bg-green-50',    text: 'text-green-700',    dot: 'bg-green-500' },
    lead:      { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500' },
    Prospect:  { bg: 'bg-blue-50',     text: 'text-blue-700',     dot: 'bg-blue-500' },
    prospect:  { bg: 'bg-purple-50',   text: 'text-purple-700',   dot: 'bg-purple-500' },
    customer:  { bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500' },
    Customer:  { bg: 'bg-amber-50',    text: 'text-amber-700',    dot: 'bg-amber-500' },
    inactive:  { bg: 'bg-gray-50',     text: 'text-gray-500',     dot: 'bg-gray-400' },
    Inactive:  { bg: 'bg-gray-50',     text: 'text-gray-500',     dot: 'bg-gray-400' },
  };
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {mode === 'account' ? 'Account Preview' : 'Contact Preview'}
        </h3>
      </div>

      <div className="px-5 py-5 text-center">
        <div
          className={`mx-auto flex items-center justify-center text-white text-lg font-bold shadow-sm mb-3 transition-transform duration-200 hover:scale-105 ${mode === 'account' ? 'w-16 h-16 rounded-2xl' : 'w-16 h-16 rounded-full'}`}
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <p className="text-sm font-semibold text-gray-800 truncate">
          {displayTitle || `New ${mode === 'account' ? 'Account' : 'Contact'}`}
        </p>
        {company && mode === 'contact' && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{company}</p>
        )}
        {values.industry && mode === 'account' && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{values.industry}</p>
        )}

        {status && (
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} border-${sc.dot.replace('bg-', '')}-200`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {(email || phone) && (
        <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
          {email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AiOutlineMail size={13} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AiOutlinePhone size={13} className="text-gray-400 flex-shrink-0" />
              <span>{phone}</span>
            </div>
          )}
        </div>
      )}

      {!displayTitle && !email && !phone && (
        <div className="px-5 pb-4 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400 text-center">Start filling the form to see a live preview</p>
        </div>
      )}
    </div>
  );
}

export function QuickTips() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 p-4">
      <h3 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
        <AiOutlineCloudUpload size={13} />
        Quick Tips
      </h3>
      <ul className="space-y-1.5 text-xs text-gray-500">
        <li className="flex items-start gap-1.5">
          <AiOutlineCheck size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
          Fill required fields marked with *
        </li>
        <li className="flex items-start gap-1.5">
          <AiOutlineCheck size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
          Use sections to organize info
        </li>
        <li className="flex items-start gap-1.5">
          <AiOutlineCheck size={11} className="text-green-500 mt-0.5 flex-shrink-0" />
          Collapse sections you don't need
        </li>
      </ul>
    </div>
  );
}

// ─── Main DynamicForm ───────────────────────────────────────────────

function DynamicForm({
  fieldGroups = [],
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  inlineEdit = false,
  showActions = true,
  onAutoSave,
  isEdit = false,
  entityName = '',
  mode = 'contact',
  showTips = true,
  hideSidebar = false, // New prop to toggle internal sidebar
  onValuesChange,     // New prop to sync values to parent
  cols = 2,           // New prop to control grid columns
}) {
  const [values, setValues] = useState(() => buildDefaultValues(fieldGroups, initialValues));
  const [errors, setErrors] = useState({});
  const [collapsedGroups, setCollapsedGroups] = useState(
    fieldGroups.reduce((acc, g) => ({ ...acc, [g.id]: g.collapsed || false }), {})
  );
  const autoSaveTimer = useRef(null);

  // Trigger both onAutoSave and onValuesChange
  useEffect(() => {
    onValuesChange?.(values);
    if (!onAutoSave) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      onAutoSave(values);
    }, 1000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [values, onAutoSave, onValuesChange]);

  const handleFieldChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleGroupCollapse = useCallback((groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        const fieldType = field._typeDef;
        if (fieldType && fieldType.validate) {
          const err = fieldType.validate(values[field.key], field);
          if (err) newErrors[field.key] = err;
        }
      });
    });
    setErrors(newErrors);
    return newErrors;
  }, [fieldGroups, values]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit?.(values);
  }, [validate, onSubmit, values]);

  return (
    <form onSubmit={handleSubmit} id="dynamic-form" className="relative">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Main Form Area (now expands if sidebar hidden) ─── */}
        <div className="flex-1 min-w-0 space-y-6">
          {fieldGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Section Header */}
              <button
                type="button"
                onClick={() => handleGroupCollapse(group.id)}
                className="w-full flex items-center gap-3 px-5 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {SECTION_ICONS[group.id] || <AiOutlineUser size={16} />}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-gray-800">{group.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {group.fields.filter((f) => values[f.key]).length} of {group.fields.length} fields filled
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    collapsedGroups[group.id] ? '' : 'rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Section Fields (2-column layout as requested, or custom) */}
              {!collapsedGroups[group.id] && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <div className={`grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : ''} gap-x-6 gap-y-4`}>
                    {group.fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' && cols === 2 ? 'sm:col-span-2' : ''}>
                        <DynamicField
                          field={field}
                          value={values?.[field.key]}
                          error={errors?.[field.key]}
                          onChange={handleFieldChange}
                          inlineEdit={inlineEdit}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── Internal Sidebar (Optional) ─── */}
        {!hideSidebar && (
          <div className="w-full lg:w-72 flex-shrink-0 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 space-y-4">
              <EntityPreview values={values} mode={mode} />
              {showTips && <QuickTips />}
            </div>
          </div>
        )}
      </div>

      {/* ─── Sticky Action Bar ─── */}
      {showActions && (
        <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 mt-6 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between gap-3 z-10">
          <div className="text-xs text-gray-400">
            {Object.keys(errors).length > 0 && (
              <span className="text-red-500 font-medium">Please fix {Object.keys(errors).length} error(s) above</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-sm text-white bg-primary rounded-xl hover:opacity-90 transition-all font-medium shadow-sm hover:shadow"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

export default DynamicForm;
