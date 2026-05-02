import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FIELD_TYPES } from '../utils/fieldRegistry';
import Select from 'react-select';
import {
  AiOutlineCheck, AiOutlineClose, AiOutlineDown, AiOutlineUp,
  AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment, AiOutlineLink,
  AiOutlineUser, AiOutlineNumber, AiOutlineCalendar, AiOutlineDollar,
  AiOutlineClockCircle, AiOutlineFile,
} from 'react-icons/ai';

// Icon mapping for field types
const FIELD_ICONS = {
  text: <AiOutlineUser size={14} />,
  email: <AiOutlineMail size={14} />,
  phone: <AiOutlinePhone size={14} />,
  number: <AiOutlineNumber size={14} />,
  date: <AiOutlineCalendar size={14} />,
  url: <AiOutlineLink size={14} />,
  currency: <AiOutlineDollar size={14} />,
  time: <AiOutlineClockCircle size={14} />,
  textarea: <AiOutlineEnvironment size={14} />,
  file: <AiOutlineFile size={14} />,
};

function DynamicField({
  field,
  value,
  onChange,
  error,
  inlineEdit = false,
}) {
  const fieldType = FIELD_TYPES[field.type] || FIELD_TYPES.text;
  const [localValue, setLocalValue] = useState(value ?? fieldType.defaultValue);
  const [isEditing, setIsEditing] = useState(!inlineEdit);
  const [touched, setTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef(null);

  const validationError = error || (touched ? fieldType.validate(localValue, field) : null);

  useEffect(() => {
    setLocalValue(value ?? fieldType.defaultValue);
  }, [value, fieldType.defaultValue]);

  const handleChange = useCallback((val) => {
    setLocalValue(val);
    setTouched(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange?.(field.key, val);
    }, 300);
  }, [field.key, onChange]);

  const displayError = error || (touched ? fieldType.validate(localValue, field) : null);

  if (inlineEdit && !isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
      >
        {localValue ? (
          <span className="text-sm text-gray-800">{renderDisplayValue(field, localValue)}</span>
        ) : (
          <span className="text-sm text-gray-300 italic">Click to add</span>
        )}
      </div>
    );
  }

  // Shared input classes — light fill style with focus glow
  const inputBase = `w-full pl-10 pr-4 py-2.5 text-sm rounded-xl transition-all duration-200 outline-none ${
    displayError
      ? 'border border-red-200 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-300'
      : 'border border-gray-100 bg-gray-50/80 hover:border-gray-200 focus:bg-white focus:border-primary/30 focus:ring-2 focus:ring-primary/20'
  }`;

  const renderInput = () => {
    const icon = FIELD_ICONS[field.type] || FIELD_ICONS.text;

    switch (fieldType.render) {
      case 'input':
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors duration-200">
              {icon}
            </div>
            <input
              type={fieldType.inputType || 'text'}
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              className={inputBase}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              min={field.min}
              max={field.max}
              step={field.type === 'number' || field.type === 'currency' ? 'any' : undefined}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
              {icon}
            </div>
            <textarea
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              className={`${inputBase} pl-10 resize-none min-h-[80px]`}
              rows={field.rows || 3}
              maxLength={field.maxLength}
              required={field.required}
            />
          </div>
        );

      case 'select':
        const opts = field.options || [];
        const shouldSearch = field.searchable || opts.length > 6;

        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>

            <div className="pl-10">
              {shouldSearch ? (
                <Select
                  classNamePrefix="react-select"
                  options={opts.map(o => ({ value: o.value, label: o.label }))}
                  value={opts.find(o => o.value === localValue) ? { value: localValue, label: opts.find(o => o.value === localValue).label } : null}
                  onChange={(opt) => handleChange(opt ? opt.value : '')}
                  isClearable
                  placeholder={`Select ${field.label.toLowerCase()}...`}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  menuPosition="fixed"
                  styles={{
                    control: (provided) => ({ ...provided, minHeight: 44, borderRadius: 12 }),
                    menu: (provided) => ({ ...provided, zIndex: 60 }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              ) : (
                <div className="relative">
                  <select
                    value={localValue}
                    onChange={(e) => handleChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`${inputBase} appearance-none cursor-pointer`}
                    required={field.required}
                  >
                    <option value="">Select {field.label.toLowerCase()}...</option>
                    {opts.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <AiOutlineDown size={12} />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {(field.options || []).map((opt) => {
                const selected = (localValue || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? (localValue || []).filter((v) => v !== opt.value)
                        : [...(localValue || []), opt.value];
                      handleChange(next);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 ${
                      selected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => handleChange(!localValue)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                localValue
                  ? 'bg-primary border-primary shadow-sm'
                  : 'border-gray-300 group-hover:border-primary/50 bg-white'
              }`}
            >
              {localValue && <AiOutlineCheck size={13} className="text-white" />}
            </div>
            <span className="text-sm text-gray-600">{field.description || field.label}</span>
          </label>
        );

      case 'file':
        return (
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <div className="px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl text-center hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                <input
                  type="file"
                  accept={(field.accept || []).map((a) => `.${a}`).join(',')}
                  onChange={(e) => handleChange(e.target.files[0])}
                  className="hidden"
                />
                <AiOutlineFile size={20} className="mx-auto text-gray-300 mb-1" />
                {localValue ? (
                  <div className="flex items-center gap-2 justify-center">
                    <AiOutlineCheck size={14} className="text-green-500" />
                    <span className="text-sm text-gray-700 font-medium">{localValue.name}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Click to upload</span>
                )}
              </div>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Label */}
      {field.type !== 'checkbox' && (
        <label className="flex items-center gap-1 text-xs font-medium text-gray-500">
          {field.label}
          {field.required && <span className="text-red-400">*</span>}
          {inlineEdit && isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="ml-auto p-0.5 hover:bg-gray-100 rounded transition-colors"
            >
              <AiOutlineClose size={12} className="text-gray-400" />
            </button>
          )}
        </label>
      )}

      {/* Input */}
      {renderInput()}

      {/* Error */}
      {displayError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-pulse">
          <AiOutlineClose size={10} />
          {displayError}
        </p>
      )}

      {/* Help text */}
      {field.helpText && !displayError && (
        <p className="text-xs text-gray-400">{field.helpText}</p>
      )}
    </div>
  );
}

function renderDisplayValue(field, value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (field.type === 'checkbox') return value ? 'Yes' : 'No';
  if (field.type === 'dropdown' || field.type === 'multiselect') {
    const opt = (field.options || []).find((o) => o.value === value);
    return opt ? opt.label : value;
  }
  return String(value);
}

// Field group with collapsible (exported for standalone use)
function DynamicFieldGroup({
  group,
  values,
  errors,
  onChange,
  onCollapse,
  inlineEdit = false,
}) {
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => onCollapse?.(group.id)}
        className="flex items-center gap-2 mb-3 w-full"
      >
        <div className="w-1 h-4 rounded-full bg-primary" />
        <h3 className="text-sm font-semibold text-gray-700">{group.label}</h3>
        {inlineEdit && (
          <span className="text-xs text-gray-400 ml-auto">click fields to edit</span>
        )}
        {onCollapse && (
          group.collapsed ? (
            <AiOutlineDown size={14} className="text-gray-400" />
          ) : (
            <AiOutlineUp size={14} className="text-gray-400" />
          )
        )}
      </button>

      {!group.collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-3">
          {group.fields.map((field) => (
            <DynamicField
              key={field.key}
              field={field}
              value={values?.[field.key]}
              error={errors?.[field.key]}
              onChange={onChange}
              inlineEdit={inlineEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { DynamicField, DynamicFieldGroup };
export default DynamicField;
