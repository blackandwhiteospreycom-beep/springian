import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineUser } from 'react-icons/ai';

const SettingsProfileWidget = ({ config }) => {
  const { title = 'Profile' } = config;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    settingsAPI.getByCategory('profile')
      .then(res => {
        if (mounted) { setValues(res.data || {}); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.bulkUpdate(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save:', e);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="settings-profile-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineUser size={16} /> {title}
        </h3>
        {saved && <span className="text-xs text-green-500 font-primary">Saved!</span>}
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
          {(values.site_name || 'A').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-700 font-primary">Avatar</p>
          <p className="text-[10px] text-gray-400 font-primary">JPG, GIF or PNG. Max 1MB</p>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 font-primary mb-1">Site Name</label>
          <input
            type="text"
            value={values.site_name || ''}
            onChange={(e) => setValues(prev => ({ ...prev, site_name: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 font-primary mb-1">Admin Email</label>
          <input
            type="email"
            value={values.admin_email || ''}
            onChange={(e) => setValues(prev => ({ ...prev, admin_email: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-3 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

export default SettingsProfileWidget;
