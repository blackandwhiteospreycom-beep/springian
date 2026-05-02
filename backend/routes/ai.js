const express = require('express');
const router = express.Router();
const pool = require('../db');
const aiService = require('../services/aiService');

// For demo purposes — in production, extract from JWT/session
const DEMO_USER_ID = 1;

// ─── Middleware: Rate Limiter ──────────────────────────────────────────

const rateLimiter = async (req, res, next) => {
  const userId = req.body?.userId || DEMO_USER_ID;
  const limitCheck = await aiService.checkRateLimit(userId);
  if (!limitCheck.allowed) {
    return res.status(429).json({ success: false, error: limitCheck.reason });
  }
  next();
};

// ─── Middleware: Input Sanitizer ──────────────────────────────────────

const sanitizeInput = (req, res, next) => {
  if (req.body?.message) {
    req.body.message = req.body.message.trim().substring(0, 4000);
  }
  if (req.body?.prompt) {
    req.body.prompt = req.body.prompt.trim().substring(0, 4000);
  }
  next();
};

// Apply middleware to all routes
router.use(rateLimiter);
router.use(sanitizeInput);

// ─── POST /api/ai/chat — Main Chat Endpoint (Streaming) ────────────────

router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  try {
    const { message, sessionId, promptTemplate = 'general_chat' } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Resolve or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const newSession = await aiService.createSession(userId, message.substring(0, 50));
      currentSessionId = newSession.id;
    }

    // Get session history for context
    const session = await aiService.getSession(currentSessionId, userId);
    if (!session && !sessionId) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Add user message to DB
    await aiService.addMessage(currentSessionId, 'user', message);

    // Build context and prompt
    const context = await aiService.getContext(userId, currentSessionId);
    const messages = aiService.buildPrompt(context, message, promptTemplate);

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullContent = '';

    const llmResult = await aiService.callLLMStreaming(
      messages,
      (chunk) => {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      },
      { model: aiService.DEFAULT_MODEL }
    );

    // Save assistant response
    await aiService.addMessage(currentSessionId, 'assistant', fullContent, {
      model: llmResult.model,
      tokensIn: llmResult.tokensIn,
      tokensOut: llmResult.tokensOut,
    });

    // Track usage
    await aiService.incrementUsage(userId, llmResult.tokensIn, llmResult.tokensOut, llmResult.costUsd);
    await aiService.trackUsage(
      userId, 'chat', message, fullContent,
      llmResult.tokensIn, llmResult.tokensOut,
      llmResult.model, llmResult.latencyMs, llmResult.costUsd
    );

    // Learn from interaction (Phase 2)
    await aiService.learnFromInteraction(userId, message, fullContent);

    // Send completion event
    res.write(`data: ${JSON.stringify({
      type: 'done',
      sessionId: currentSessionId,
      content: fullContent,
      tokensIn: llmResult.tokensIn,
      tokensOut: llmResult.tokensOut,
    })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('AI Chat error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'AI chat failed' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err.message })}\n\n`);
      res.end();
    }
  }
});

// ─── POST /api/ai/query — Natural Language Data Query ──────────────────

router.post('/query', async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const context = await aiService.getContext(userId);
    const messages = aiService.buildPrompt(context, prompt, 'data_query');

    const result = await aiService.callLLM(messages, { maxTokens: 2000, temperature: 0.2 });

    // Track usage
    await aiService.incrementUsage(userId, result.tokensIn, result.tokensOut, result.costUsd);
    await aiService.trackUsage(
      userId, 'query', prompt, result.content,
      result.tokensIn, result.tokensOut, result.model, result.latencyMs, result.costUsd
    );

    // Store as vector for similarity search (skip if pgvector not available)
    try {
      const embedding = await aiService.generateEmbedding(prompt);
      await aiService.storeQueryVector(userId, prompt, embedding, result.content);
    } catch (e) {
      // pgvector may not be installed — silently skip
    }

    res.json({
      success: true,
      data: {
        answer: result.content,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
      }
    });
  } catch (err) {
    console.error('AI Query error:', err.message);
    res.status(500).json({ success: false, error: 'AI query failed' });
  }
});

// ─── POST /api/ai/suggest — AI Suggestion ──────────────────────────────

router.post('/suggest', async (req, res) => {
  try {
    const { context: suggestionContext, entityType, entityId } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;

    const context = await aiService.getContext(userId);

    const prompt = `Given this context about the user's data, provide 2-3 actionable suggestions or insights:

Context: ${JSON.stringify(suggestionContext || context.businessSnapshot)}
Entity Type: ${entityType || 'general'}
Entity ID: ${entityId || 'N/A'}

Format your response as a JSON array:
[{"title": "Suggestion title", "description": "Brief explanation", "priority": "high|medium|low"}]`;

    const messages = [
      { role: 'system', content: 'You are a business intelligence AI. Provide concise, actionable suggestions.' },
      { role: 'user', content: prompt },
    ];

    const result = await aiService.callLLM(messages, { maxTokens: 500, temperature: 0.3 });

    await aiService.trackUsage(
      userId, 'suggest', JSON.stringify(suggestionContext), result.content,
      result.tokensIn, result.tokensOut, result.model, result.latencyMs, result.costUsd
    );

    res.json({
      success: true,
      data: {
        suggestions: result.content,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
      }
    });
  } catch (err) {
    console.error('AI Suggest error:', err.message);
    res.status(500).json({ success: false, error: 'AI suggestion failed' });
  }
});

// ─── GET /api/ai/sessions — List User Sessions ─────────────────────────

router.get('/sessions', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const sessions = await aiService.getSessions(userId);
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('Get sessions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get sessions' });
  }
});

// ─── GET /api/ai/sessions/:id — Get Single Session ─────────────────────

router.get('/sessions/:id', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const session = await aiService.getSession(req.params.id, userId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Get session error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get session' });
  }
});

// ─── DELETE /api/ai/sessions/:id — Delete Session ──────────────────────

router.delete('/sessions/:id', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const session = await aiService.deleteSession(req.params.id, userId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    console.error('Delete session error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete session' });
  }
});

// ─── GET /api/ai/memory — Get User Memory ──────────────────────────────

router.get('/memory', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const { type } = req.query;
    const memories = await aiService.getMemory(userId, type || null);
    res.json({ success: true, data: memories });
  } catch (err) {
    console.error('Get memory error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get memory' });
  }
});

// ─── DELETE /api/ai/memory — Clear Memory ──────────────────────────────

router.delete('/memory', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    await aiService.clearMemory(userId);
    res.json({ success: true, message: 'Memory cleared' });
  } catch (err) {
    console.error('Clear memory error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to clear memory' });
  }
});

// ─── GET /api/ai/usage — Get Usage Stats ───────────────────────────────

router.get('/usage', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const { rows } = await pool.query(
      `SELECT
        COALESCE(SUM(requests_count), 0) as total_requests,
        COALESCE(SUM(tokens_used), 0) as total_tokens,
        COALESCE(SUM(cost_usd), 0) as total_cost,
        MAX(date) as last_used
       FROM ai_rate_limits
       WHERE user_id = $1`,
      [userId]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get usage error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get usage stats' });
  }
});

// ─── POST /api/ai/session — Create New Session ─────────────────────────

router.post('/session', async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;
    const session = await aiService.createSession(userId, title);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('Create session error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
});

// ─── GET /api/ai/profile — Get User AI Profile (Phase 2) ───────────────

router.get('/profile', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const context = await aiService.getContext(userId);

    res.json({
      success: true,
      data: {
        user: context.user,
        permissions: context.permissions,
        behaviorProfile: context.behaviorProfile,
        engagementScore: context.engagementScore,
        preferences: context.preferences,
      }
    });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// ─── POST /api/ai/permission/check — Check Permission (Phase 2) ───────

router.post('/permission/check', async (req, res) => {
  try {
    const { action } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;

    if (!action) {
      return res.status(400).json({ success: false, error: 'Action is required' });
    }

    const context = await aiService.getContext(userId);
    const result = aiService.checkPermissionAndRespond(userId, action, context);

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Permission check error:', err.message);
    res.status(500).json({ success: false, error: 'Permission check failed' });
  }
});

// ─── POST /api/ai/memory/learn — Manual Learn (Phase 2) ───────────────

router.post('/memory/learn', async (req, res) => {
  try {
    const { type, key, value, confidence } = req.body;
    const userId = req.body?.userId || DEMO_USER_ID;

    if (!type || !key || !value) {
      return res.status(400).json({ success: false, error: 'type, key, and value are required' });
    }

    const result = await aiService.saveMemory(userId, type, key, value, confidence || 0.5);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Learn error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to learn' });
  }
});

module.exports = router;
