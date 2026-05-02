import React, { useState, useEffect } from 'react';
import { useAnalyticsWidget } from './AnalyticsWidgetContext';
import { AiOutlineClose } from 'react-icons/ai';
import { useDataLayer } from '../data-layer/useDataLayer';
import { computeScores } from '../utils/predictor';

const AnalyticsWidgetSettingsModal = ({ accountId }) => {
  const { settings, saveSettings, isModalOpen, setModalOpen } = useAnalyticsWidget();
  const { accounts, getActivitiesByAccount } = useDataLayer();
  const account = accounts.find(a=>a.id===accountId) || accounts[0] || null;
  const activities = account ? getActivitiesByAccount(account.id) : [];

  // compute data points from predictor monthly output
  const monthly = computeScores(account, activities).monthly || [];
  const dataPoints = monthly.length || 0; // usually 12

  const [local, setLocal] = useState(settings);
  const [note, setNote] = useState(null);

  useEffect(() => setLocal(settings), [settings, isModalOpen]);

  if (!isModalOpen) return null;

  // enforce minimum width logic
  const enforceWidth = (chartType, desiredWidth) => {
    let min = 1;
    if (chartType === 'bar') {
      if (dataPoints > 10) min = 3;
      else if (dataPoints > 5) min = 2;
    } else {
      if (dataPoints > 5) min = 2;
    }
    if (desiredWidth < min) {
      setNote(`Width increased to minimum ${min} for readability with ${dataPoints} data points.`);
      return min;
    }
    setNote(null);
    return desiredWidth;
  };

  // update and preview immediately
  const apply = (patch, preview = true) => {
    const next = { ...local, ...patch };
    // enforce width using chartType in next
    const enforcedWidth = enforceWidth(next.chartType, next.widthSpan);
    next.widthSpan = enforcedWidth;
    setLocal(next);
    if (preview) saveSettings(next); // live preview
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      <div className="w-96 bg-white rounded-l-2xl p-4 shadow-lg border-l border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Widget Settings</h3>
          <button onClick={() => setModalOpen(false)} className="p-2 rounded hover:bg-gray-100"><AiOutlineClose /></button>
        </div>

        <label className="block text-xs text-gray-600 mb-1">Widget Title</label>
        <input className="w-full p-2 rounded border bg-white mb-3" value={local.title} onChange={(e)=>apply({ title: e.target.value })} />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">Width (grid span 1-3)</label>
            <input type="number" min={1} max={3} className="w-full p-2 rounded border" value={local.widthSpan} onChange={(e)=>apply({ widthSpan: Math.max(1, Math.min(3, Number(e.target.value)||1)) })} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Height (px)</label>
            <input type="number" min={120} className="w-full p-2 rounded border" value={local.heightPx} onChange={(e)=>apply({ heightPx: Math.max(120, Number(e.target.value)||240) })} />
          </div>
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-600">Chart Type</label>
          <select className="w-full p-2 rounded border mt-1" value={local.chartType} onChange={(e)=>apply({ chartType: e.target.value })}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
          </select>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input id="legendToggle" type="checkbox" checked={local.showLegend} onChange={(e)=>apply({ showLegend: e.target.checked })} />
          <label htmlFor="legendToggle" className="text-xs text-gray-600">Show Legend</label>
        </div>

        {note && <div className="mt-2 text-xs text-yellow-600">{note}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => { setLocal(settings); saveSettings(settings); setModalOpen(false); }} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={() => { saveSettings(local); setModalOpen(false); }} className="px-3 py-2 rounded bg-primary text-white">Save Changes</button>
        </div>
      </div>

      {/* small backdrop to allow clicking outside to close */}
      <div className="flex-1" onClick={() => setModalOpen(false)} />
    </div>
  );
};

export default AnalyticsWidgetSettingsModal;
