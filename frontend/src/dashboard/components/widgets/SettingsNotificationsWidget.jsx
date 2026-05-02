import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineBell } from 'react-icons/ai';

const SettingsNotificationsWidget = ({ config }) => {
  const { title = 'Notifications' } = config;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    settingsAPI.getByCategory('notifications')
      .then(res => {
        if (mounted) { setValues(res.data || {}); setLoading(false); }
      })
      .catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const toggle = (key) => {
    const newVal = values[key] === 'true' ? 'false' : 'true';
    setValues(prev => ({ ...prev, [key]: newVal }));
    settingsAPI.update(key, newVal).catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>;

  const items = [
    { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive email updates' },
    { key: 'push_notifications', label: 'Push Notifications', desc: 'Browser push alerts' },
  ];

  return (
    <div className="settings-notifications-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineBell size={16} /> {title}
        </h3>
        {saved && <span className="text-xs text-green-500 font-primary">Saved!</span>}
      </div>

      <div className="space-y-3 flex-1">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-800 font-primary">{item.label}</p>
              <p className="text-[10px] text-gray-400 font-primary">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={values[item.key] === 'true'}
                onChange={() => {
                  toggle(item.key);
                  setSaved(true);
                  setTimeout(() => setSaved(false), 1500);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsNotificationsWidget;
