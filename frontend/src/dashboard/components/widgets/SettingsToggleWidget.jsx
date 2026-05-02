import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineCheck } from 'react-icons/ai';

const SettingsToggleWidget = ({ config }) => {
  const { settingKey = 'email_notifications', label = 'Setting', description = '' } = config;
  const [value, setValue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchSetting = async () => {
      try {
        // Get the category from the key — we'll fetch all and find the key
        const res = await settingsAPI.getAll();
        const allData = res.data || {};
        for (const cat of Object.values(allData)) {
          if (cat[settingKey] !== undefined) {
            if (mounted) {
              setValue(cat[settingKey] === 'true');
              setLoading(false);
            }
            return;
          }
        }
        if (mounted) setLoading(false);
      } catch (e) {
        console.error('Failed to fetch setting:', e);
        if (mounted) setLoading(false);
      }
    };
    fetchSetting();
    return () => { mounted = false; };
  }, [settingKey]);

  const handleChange = async (checked) => {
    setValue(checked);
    try {
      await settingsAPI.update(settingKey, checked ? 'true' : 'false');
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      console.error('Failed to update setting:', e);
      setValue(!checked); // revert
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="settings-toggle-widget h-full flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800 font-primary text-sm">{label}</p>
          {description && <p className="text-xs text-gray-500 font-primary mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {saved && <AiOutlineCheck className="text-green-500 text-sm" />}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsToggleWidget;
