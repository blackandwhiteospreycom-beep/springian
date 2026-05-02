import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { AiOutlinePlus, AiOutlineSetting } from 'react-icons/ai';
import { useDataLayer } from '../data-layer/useDataLayer';
import { computeScores } from '../utils/predictor';
import { AnalyticsWidgetProvider, useAnalyticsWidget } from './AnalyticsWidgetContext';
import AnalyticsWidgetSettingsModal from './AnalyticsWidgetSettingsModal';

const card = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6';

const KPI = ({ label, value, color }) => (
  <div className="flex flex-col">
    <div className="text-[10px] text-gray-300 uppercase">{label}</div>
    <div className={`text-lg font-bold ${color}`}>{value}%</div>
  </div>
);

const InternalWidget = ({ accountId }) => {
  const { settings, setModalOpen } = useAnalyticsWidget();
  const { accounts, getActivitiesByAccount } = useDataLayer();
  const account = accounts.find(a=>a.id===accountId) || accounts[0] || null;
  const activities = account ? getActivitiesByAccount(account.id) : [];

  const { churnProbability, upsellProbability, monthly } = useMemo(() => computeScores(account, activities), [accountId, activities.length]);

  const revenueNum = (() => {
    const r = account?.annual_revenue || '0';
    if (typeof r === 'number') return r;
    if (typeof r === 'string') return Number(r.replace(/[^0-9\.]/g, '')) || 0;
    return 0;
  })();

  const maxEngagement = Math.max(...monthly.map(m=>m.count),1);
  const baseMonthlyRevenue = revenueNum / 12;

  const data = monthly.map(m=>({ name: new Date(m.month+'-01').toLocaleString(undefined,{month:'short'}), engagement: m.count, revenue: Math.round(baseMonthlyRevenue * (0.6 + (m.count/maxEngagement)*0.8)) }));

  const heightStyle = { height: settings.heightPx || 240 };

  return (
    <div className={`${card} transition-all`} style={{ gridColumn: `span ${settings.widthSpan || 1}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{settings.title}</h3>
          <p className="text-xs text-gray-500 mt-1">{account ? account.name : '—'}</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setModalOpen(true)} className="px-3 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90"><AiOutlineSetting /> </button>
        </div>
      </div>

      <div style={heightStyle} className="mb-3">
        <ResponsiveContainer width="100%" height="100%">
          {settings.chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }} barCategoryGap="20%" barGap={4}>
              <defs>
                <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#296374" stopOpacity={1} />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6B7280" interval={Math.max(0, Math.ceil(data.length / (6 * (settings.widthSpan || 1))))} tick={data.length > 6 ? { angle: -30, textAnchor: 'end' } : undefined} />
              <YAxis yAxisId="left" stroke="#6B7280" />
              {settings.showLegend && <Legend verticalAlign="top" align="right" wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />}
              <Tooltip wrapperStyle={{ background: '#ffffff', borderRadius: 8, color: '#111827' }} />
              <Bar dataKey="engagement" fill="url(#engGradient)" />
              <Bar dataKey="revenue" fill="#f59e0b" />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 6, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#296374" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#296374" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#6B7280" interval={Math.max(0, Math.ceil(data.length / (6 * (settings.widthSpan || 1))))} tick={data.length > 8 && (settings.widthSpan || 1) === 1 ? { angle: -30, textAnchor: 'end' } : undefined} />
              <YAxis yAxisId="left" stroke="#6B7280" />
              {settings.showLegend && <Legend verticalAlign="top" align="right" wrapperStyle={{ color: '#6B7280', fontSize: 12 }} />}
              <Tooltip wrapperStyle={{ background: '#ffffff', borderRadius: 8, color: '#111827' }} />
              <Area type="monotone" dataKey="engagement" fill="url(#areaGradient)" stroke="none" />
              <Line type="monotone" dataKey="engagement" stroke="#296374" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="text-[10px] text-gray-400 uppercase">Likelihood to Churn</div>
          <div className="text-2xl font-bold text-gray-800">{churnProbability}%</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-400 uppercase">Upsell Potential</div>
          <div className="text-2xl font-bold text-gray-800">{upsellProbability}%</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">Insights: Model uses interaction counts and revenue signal. For production, connect to backend ML.</div>

      <AnalyticsWidgetSettingsModal />
    </div>
  );
};

const AnalyticsWidgetWrapper = ({ accountId }) => (
  <AnalyticsWidgetProvider>
    <InternalWidget accountId={accountId} />
  </AnalyticsWidgetProvider>
);

export default AnalyticsWidgetWrapper;
export { AnalyticsWidgetProvider };
