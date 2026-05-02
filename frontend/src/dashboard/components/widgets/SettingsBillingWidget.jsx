import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../../api';
import { AiOutlineCreditCard } from 'react-icons/ai';

const SettingsBillingWidget = ({ config }) => {
  const { title = 'Billing' } = config;
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    settingsAPI.getByCategory('billing')
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

  const planColors = {
    Free: 'from-gray-400 to-gray-500',
    Pro: 'from-blue-500 to-blue-600',
    Enterprise: 'from-primary to-teal-500',
  };

  return (
    <div className="settings-billing-widget h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-primary text-sm flex items-center gap-2">
          <AiOutlineCreditCard size={16} /> {title}
        </h3>
        {saved && <span className="text-xs text-green-500 font-primary">Saved!</span>}
      </div>

      {/* Plan Card */}
      <div className={`p-4 rounded-xl text-white mb-4 bg-gradient-to-r ${planColors[values.billing_plan] || planColors.Free}`}>
        <p className="text-[10px] opacity-80 uppercase tracking-wider">Current Plan</p>
        <p className="text-xl font-bold font-primary mt-0.5">{values.billing_plan || 'Free'}</p>
        <p className="text-[10px] opacity-70 mt-1">{values.billing_email || 'No billing email set'}</p>
      </div>

      {/* Plan Selector */}
      <div>
        <label className="block text-[10px] font-medium text-gray-500 font-primary mb-1">Change Plan</label>
        <select
          value={values.billing_plan || 'Free'}
          onChange={(e) => setValues(prev => ({ ...prev, billing_plan: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
        >
          <option>Free</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>

      {/* Billing Email */}
      <div className="mt-3">
        <label className="block text-[10px] font-medium text-gray-500 font-primary mb-1">Billing Email</label>
        <input
          type="email"
          value={values.billing_email || ''}
          onChange={(e) => setValues(prev => ({ ...prev, billing_email: e.target.value }))}
          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-primary"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-3 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium"
      >
        Update Billing
      </button>
    </div>
  );
};

export default SettingsBillingWidget;
