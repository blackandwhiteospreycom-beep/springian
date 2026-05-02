import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineSave, AiOutlineCheck } from 'react-icons/ai';

const SETTINGS_BY_SECTION = {
  general: {
    title: 'General Settings',
    keys: [
      { key: 'company_name', label: 'Company Name', type: 'text' },
      { key: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French', 'German'] },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'UTC+5', 'EST', 'PST', 'CET'] },
      { key: 'date_format', label: 'Date Format', type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
    ],
  },
  profile: {
    title: 'Profile Settings',
    keys: [
      { key: 'site_name', label: 'Site Name', type: 'text' },
      { key: 'admin_email', label: 'Admin Email', type: 'email' },
    ],
  },
  security: {
    title: 'Security Settings',
    keys: [
      { key: 'two_factor', label: 'Two-Factor Authentication', type: 'toggle' },
      { key: 'session_timeout', label: 'Session Timeout (minutes)', type: 'number' },
    ],
  },
  notifications: {
    title: 'Notification Settings',
    keys: [
      { key: 'email_notifications', label: 'Email Notifications', type: 'toggle' },
      { key: 'push_notifications', label: 'Push Notifications', type: 'toggle' },
    ],
  },
  billing: {
    title: 'Billing Settings',
    keys: [
      { key: 'billing_plan', label: 'Billing Plan', type: 'select', options: ['Free', 'Pro', 'Enterprise'] },
      { key: 'billing_email', label: 'Billing Email', type: 'email' },
    ],
  },
};

const SettingsSectionWidget = ({ config }) => {
  const { section = 'general' } = config;
  const sectionConfig = SETTINGS_BY_SECTION[section] || SETTINGS_BY_SECTION.general;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getByCategory(section);
        if (mounted) setValues(res.data || {});
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSettings();
    return () => { mounted = false; };
  }, [section]);

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.bulkUpdate(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="settings-section-widget h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-primary text-base">{sectionConfig.title}</h3>
        {saved && (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <AiOutlineCheck className="text-sm" />
            <span>Saved!</span>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-4 flex-1">
        {sectionConfig.keys.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-600 font-primary mb-1.5">
              {field.label}
            </label>

            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
              <input
                type={field.type}
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
              />
            ) : field.type === 'select' ? (
              <select
                value={values[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-primary"
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'toggle' ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={values[field.key] === 'true'}
                  onChange={(e) => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            ) : null}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-primary text-sm font-medium disabled:opacity-60"
      >
        <AiOutlineSave size={14} />
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default SettingsSectionWidget;
