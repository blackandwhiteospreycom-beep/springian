// Simple client-side predictor utilities
export function monthlyCounts(activities = [], months = 12) {
  const now = new Date();
  const counts = Array.from({ length: months }, (_, i) => ({
    month: new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1).toISOString().slice(0,7),
    count: 0,
  }));

  activities.forEach(a => {
    const d = new Date(a.created_at);
    const key = d.toISOString().slice(0,7);
    const idx = counts.findIndex(c => c.month === key);
    if (idx !== -1) counts[idx].count++;
  });

  return counts.map(c => ({ ...c, monthLabel: c.month }));
}

function linearSlope(points) {
  // simple least-squares slope for y over x where x is index
  const n = points.length;
  if (n === 0) return 0;
  const xs = points.map((_, i) => i);
  const ys = points.map(p => p.count || 0);
  const xMean = xs.reduce((s,a)=>s+a,0)/n;
  const yMean = ys.reduce((s,a)=>s+a,0)/n;
  let num = 0, den = 0;
  for (let i=0;i<n;i++) { num += (xs[i]-xMean)*(ys[i]-yMean); den += (xs[i]-xMean)*(xs[i]-xMean); }
  if (den === 0) return 0; return num/den;
}

export function computeScores(account = {}, activities = []) {
  // Monthly activity counts (12 months)
  const monthly = monthlyCounts(activities, 12);
  const slope = linearSlope(monthly);

  // recency (days since last activity)
  const last = activities.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
  const recencyDays = last ? Math.max(0, Math.round((Date.now() - new Date(last.created_at))/ (1000*60*60*24))) : 365;

  // revenue as number (strip $ and commas if present)
  const revenueNum = (() => {
    const r = account?.annual_revenue || '0';
    if (typeof r === 'number') return r;
    if (typeof r === 'string') return Number(r.replace(/[^0-9\.]/g, '')) || 0;
    return 0;
  })();

  // heuristics:
  // churnProb increases with recency and negative slope, decreases with recent activity
  const recencyFactor = Math.min(1, recencyDays / 90); // 0..1
  const slopeFactor = Math.max(-1, Math.min(1, -slope/3)); // negative slope -> positive churn factor
  let churn = 0.08 + recencyFactor*0.6 + slopeFactor*0.25;
  // recent activity dampens churn
  const recentBoost = Math.max(0, Math.min(1, monthly.slice(-3).reduce((s,p)=>s+p.count,0)/30));
  churn = churn * (1 - 0.5*recentBoost);

  // upsell potential increases with positive slope and revenue size
  const revFactor = Math.min(1, revenueNum / 1000000); // normalize by $1M
  let upsell = 0.05 + Math.max(0, slope)*0.4 + revFactor*0.3 + recentBoost*0.2;

  // clamp 0..1
  churn = Math.max(0, Math.min(1, churn));
  upsell = Math.max(0, Math.min(1, upsell));

  return {
    churnProbability: Math.round(churn*100),
    upsellProbability: Math.round(upsell*100),
    monthly,
    slope,
    recencyDays,
  };
}
