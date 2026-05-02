/* Lead Assignment Engine
   - Enrichment (simulated)
   - Auto-Qualification (zero-shot style heuristic)
   - Predictive Scoring
   - Account Affinity lookup
   - Weighted & Capacity-Aware Rep selection
   - Actionable payload generation
*/

// Simulated enrichment API (would be server-side in production)
async function enrichLead(lead) {
  // shallow clone
  const out = { ...lead };
  // Simulate network delay
  await new Promise(r => setTimeout(r, 250));

  if (!out.industry) out.industry = ['Software', 'Finance', 'Healthcare'][Math.floor(Math.random() * 3)];
  if (!out.annual_revenue) out.annual_revenue = [500000, 2000000, 10000000][Math.floor(Math.random() * 3)];
  if (!out.linkedin) out.linkedin = `https://www.linkedin.com/in/${(out.first_name || 'lead').toLowerCase()}-${(out.last_name||'user').toLowerCase()}`;

  return out;
}

// Simple zero-shot-ish NLP classifier (rule-based for offline demo)
function autoQualify(lead) {
  const text = `${lead.title || ''} ${lead.description || ''} ${lead.company || ''} ${lead.notes || ''}`.toLowerCase();
  // Negative signals
  const negative = ['spam', 'job posting', 'hiring', 'resume', 'career', 'intern', 'irrelevant'];
  for (const n of negative) if (text.includes(n)) return false;
  // Positive signals
  const positive = ['purchase', 'buy', 'pricing', 'demo', 'trial', 'implementation', 'project', 'budget'];
  for (const p of positive) if (text.includes(p)) return true;
  // Default: neutral => treat as viable lead
  return true;
}

// Scoring model combining engagement telemetry and firmographic features
function scoreLead(lead) {
  // Engagement piece (0-60)
  const engagement = (() => {
    const opens = (lead.engagement?.opens || 0);
    const clicks = (lead.engagement?.clicks || 0);
    const replies = (lead.engagement?.replies || 0);
    // Weighted
    const score = Math.min(60, opens * 1 + clicks * 5 + replies * 12);
    return score;
  })();

  // Firmographic piece (0-30)
  const firm = (() => {
    const revenue = lead.annual_revenue || 0;
    if (revenue >= 10000000) return 30;
    if (revenue >= 2000000) return 18;
    if (revenue >= 500000) return 8;
    return 2;
  })();

  // Other heuristics (0-10)
  const other = (() => {
    const hasLinkedIn = !!lead.linkedin;
    const hasCompany = !!lead.company;
    return (hasLinkedIn ? 6 : 0) + (hasCompany ? 4 : 0);
  })();

  const raw = engagement + firm + other;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function findAccountAffinity(lead, crm) {
  // crm may supply accounts array or a helper function
  if (!crm) return null;
  const accounts = crm.accounts || [];
  // match by exact company name
  if (lead.company) {
    const match = accounts.find(a => (a.name || '').toLowerCase() === (lead.company || '').toLowerCase());
    if (match) return match;
  }
  // match by email domain
  if (lead.email && lead.email.includes('@')) {
    const domain = lead.email.split('@')[1].toLowerCase();
    const match = accounts.find(a => (a.domain || '').toLowerCase() === domain || (a.website || '').includes(domain));
    if (match) return match;
  }
  // fallback: CRM provided helper
  if (typeof crm.findAccountByDomain === 'function') return crm.findAccountByDomain(lead.email?.split('@')[1]);
  return null;
}

function pickWeightedRep(team) {
  // team: [{id,name,rep_weight,current_load,max_capacity}]
  const candidates = team.filter(t => (t.max_capacity == null) || (t.current_load < t.max_capacity));
  if (!candidates.length) return null;
  const scores = candidates.map(t => {
    const loadFactor = t.max_capacity ? Math.max(0, 1 - (t.current_load || 0) / t.max_capacity) : 1;
    return (t.rep_weight || 1) * (loadFactor);
  });
  const total = scores.reduce((s, x) => s + x, 0);
  if (total <= 0) return candidates[0];
  // weighted random
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= scores[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export async function assignLeadEngine({ lead, team = [], crm = {}, forceUserId = null }) {
  // 1. Enrich
  const enriched = await enrichLead(lead);

  // 2. Auto-qualify
  const qualified = autoQualify(enriched);
  if (!qualified) {
    return { assignedRep: null, reason: 'auto-disqualified', lead_score: 0, actionablePayload: null, enriched };
  }

  // 3. Score
  const lead_score = scoreLead(enriched);

  // 4. Account affinity
  const account = findAccountAffinity(enriched, crm);
  if (account && account.owner) {
    // route to incumbent
    const assignedRep = { id: account.owner_id || account.owner, name: account.owner };
    const actionablePayload = {
      meeting_scheduler_link: `https://meet.example.com/schedule?rep=${encodeURIComponent(assignedRep.id)}&lead=${encodeURIComponent(lead.id)}`,
      voip_click_to_call: `tel:+10000000000?rep=${encodeURIComponent(assignedRep.id)}&lead=${encodeURIComponent(lead.id)}`
    };
    return { assignedRep, reason: 'account-affinity', lead_score, actionablePayload, enriched };
  }

  // 5. Forced assignment (manual assign to specific user)
  if (forceUserId) {
    const forced = team.find(t => t.id === forceUserId) || { id: forceUserId, name: forceUserId };
    const actionablePayload = {
      meeting_scheduler_link: `https://meet.example.com/schedule?rep=${encodeURIComponent(forced.id)}&lead=${encodeURIComponent(lead.id)}`,
      voip_click_to_call: `tel:+10000000000?rep=${encodeURIComponent(forced.id)}&lead=${encodeURIComponent(lead.id)}`
    };
    return { assignedRep: forced, reason: 'manual', lead_score, actionablePayload, enriched };
  }

  // 6. Weighted & capacity-aware distribution
  const selected = pickWeightedRep(team);
  if (!selected) {
    return { assignedRep: null, reason: 'no-available-rep', lead_score, actionablePayload: null, enriched };
  }

  const actionablePayload = {
    meeting_scheduler_link: `https://meet.example.com/schedule?rep=${encodeURIComponent(selected.id)}&lead=${encodeURIComponent(lead.id)}`,
    voip_click_to_call: `tel:+10000000000?rep=${encodeURIComponent(selected.id)}&lead=${encodeURIComponent(lead.id)}`
  };

  return { assignedRep: selected, reason: 'weighted-distribution', lead_score, actionablePayload, enriched };
}

export async function bulkAssignEngine({ leadIds = [], team = [], crm = {}, contacts = {}, updateContact }) {
  const results = [];
  for (const id of leadIds) {
    const lead = contacts[id] || { id };
    const r = await assignLeadEngine({ lead, team, crm });
    if (r.assignedRep) {
      // persist through provided updater if available
      if (typeof updateContact === 'function') updateContact(id, { owner: r.assignedRep.name, lead_score: r.lead_score, enriched: r.enriched, actionablePayload: r.actionablePayload });
    }
    results.push({ leadId: id, result: r });
  }
  return results;
}

export default { assignLeadEngine, bulkAssignEngine };