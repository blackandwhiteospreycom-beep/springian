const fetch = require('node-fetch');
const pool = require('../db');

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL || 'llama3.2';
const EMBEDDING_MODEL = process.env.AI_EMBEDDING_MODEL || 'nomic-embed-text';
const MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS) || 2000;
const TEMPERATURE = parseFloat(process.env.AI_TEMPERATURE) || 0.3;
const RATE_LIMIT_PER_DAY = parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 100;
const RATE_LIMIT_PER_MINUTE = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 10;

const requestCountsByMinute = new Map();

// ─── Role & Permission Engine (Phase 2) ───────────────────────────────

// Permission matrix: role -> allowed actions
const PERMISSION_MAP = {
  Admin: {
    can: ['view:*', 'create:*', 'update:*', 'delete:*', 'manage_users', 'manage_billing', 'view_ai_usage'],
    dataScope: 'all',
  },
  Manager: {
    can: ['view:*', 'create:services', 'update:services', 'view:users', 'view:analytics', 'use_ai'],
    dataScope: 'assigned',
  },
  User: {
    can: ['view:services', 'view:own_data', 'use_ai'],
    dataScope: 'own',
  },
};

function resolvePermissions(role) {
  const rolePerms = PERMISSION_MAP[role] || PERMISSION_MAP.User;
  return {
    canViewServices: rolePerms.can.some(p => p.startsWith('view:') && (p.includes('services') || p === 'view:*')),
    canViewUsers: rolePerms.can.some(p => p.startsWith('view:') && (p.includes('users') || p === 'view:*')),
    canViewAnalytics: rolePerms.can.some(p => p.startsWith('view:') && (p.includes('analytics') || p === 'view:*')),
    canCreate: rolePerms.can.some(p => p.startsWith('create:') || p === 'create:*'),
    canUpdate: rolePerms.can.some(p => p.startsWith('update:') || p === 'update:*'),
    canDelete: rolePerms.can.some(p => p.startsWith('delete:') || p === 'delete:*'),
    canManageUsers: rolePerms.can.some(p => p === 'manage_users'),
    canManageBilling: rolePerms.can.some(p => p === 'manage_billing'),
    canUseAI: rolePerms.can.some(p => p === 'use_ai' || p === 'view:*'),
    dataScope: rolePerms.dataScope,
  };
}

function filterByPermission(requestedAction, userPermissions) {
  // requestedAction: 'delete:users', 'update:services', etc.
  const [action, resource] = requestedAction.split(':');
  const wildcard = `${action}:*`;
  const specific = requestedAction;

  return userPermissions.can.some(p => p === wildcard || p === specific);
}

function getDeniedMessage(requestedAction) {
  return `You don't have permission to ${requestedAction}. Contact an admin for assistance.`;
}

// ─── Session Management ───────────────────────────────────────────────

async function createSession(userId, title = null) {
  const { rows } = await pool.query(
    `INSERT INTO ai_sessions (user_id, title, context, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [userId, title || 'New Conversation', JSON.stringify({})]
  );
  return rows[0];
}

async function getSession(sessionId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM ai_sessions WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  );
  if (rows.length === 0) return null;

  const convRes = await pool.query(
    `SELECT role, content, metadata, created_at
     FROM ai_conversations
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [sessionId]
  );

  return {
    ...rows[0],
    messages: convRes.rows.reverse(),
  };
}

async function getSessions(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM ai_sessions WHERE user_id = $1 AND is_active = true ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

async function deleteSession(sessionId, userId) {
  const { rows } = await pool.query(
    `DELETE FROM ai_sessions WHERE id = $1 AND user_id = $2 RETURNING *`,
    [sessionId, userId]
  );
  return rows[0] || null;
}

async function addMessage(sessionId, role, content, metadata = {}) {
  return pool.query(
    `INSERT INTO ai_conversations (session_id, role, content, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [sessionId, role, content, JSON.stringify(metadata)]
  );
}

// ─── Context Engine (Phase 2 Enhanced) ────────────────────────────────

async function getContext(userId, sessionId = null) {
  const context = {};

  // Full user profile
  const userRes = await pool.query('SELECT id, name, email, company, role, status, joined FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }
  context.user = userRes.rows[0];

  // Resolve permissions from role
  context.permissions = resolvePermissions(context.user.role);

  // Data scope based on role
  if (context.permissions.dataScope === 'all') {
    // Admin sees everything
    context.dataScope = {
      services: await pool.query('SELECT id, name, status FROM services'),
      users: await pool.query('SELECT id, name, email, company, role FROM users'),
    };
  } else if (context.permissions.dataScope === 'assigned') {
    // Manager sees their company
    context.dataScope = {
      services: await pool.query('SELECT id, name, status FROM services'),
      users: await pool.query('SELECT id, name, email, company, role FROM users WHERE company = $1', [context.user.company]),
    };
  } else {
    // User sees own data only
    context.dataScope = {
      services: null,
      users: [{ id: context.user.id, name: context.user.name, email: context.user.email, role: context.user.role }],
    };
  }

  // Business snapshot (all roles)
  const activityRes = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM services) as total_services,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT metric_value FROM analytics_metrics WHERE metric_key = 'total_revenue') as total_revenue,
      (SELECT metric_value FROM analytics_metrics WHERE metric_key = 'active_users') as active_users,
      (SELECT metric_value FROM analytics_metrics WHERE metric_key = 'new_signups') as new_signups,
      (SELECT metric_value FROM analytics_metrics WHERE metric_key = 'churn_rate') as churn_rate
  `);
  context.businessSnapshot = activityRes.rows[0];

  // User behavior profile
  context.behaviorProfile = await getBehaviorProfile(userId);

  // User preferences from memory
  const memoryRes = await pool.query(
    `SELECT key, value, memory_type, confidence, usage_count
     FROM ai_memory
     WHERE user_id = $1
     ORDER BY usage_count DESC
     LIMIT 10`,
    [userId]
  );
  context.preferences = memoryRes.rows;

  // Engagement score
  context.engagementScore = await getEngagementScore(userId);

  // Conversation history
  if (sessionId) {
    const convRes = await pool.query(
      `SELECT role, content FROM ai_conversations
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [sessionId]
    );
    context.conversationHistory = convRes.rows.reverse();
  }

  return context;
}

// ─── Prompt Builder ───────────────────────────────────────────────────

function buildPrompt(context, userInput, promptTemplate = 'general_chat') {
  const systemPrompt = buildSystemPrompt(context);

  return [
    { role: 'system', content: systemPrompt },
    ...(context.conversationHistory || []).map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userInput },
  ];
}

function buildSystemPrompt(context) {
  const { user, permissions, businessSnapshot, preferences, behaviorProfile, engagementScore } = context;

  // Role-specific system prompt
  let systemPrompt = `You are an intelligent AI assistant for Master App, a SaaS management platform.

## User Context
- Name: ${user.name}
- Email: ${user.email}
- Company: ${user.company || 'N/A'}
- Role: ${user.role}
- Account Status: ${user.status || 'active'}
- Member Since: ${user.joined || 'Unknown'}

## Your Permissions (as ${user.role})
${permissions.canViewServices ? '- ✅ Can view services' : '- ❌ Cannot view services'}
${permissions.canViewUsers ? '- ✅ Can view users' : '- ❌ Cannot view users'}
${permissions.canViewAnalytics ? '- ✅ Can view analytics' : '- ❌ Cannot view analytics'}
${permissions.canCreate ? '- ✅ Can create resources' : '- ❌ Cannot create resources'}
${permissions.canDelete ? '- ✅ Can delete resources' : '- ❌ Cannot delete resources'}
${permissions.canManageUsers ? '- ✅ Can manage users' : '- ❌ Cannot manage users'}

## Current Business Snapshot
- Total Services: ${businessSnapshot.total_services}
- Total Users: ${businessSnapshot.total_users}
- Revenue: ${businessSnapshot.total_revenue || 'N/A'}
- Active Users: ${businessSnapshot.active_users || 'N/A'}
- New Signups: ${businessSnapshot.new_signups || 'N/A'}
- Churn Rate: ${businessSnapshot.churn_rate || 'N/A'}`;

  // Behavior profile
  if (behaviorProfile) {
    systemPrompt += `\n\n## User Behavior Pattern
- Most common AI topics: ${behaviorProfile.topInterests?.join(', ') || 'Not enough data yet'}
- Preferred interaction style: ${behaviorProfile.preferredStyle || 'Direct and concise'}
- AI usage level: ${behaviorProfile.usageLevel || 'New user'}`;
  }

  // Engagement score
  if (engagementScore !== null) {
    if (engagementScore < 0.2) {
      systemPrompt += '\n\n## Engagement Note\nThis user is a casual AI user. Proactively offer help and suggest useful features.';
    } else if (engagementScore > 0.7) {
      systemPrompt += '\n\n## Engagement Note\nThis user is a power AI user. They know how to use AI well. Give advanced suggestions and shortcuts.';
    }
  }

  systemPrompt += `\n\n## Guidelines
- Be concise, accurate, and helpful.
- Reference specific numbers and metrics when available.
- If you don't know something, say so honestly.
- NEVER suggest actions the user doesn't have permission for.
- If user asks to do something they can't do, explain why and suggest who can help.
- Adapt tone based on user's engagement level (${engagementScore !== null ? (engagementScore > 0.7 ? 'power user - be direct' : engagementScore < 0.2 ? 'casual user - be helpful' : 'regular user - be balanced') : 'new user - be welcoming'}).`;

  if (preferences && preferences.length > 0) {
    systemPrompt += '\n\n## User Preferences (remembered)\n';
    preferences.forEach(p => {
      systemPrompt += `- ${p.key}: ${p.value}\n`;
    });
  }

  return systemPrompt;
}

// Permission check in AI responses
function checkPermissionAndRespond(userId, requestedAction, context) {
  const perms = context.permissions || resolvePermissions(context.user?.role);
  if (!filterByPermission(requestedAction, perms)) {
    return { allowed: false, message: getDeniedMessage(requestedAction) };
  }
  return { allowed: true };
}

// ─── LLM Router (Ollama) ─────────────────────────────────────────────

async function callLLM(messages, options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxTokens = MAX_TOKENS,
    temperature = TEMPERATURE,
  } = options;

  const startTime = Date.now();

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.message?.content || '';
  const latencyMs = Date.now() - startTime;
  const tokensIn = Math.ceil(JSON.stringify(messages).length / 4);
  const tokensOut = Math.ceil(content.length / 4);

  return {
    content,
    model,
    tokensIn,
    tokensOut,
    latencyMs,
    costUsd: 0,
  };
}

// ─── Streaming LLM (Ollama) ──────────────────────────────────────────

async function callLLMStreaming(messages, onChunk, options = {}) {
  const {
    model = DEFAULT_MODEL,
    maxTokens = MAX_TOKENS,
    temperature = TEMPERATURE,
  } = options;

  const startTime = Date.now();
  let fullContent = '';
  const tokensIn = Math.ceil(JSON.stringify(messages).length / 4);

  const response = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        num_predict: maxTokens,
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errText}`);
  }

  // node-fetch v2 uses Readable stream
  return new Promise((resolve, reject) => {
    response.body.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          const content = data.message?.content || '';
          fullContent += content;
          if (onChunk && content) onChunk(content);
        } catch (e) {
          // Skip malformed lines
        }
      }
    });

    response.body.on('end', () => {
      const latencyMs = Date.now() - startTime;
      const tokensOut = Math.ceil(fullContent.length / 4);
      resolve({
        content: fullContent,
        model,
        tokensIn,
        tokensOut,
        latencyMs,
        costUsd: 0,
      });
    });

    response.body.on('error', (err) => {
      reject(new Error(`Stream error: ${err.message}`));
    });
  });
}

// ─── Memory Management ────────────────────────────────────────────────

async function saveMemory(userId, memoryType, key, value, confidence = 0.5) {
  const existing = await pool.query(
    `SELECT id FROM ai_memory WHERE user_id = $1 AND key = $2`,
    [userId, key]
  );

  if (existing.rows.length > 0) {
    return pool.query(
      `UPDATE ai_memory SET value = $1, confidence = $2, usage_count = usage_count + 1, updated_at = NOW()
       WHERE user_id = $3 AND key = $4
       RETURNING *`,
      [value, confidence, userId, key]
    );
  }

  return pool.query(
    `INSERT INTO ai_memory (user_id, memory_type, key, value, confidence, usage_count)
     VALUES ($1, $2, $3, $4, $5, 0)
     RETURNING *`,
    [userId, memoryType, key, value, confidence]
  );
}

async function getMemory(userId, memoryType = null) {
  if (memoryType) {
    const { rows } = await pool.query(
      `SELECT * FROM ai_memory WHERE user_id = $1 AND memory_type = $2 ORDER BY usage_count DESC`,
      [userId, memoryType]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT * FROM ai_memory WHERE user_id = $1 ORDER BY usage_count DESC`,
    [userId]
  );
  return rows;
}

async function clearMemory(userId) {
  return pool.query('DELETE FROM ai_memory WHERE user_id = $1', [userId]);
}

// ─── User Behavior Profiling (Phase 2) ────────────────────────────────

async function getBehaviorProfile(userId) {
  // Analyze past AI conversations to find patterns
  const topicRes = await pool.query(
    `SELECT feature, COUNT(*) as count
     FROM ai_usage_log
     WHERE user_id = $1
     GROUP BY feature
     ORDER BY count DESC
     LIMIT 5`,
    [userId]
  );

  const usageRes = await pool.query(
    `SELECT COUNT(*) as total_interactions,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_7d,
            COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_30d
     FROM ai_usage_log
     WHERE user_id = $1`,
    [userId]
  );

  const total = parseInt(usageRes.rows[0]?.total_interactions || 0);
  const recent7d = parseInt(usageRes.rows[0]?.recent_7d || 0);

  let usageLevel = 'New user';
  if (total > 50) usageLevel = 'Power user';
  else if (total > 20) usageLevel = 'Regular user';
  else if (total > 5) usageLevel = 'Casual user';

  let preferredStyle = 'Direct and concise';
  const topInterests = topicRes.rows.map(r => r.feature);

  // Determine style from message length
  const msgLenRes = await pool.query(
    `SELECT AVG(LENGTH(content)) as avg_length
     FROM ai_conversations c
     JOIN ai_sessions s ON c.session_id = s.id
     WHERE s.user_id = $1 AND c.role = 'user'`,
    [userId]
  );

  const avgLen = parseInt(msgLenRes.rows[0]?.avg_length || 0);
  if (avgLen > 200) preferredStyle = 'Detailed and thoughtful';
  else if (avgLen > 50) preferredStyle = 'Conversational';
  else preferredStyle = 'Brief and direct';

  return {
    totalInteractions: total,
    recent7d,
    recent30d: parseInt(usageRes.rows[0]?.recent_30d || 0),
    topInterests,
    preferredStyle,
    usageLevel,
  };
}

// ─── AI Engagement Scoring (Phase 2) ─────────────────────────────────

async function getEngagementScore(userId) {
  const { rows } = await pool.query(
    `SELECT
      COALESCE(SUM(requests_count), 0) as total_requests,
      COALESCE(AVG(requests_count), 0) as avg_daily_requests,
      MAX(date) as last_used
     FROM ai_rate_limits
     WHERE user_id = $1`,
    [userId]
  );

  const totalRequests = parseInt(rows[0]?.total_requests || 0);
  const avgDaily = parseFloat(rows[0]?.avg_daily_requests || 0);
  const lastUsed = rows[0]?.last_used;

  // Score 0-1 based on multiple factors
  let score = 0;

  // Factor 1: Total usage (0-0.4)
  if (totalRequests > 50) score += 0.4;
  else if (totalRequests > 20) score += 0.3;
  else if (totalRequests > 10) score += 0.2;
  else if (totalRequests > 0) score += 0.1;

  // Factor 2: Daily average (0-0.3)
  if (avgDaily > 10) score += 0.3;
  else if (avgDaily > 5) score += 0.2;
  else if (avgDaily > 1) score += 0.1;

  // Factor 3: Recency (0-0.3)
  if (lastUsed) {
    const daysSinceLastUse = Math.floor((Date.now() - new Date(lastUsed).getTime()) / 86400000);
    if (daysSinceLastUse === 0) score += 0.3;
    else if (daysSinceLastUse <= 3) score += 0.2;
    else if (daysSinceLastUse <= 7) score += 0.1;
  }

  return Math.min(score, 1.0);
}

// ─── Learn From Interaction (Phase 2 Memory Manager) ─────────────────

async function learnFromInteraction(userId, userMessage, aiResponse) {
  // Try to extract preferences/facts from interaction
  const learnings = [];

  // Pattern: "I prefer X" or "I like X"
  const preferMatch = userMessage.match(/i\s+(prefer|like|want|need|always|never)\s+(.+)/i);
  if (preferMatch) {
    learnings.push({
      type: 'preference',
      key: `preference_${Date.now()}`,
      value: preferMatch[2].trim(),
      confidence: 0.7,
    });
  }

  // Pattern: "My X is Y"
  const factMatch = userMessage.match(/my\s+(\w+)\s+is\s+(.+)/i);
  if (factMatch) {
    learnings.push({
      type: 'fact',
      key: `fact_${factMatch[1].toLowerCase()}`,
      value: `${factMatch[1]}: ${factMatch[2].trim()}`,
      confidence: 0.5,
    });
  }

  // Save any learnings
  for (const learning of learnings) {
    await saveMemory(userId, learning.type, learning.key, learning.value, learning.confidence);
  }

  return learnings;
}

// ─── Rate Limiting ────────────────────────────────────────────────────

async function checkRateLimit(userId) {
  const todayRes = await pool.query(
    `SELECT requests_count FROM ai_rate_limits WHERE user_id = $1 AND date = CURRENT_DATE`,
    [userId]
  );

  if (todayRes.rows.length > 0 && todayRes.rows[0].requests_count >= RATE_LIMIT_PER_DAY) {
    return { allowed: false, reason: 'Daily rate limit reached' };
  }

  const currentMinute = Math.floor(Date.now() / 60000);
  const countThisMinute = requestCountsByMinute.get(`${userId}-${currentMinute}`) || 0;

  if (countThisMinute >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, reason: 'Per-minute rate limit reached' };
  }

  requestCountsByMinute.set(`${userId}-${currentMinute}`, countThisMinute + 1);

  for (const [key] of requestCountsByMinute) {
    const [, minute] = key.split('-');
    if (parseInt(minute) < currentMinute - 1) {
      requestCountsByMinute.delete(key);
    }
  }

  return { allowed: true };
}

async function incrementUsage(userId, tokensIn, tokensOut, costUsd) {
  await pool.query(
    `INSERT INTO ai_rate_limits (user_id, date, requests_count, tokens_used, cost_usd)
     VALUES ($1, CURRENT_DATE, 1, $2, $3)
     ON CONFLICT (user_id, date)
     DO UPDATE SET requests_count = ai_rate_limits.requests_count + 1,
                   tokens_used = ai_rate_limits.tokens_used + $2,
                   cost_usd = ai_rate_limits.cost_usd + $3`,
    [userId, tokensIn + tokensOut, costUsd]
  );
}

async function trackUsage(userId, feature, prompt, response, tokensIn, tokensOut, model, latencyMs, costUsd) {
  return pool.query(
    `INSERT INTO ai_usage_log (user_id, feature, prompt, response, tokens_in, tokens_out, model, latency_ms, cost_usd)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [userId, feature, prompt, response, tokensIn, tokensOut, model, latencyMs, costUsd]
  );
}

// ─── Embeddings (Ollama) ─────────────────────────────────────────────

async function generateEmbedding(text) {
  const response = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    // Embedding model may not be downloaded — return zeros
    return new Array(384).fill(0);
  }

  const data = await response.json();
  return data.embedding || new Array(384).fill(0);
}

async function storeQueryVector(userId, queryText, embedding, resultSummary, metadata = {}) {
  try {
    return pool.query(
      `INSERT INTO ai_query_vectors (user_id, query_text, embedding, result_summary, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, queryText, JSON.stringify(embedding), resultSummary, JSON.stringify(metadata)]
    );
  } catch (e) {
    // pgvector may not be installed — silently skip
  }
}

async function findSimilarQueries(queryText, userId, limit = 5) {
  try {
    const embedding = await generateEmbedding(queryText);
    const { rows } = await pool.query(
      `SELECT query_text, result_summary, metadata,
              1 - (embedding <=> $1::vector) as similarity
       FROM ai_query_vectors
       WHERE user_id = $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(embedding), userId, limit]
    );
    return rows;
  } catch (e) {
    return [];
  }
}

// ─── Export ───────────────────────────────────────────────────────────

module.exports = {
  createSession,
  getSession,
  getSessions,
  deleteSession,
  addMessage,
  getContext,
  buildPrompt,
  callLLM,
  callLLMStreaming,
  saveMemory,
  getMemory,
  clearMemory,
  checkRateLimit,
  incrementUsage,
  trackUsage,
  generateEmbedding,
  storeQueryVector,
  findSimilarQueries,
  // Phase 2
  resolvePermissions,
  filterByPermission,
  checkPermissionAndRespond,
  getBehaviorProfile,
  getEngagementScore,
  learnFromInteraction,
  DEFAULT_MODEL,
  EMBEDDING_MODEL,
  MAX_TOKENS,
  TEMPERATURE,
};
