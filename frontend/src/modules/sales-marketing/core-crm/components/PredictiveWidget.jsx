import React, { useMemo } from 'react';
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useDataLayer } from '../data-layer/useDataLayer';
import { computeScores } from '../utils/predictor';
import { AiOutlineLineChart, AiOutlineThunderbolt } from 'react-icons/ai';

const glass = 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg';

const SmallStat = ({ label, value, color }) => (
  <div className="flex flex-col">
    <div className="text-xs text-gray-300">{label}</div>
    <div className={`text-lg font-bold ${color}`}>{value}%</div>
  </div>
);

function formatMonth(isoMonth) {
  try {
    const d = new Date(isoMonth + '-01');
    return d.toLocaleString(undefined, { month: 'short', year: '2-digit' });
  } catch (e) {
    return isoMonth;
  }
}

const PredictiveWidget = ({ accountId }) => {
  const { accounts, getActivitiesByAccount } = useDataLayer();
  const account = accounts.find(a => a.id === accountId) || accounts[0] || null;
  const activities = account ? getActivitiesByAccount(account.id) : [];

  const { churnProbability, upsellProbability, monthly } = useMemo(() => computeScores(account, activities), [accountId, account?.id, activities.length]);

  const revenueNum = (() => {
    const r = account?.annual_revenue || '0';
    if (typeof r === 'number') return r;
    if (typeof r === 'string') return Number(r.replace(/[^0-9\.]/g, '')) || 0;
    return 0;
  })();

  const maxEngagement = Math.max(...monthly.map(m => m.count), 1);
  const baseMonthlyRevenue = revenueNum / 12;

  const chartData = monthly.map(m => ({
    name: formatMonth(m.month),
    engagement: m.count,
    revenue: Math.round(baseMonthlyRevenue * (0.6 + (m.count / maxEngagement) * 0.8)),
  }));

  return (
    <div className={`p-4 ${glass}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-gray-300 uppercase tracking-wider">Predictive Analytics</div>
          <div className="text-sm font-semibold text-white flex items-center gap-2">Revenue vs Engagement <AiOutlineLineChart className="text-primary" /></div>
        </div>
        <div className="text-xs text-gray-400">AI Predictor <AiOutlineThunderbolt /></div>
      </div>

      <div style={{ height: 200 }} className="mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 6, right: 16, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" tickFormatter={(v) => `$${v}`} />

            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.75)', borderRadius: 8, border: 'none', color: '#fff' }}
              formatter={(value, name) => (name === 'revenue' ? [`$${value}`, 'Revenue'] : [value, 'Engagement'])}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />

            <Area type="monotone" dataKey="engagement" fill="url(#engGradient)" stroke="none" yAxisId="left" />
            <Line type="monotone" dataKey="engagement" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} yAxisId="left" />

            <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} yAxisId="right" strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between">
        <SmallStat label="Likelihood to Churn" value={churnProbability} color={churnProbability > 50 ? 'text-red-400' : 'text-green-300'} />
        <SmallStat label="Upsell Potential" value={upsellProbability} color={upsellProbability > 50 ? 'text-green-300' : 'text-yellow-300'} />
      </div>

      <div className="mt-3 text-xs text-gray-400">Insights: Model uses interaction counts and revenue signal. For production, connect to backend ML and use richer features.</div>
    </div>
  );
};

export default PredictiveWidget;
