import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineLock } from 'react-icons/ai';

const SettingsSecurityWidget = ({ config }) => {
  const { title = 'Security' } = config;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    settingsAPI.getByCategory('security')
      .then(res => {
        if (mounted) { setValues(res.data || {}); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    try {
      await settingsAPI.bulkUpdate(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error('Failed:', e); }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="settings-security-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineLock size={16} /> {title}
        </h3>
        {saved && <span className="text-xs text-green-500 font-primary">Saved!</span>}
      </div>

      <div className="space-y-4 flex-1">
        {/* 2FA Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs font-medium text-gray-800 font-primary">Two-Factor Authentication</p>
            <p className="text-[10px] text-gray-400 font-primary">Extra layer of security</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={values.two_factor === 'true'}
              onChange={(e) => setValues(prev => ({ ...prev, two_factor: e.target.checked ? 'true' : 'false' }))}
              className="sr-only peer"
            />
            <div className="w-9 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Session Timeout */}
        <div>
          <label className="block text-[10px] font-medium text-gray-500 font-primary mb-1">Session Timeout (minutes)</label>
          <input
            type="number"
            value={values.session_timeout || '30'}
            onChange={(e) => setValues(prev => ({ ...prev, session_timeout: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
          />
        </div>

        {/* Password Change */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-800 font-primary mb-2">Change Password</p>
          <input type="password" placeholder="Current password" className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary mb-1.5" />
          <input type="password" placeholder="New password" className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary mb-1.5" />
          <input type="password" placeholder="Confirm password" className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary" />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-3 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
      >
        Save Security
      </button>
    </div>
  );
};

export default SettingsSecurityWidget;
