# 🧠 Master App — AI Layer Implementation Plan

> **Goal:** Build a comprehensive, production-grade AI layer on top of the existing Master App SaaS platform.
>
> **Current Stack:** React 19 (Vite) + Express.js (Node.js) + PostgreSQL (MasterApp DB)
>
> **AI Stack:** OpenAI API + pgvector (PostgreSQL extension) + LangChain.js + Vercel AI SDK

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                     │
│                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ App Pages  │  │ AI Command  │  │ AI Insight Overlays  │  │
│  │ (existing) │  │ Bar (Ctrl+K)│  │ (inline suggestions) │  │
│  └─────┬──────┘  └──────┬──────┘  └──────────┬───────────┘  │
│        │                │                     │              │
│  ┌─────▼────────────────▼─────────────────────▼──────────┐  │
│  │              AI React Hooks (useAI, useAIChat)        │  │
│  │  • useAIChat()     → Streaming chat conversations     │  │
│  │  • useAIQuery()    → Natural language data queries    │  │
│  │  • useAISuggest()  → Inline AI recommendations        │  │
│  │  • useAICommand()  → Command execution & workflows    │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │ axios → /api/ai/*                │
├───────────────────────────┼──────────────────────────────────┤
│                      BACKEND (Express.js)                     │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐   │
│  │              AI Gateway Middleware                     │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  1. Input Validator                           │   │   │
│  │  │     • Sanitize prompt                         │   │   │
│  │  │     • Validate user session                   │   │   │
│  │  │     • Check rate limit & token budget         │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  2. Context Engine                            │   │   │
│  │  │     • Resolve user role & permissions         │   │   │
│  │  │  │  • Select relevant data scope              │   │   │
│  │  │     • Load conversation history               │   │   │
│  │  │     • Retrieve vector-similar past queries    │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  3. Prompt Builder                            │   │   │
│  │  │     • System prompt (role + rules)            │   │   │
│  │  │     • Context injection (data + history)      │   │   │
│  │  │     • Output format (JSON schema)             │   │   │
│  │  │     • Tool definitions (if applicable)        │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  4. LLM Router                                │   │   │
│  │  │     • Route to correct model                  │   │   │
│  │  │     • Handle streaming / non-streaming        │   │   │
│  │  │     • Retry logic + fallback model            │   │   │
│  │  │     • Token counting & cost tracking          │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  5. Response Handler                          │   │   │
│  │  │     • Validate against JSON schema            │   │   │
│  │  │     • Strip/structure response                │   │   │
│  │  │     • Log to ai_conversations table           │   │   │
│  │  │     • Update ai_memory / vector embeddings    │   │   │
│  │  │     • Return to frontend                      │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              AI Context Engine (Service Layer)        │   │
│  │                                                      │   │
│  │  • roleResolver()         → What can this user do?   │   │
│  │  • dataScopeSelector()    → What data can AI see?    │   │
│  │  • permissionFilter()     → Block restricted actions  │   │
│  │  • historyRetriever()     → Load past conversations  │   │
│  │  • similarQueryFinder()   → Vector similarity match  │   │
│  │  • sessionManager()       → Create/continue session  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
├──────────────────────────┬───────────────────────────────────┤
│               PostgreSQL (MasterApp DB)                       │
│                                                                │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│  │ Existing    │ │ AI Tables    │ │ pgvector Extension   │  │
│  │ Tables      │ │ (new)        │ │ (new)                │  │
│  │ • users     │ │ • ai_sessions│ │ • ai_query_vectors   │  │
│  │ • services  │ │ • ai_conversations│ │ • ai_knowledge_vectors│ │
│  │ • analytics │ │ │ • ai_memory      │ │ • ai_document_vectors │ │
│  │ • settings  │ │ │ • ai_rate_limits │ │                    │  │
│  │             │ │ │ • ai_usage_log   │ │                    │  │
│  │             │ │ │ • ai_prompts     │ │                    │  │
│  │             │ │ │ • ai_agents      │ │                    │  │
│  └─────────────┘ └──────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ New Database Tables (Full Schema)

### 1. `ai_sessions`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Unique session ID |
| user_id | INT (FK → users) | Who owns this session |
| title | VARCHAR(200) | Auto-generated session title |
| context | JSONB | Role, permissions, data scope snapshot |
| created_at | TIMESTAMP | Session start |
| updated_at | TIMESTAMP | Last activity |
| is_active | BOOLEAN | Whether session is ongoing |

### 2. `ai_conversations`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Unique message ID |
| session_id | INT (FK → ai_sessions) | Which conversation |
| role | VARCHAR(10) | 'user' or 'assistant' |
| content | TEXT | Message content |
| metadata | JSONB | Tokens used, model, latency, cost |
| created_at | TIMESTAMP | When message was sent |

### 3. `ai_memory`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Unique memory ID |
| user_id | INT (FK → users) | Who this memory belongs to |
| memory_type | VARCHAR(50) | 'preference', 'fact', 'pattern', 'insight' |
| key | VARCHAR(200) | Memory identifier |
| value | TEXT | Memory content |
| confidence | FLOAT (0-1) | How confident AI is in this memory |
| usage_count | INT | How many times referenced |
| created_at | TIMESTAMP | When learned |
| updated_at | TIMESTAMP | Last updated/confirmed |

### 4. `ai_rate_limits`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| user_id | INT (FK → users) | |
| date | DATE | Date of usage |
| requests_count | INT | Number of AI requests today |
| tokens_used | INT | Total tokens consumed |
| cost_usd | DECIMAL(10,4) | Estimated cost |

### 5. `ai_usage_log`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| user_id | INT (FK → users) | |
| feature | VARCHAR(100) | Which AI feature was used |
| prompt | TEXT | The user's input |
| response | TEXT | The AI's output |
| tokens_in | INT | Input tokens |
| tokens_out | INT | Output tokens |
| model | VARCHAR(50) | Which LLM was used |
| latency_ms | INT | Response time |
| cost_usd | DECIMAL(10,4) | Cost of this call |
| created_at | TIMESTAMP | |

### 6. `ai_prompts`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name | VARCHAR(100) | Prompt template name |
| category | VARCHAR(50) | 'crm', 'analytics', 'general', etc. |
| system_prompt | TEXT | System-level instructions |
| user_prompt_template | TEXT | Template with {{placeholders}} |
| model | VARCHAR(50) | Default model to use |
| max_tokens | INT | Token limit |
| temperature | FLOAT | Creativity level |
| output_schema | JSONB | Expected JSON output structure |
| is_active | BOOLEAN | Whether prompt is enabled |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 7. `ai_agents`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| name | VARCHAR(100) | Agent name |
| description | TEXT | What this agent does |
| capabilities | TEXT[] | List of capabilities |
| system_prompt | TEXT | Agent's system instructions |
| tools | JSONB | Available tools/functions |
| is_active | BOOLEAN | Whether agent is enabled |
| created_at | TIMESTAMP | |

### 8. `ai_query_vectors` (pgvector)
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | |
| user_id | INT (FK → users) | |
| query_text | TEXT | Original query |
| embedding | vector(1536) | OpenAI text-embedding-3-small |
| result_summary | TEXT | What the AI found/returned |
| metadata | JSONB | Table queried, filters applied |
| created_at | TIMESTAMP | |

---

## 📦 New Dependencies

### Backend (`backend/package.json`)
```json
{
  "@langchain/openai": "^0.5.0",
  "@langchain/core": "^0.3.0",
  "openai": "^4.82.0",
  "zod": "^3.24.0",
  "tiktoken": "^1.0.0"
}
```

### Frontend (`frontend/package.json`)
```json
{
  "ai": "^4.1.0",
  "@ai-sdk/react": "^1.1.0"
}
```

### PostgreSQL Extension
```sql
CREATE EXTENSION vector;  -- pgvector
```

---

# 📅 Phase-by-Phase Implementation Plan

---

## 🔵 PHASE 1: AI Foundation (The Core Layer)

> **Goal:** Build the AI gateway, context engine, and a working chat interface. Nothing else works without this.
>
> **Estimated Steps:** 12
>
> **Deliverable:** User can open a chat window, ask questions about their data, and get contextual AI responses.

### Step 1.1 — Install AI Dependencies
**Backend:**
```bash
cd backend
npm install @langchain/openai @langchain/core openai zod tiktoken
```
**Frontend:**
```bash
cd frontend
npm install ai @ai-sdk/react
```
**PostgreSQL:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
**Files created/modified:** None (dependencies only)

---

### Step 1.2 — Add `.env` Variables for AI
**File:** `backend/.env` (append)
```env
# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
AI_DEFAULT_MODEL=gpt-4o-mini
AI_EMBEDDING_MODEL=text-embedding-3-small
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.3
AI_RATE_LIMIT_PER_DAY=100
AI_RATE_LIMIT_PER_MINUTE=10
```
**Note:** `gpt-4o-mini` for cost-efficiency during development. Upgrade to `gpt-4o` later.

---

### Step 1.3 — Create AI Database Tables
**File:** `backend/ai-setup.js` (run once)

Creates all 7 tables from the schema above + seed prompt templates.

Also creates the initial `ai_prompts` entries:
- `general_chat` — General purpose AI assistant
- `data_query` — Natural language database queries
- `insight_generator` — Proactive data insights

---

### Step 1.4 — Build AI Service Layer (`backend/services/aiService.js`)
**Single service file** that handles all AI logic:

```
aiService.js
├── createSession(userId)           → Create new AI session
├── getSession(sessionId)           → Get session + history
├── addMessage(sessionId, role, content, metadata) → Log message
├── getContext(userId, sessionId)   → Build AI context object
│   ├── User profile & role
│   ├── Recent conversations
│   ├── Relevant data (based on current page)
│   └── User preferences from ai_memory
├── buildPrompt(context, userInput, promptTemplate) → Assembled prompt
├── callLLM(prompt, options)        → OpenAI API call
├── validateResponse(response, schema) → Zod validation
├── saveMemory(userId, type, key, value, confidence) → Learn from interaction
└── trackUsage(userId, feature, tokensIn, tokensOut, cost, latency) → Log usage
```

---

### Step 1.5 — Build AI Gateway Endpoint (`backend/routes/ai.js`)
**File:** `backend/routes/ai.js`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/chat` | POST | Main chat endpoint (streaming) |
| `/api/ai/sessions` | GET | List user's AI sessions |
| `/api/ai/sessions/:id` | GET | Get a specific session's history |
| `/api/ai/sessions/:id` | DELETE | Delete a session |
| `/api/ai/query` | POST | Natural language data query (JSON response) |
| `/api/ai/suggest` | POST | Get AI suggestion for a specific context |
| `/api/ai/memory` | GET | Get user's AI memory entries |
| `/api/ai/memory` | DELETE | Clear AI memory |
| `/api/ai/usage` | GET | Get user's AI usage stats |

**Middleware included:**
- Rate limiter (per user, per day)
- Input sanitizer
- Context injector
- Response validator

---

### Step 1.6 — Register AI Routes in Server
**File:** `backend/server.js` (add line)
```js
const aiRouter = require('./routes/ai');
app.use('/api/ai', aiRouter);
```

---

### Step 1.7 — Build Frontend AI API Client
**File:** `frontend/src/api/ai.js`

```js
export const aiAPI = {
  chat: (messages, sessionId, streamCallback) => { ... },
  query: (prompt, context) => { ... },
  suggest: (context, entityType, entityId) => { ... },
  getSessions: () => { ... },
  getSession: (id) => { ... },
  deleteSession: (id) => { ... },
  getMemory: () => { ... },
  clearMemory: () => { ... },
  getUsage: () => { ... },
}
```

---

### Step 1.8 — Build React AI Hooks
**File:** `frontend/src/hooks/useAIChat.js`

```js
const { messages, input, setInput, sendMessage, isLoading, sessionId } = useAIChat();
```

**File:** `frontend/src/hooks/useAIQuery.js`

```js
const { result, isLoading, error, executeQuery } = useAIQuery();
```

**File:** `frontend/src/hooks/useAISuggest.js`

```js
const { suggestions, isLoading, fetchSuggestions } = useAISuggest(entityType, entityId);
```

---

### Step 1.9 — Build AI Chat Component
**File:** `frontend/src/components/AIChat/AIChatPanel.jsx`

A slide-in chat panel (right side of screen) with:
- Message list with user/AI avatars
- Streaming text response display
- Session selector (switch between conversations)
- Clear conversation button
- Usage stats indicator

**File:** `frontend/src/components/AIChat/AIMessage.jsx`
Individual message bubble with:
- Avatar (user or AI)
- Markdown rendering for AI responses
- Copy button
- Timestamp
- Token count (dev mode)

---

### Step 1.10 — Build AI Command Bar (Ctrl+K)
**File:** `frontend/src/components/AIChat/CommandBar.jsx`

A `Ctrl+K` / `Cmd+K` overlay that:
- Accepts natural language input
- Detects intent (chat, query, action)
- Routes to appropriate AI endpoint
- Shows inline results
- Keyboard navigation (arrow keys, enter, escape)

---

### Step 1.11 — Add AI Entry Points to Layout
**File:** `frontend/src/App.jsx`

Add to the main layout:
- `Ctrl+K` listener (global)
- Floating AI assistant button (bottom-right corner)
- AI Chat panel toggle

---

### Step 1.12 — Test Phase 1 End-to-End

Verify:
- [ ] `POST /api/ai/chat` returns streaming response
- [ ] Conversation history persists across page reloads
- [ ] AI knows the user's role and adapts responses
- [ ] Rate limiting works (hit limit → get error)
- [ ] Usage is logged in `ai_usage_log`
- [ ] `Ctrl+K` opens command bar
- [ ] AI Chat panel opens and works
- [ ] Sessions can be created/deleted

**Phase 1 is complete when a user can chat with AI and get contextually aware answers about their dashboard.**

---

## 🟢 PHASE 2: Role-Based AI + Multi-Tenant Context

> **Goal:** AI understands who the user is, what they can access, and tailors everything accordingly.
>
> **Estimated Steps:** 6

### Step 2.1 — Enhance Context Engine with Full Role Resolution
**File:** `backend/services/aiService.js` (update `getContext`)

The context object now includes:
```js
{
  user: { id, name, role, company, email },
  permissions: ['read:services', 'write:users', 'read:analytics', ...],
  dataScope: { services: [...], users: [...] },  // What they can see
  currentPage: '/admin/services',                 // Where they are
  recentActivity: [...],                          // What they've done
  preferences: { language, timezone, ... },       // From ai_memory
  conversationHistory: [...],                     // Last 10 messages
}
```

---

### Step 2.2 — Permission-Aware AI Responses
Add a `permissionFilter` layer in the AI response handler.

If user asks "Delete all users" but they don't have `delete:users` permission:
→ AI responds: "You don't have permission to delete users. Contact an admin."

---

### Step 2.3 — Organization Context Switching
Multi-org support: AI switches data scope based on which organization the user is viewing.

**New table:** `ai_org_context`
**New context field:** `currentOrg: { id, name, settings }`

---

### Step 2.4 — User Behavior Profiling
Track what users ask AI most often. Build a profile:
- "This user asks about revenue 40% of the time"
- "This user frequently asks about CRM leads"
- AI proactively surfaces revenue and CRM insights

**File:** `backend/services/aiBehaviorProfiler.js`

---

### Step 2.5 — AI Memory Manager
The AI learns from interactions:
- User says "I prefer weekly reports" → stored in `ai_memory`
- Next time AI generates a report → it's weekly by default

**Endpoint:** `PUT /api/ai/memory/learn`
**Table:** `ai_memory` (already created in Phase 1)

---

### Step 2.6 — AI Engagement Scoring
Score each user's AI engagement:
- Power user (50+ queries/day) → Suggest AI shortcuts
- Low engagement (1-2 queries/day) → AI proactively offers help

**New table:** `ai_engagement_scores`

---

## 🟡 PHASE 3: CRM & Sales Intelligence

> **Goal:** AI becomes a sales co-pilot. Lead scoring, deal prediction, churn warnings, next-best-action.
>
> **Estimated Steps:** 8

### Step 3.1 — Lead Scoring Engine
**Endpoint:** `POST /api/ai/crm/leads/:id/score`

AI analyzes:
- Lead activity history
- Company size/industry
- Interaction frequency
- Deal stage progression
→ Returns score 0-100 + explanation

**File:** `backend/services/crmAI.js → scoreLead(leadData)`

---

### Step 3.2 — Deal Risk Detection
AI monitors pipeline and flags at-risk deals:
- No activity in 14 days
- Communication sentiment turned negative
- Budget concerns mentioned
- Competitor mentioned

**Endpoint:** `GET /api/ai/crm/deals/risk`
Returns: `[{ dealId, riskLevel: 'high'|'medium'|'low', reason, suggestedAction }]`

---

### Step 3.3 — Customer Segmentation AI
AI clusters customers into segments based on:
- Purchase patterns
- Usage frequency
- Revenue contribution
- Engagement level
- Support ticket history

**Endpoint:** `POST /api/ai/crm/customers/segment`

---

### Step 3.4 — Churn Prediction Engine
AI identifies customers likely to leave:
- Declining usage
- Unresolved support tickets
- Negative sentiment in communications
- Contract renewal approaching

**Endpoint:** `GET /api/ai/crm/churn-predictions`
Returns: `[{ customerId, churnProbability: 0.87, reasons, recommendedActions }]`

---

### Step 3.5 — Next Best Action Recommendation
For each lead/customer, AI suggests the next action:
- "Send a follow-up email — last contact was 5 days ago"
- "Schedule a demo — they viewed pricing 3 times"
- "Escalate to manager — deal value is $50K and stalling"

**Endpoint:** `GET /api/ai/crm/leads/:id/next-action`

---

### Step 3.6 — Revenue Forecasting AI
AI predicts:
- Monthly revenue (with confidence range)
- Best-case / worst-case scenarios
- Which deals will close this month
- Revenue by service/category

**Endpoint:** `GET /api/ai/sales/forecast?range=30d`

---

### Step 3.7 — Upsell / Cross-Sell Engine
AI analyzes customer usage and recommends:
- "Customer uses CRM heavily → suggest upgrading to CRM Pro"
- "Customer doesn't use Analytics → suggest onboarding"
- "Customer has 5 users → Team plan would save them 20%"

**Endpoint:** `GET /api/ai/crm/customers/:id/opportunities`

---

### Step 3.8 — CRM AI UI Components
**Files:**
- `frontend/src/components/AIChat/LeadScoreCard.jsx` — Visual score display
- `frontend/src/components/AIChat/DealRiskBadge.jsx` — Risk indicator on deal cards
- `frontend/src/components/AIChat/NextActionBanner.jsx` — "AI suggests: Send follow-up email" inline banner
- `frontend/src/components/AIChat/ForecastChart.jsx` — Revenue forecast visualization

Integrate into:
- Services page → AI suggestions per service
- Users page → AI behavior insights

---

## 🟠 PHASE 4: Natural Language Analytics

> **Goal:** Users ask questions in plain English, get charts and insights back.
>
> **Estimated Steps:** 7

### Step 4.1 — Natural Language to SQL Generator
**Endpoint:** `POST /api/ai/analytics/query`

User types: "Show me revenue trend for the last 6 months"
AI generates: `SELECT month, revenue FROM revenue_data WHERE month >= '2024-03' ORDER BY month`
Frontend renders as a chart.

Uses LangChain SQL chain with safe query validation (read-only, no DROP/DELETE).

---

### Step 4.2 — Auto Dashboard Builder
User types: "Build me a sales dashboard"
AI:
1. Determines relevant tables (services, revenue_data, users)
2. Generates SQL queries
3. Returns dashboard config (chart types, data, titles)
4. Frontend renders the dashboard

**Endpoint:** `POST /api/ai/analytics/dashboard`

---

### Step 4.3 — Insight Generation Engine
AI proactively scans data and finds insights:
- "CRM signups dropped 23% this week compared to last"
- "Revenue is on track to exceed last month by 15%"
- "User activity peaks on Wednesdays"

**Endpoint:** `GET /api/ai/analytics/insights`
Runs on a scheduled interval + on-demand.

---

### Step 4.4 — Anomaly Detection
AI detects unusual patterns:
- Sudden spike/drop in metrics
- Unusual user activity
- Revenue outliers
- Service performance degradation

**Endpoint:** `GET /api/ai/analytics/anomalies`

---

### Step 4.5 — AI Report Generator
User types: "Generate a monthly report for management"
AI creates a structured report with:
- Executive summary
- Key metrics with trends
- Top performers
- Areas of concern
- Recommendations

**Endpoint:** `POST /api/ai/analytics/report`
Returns: `{ title, sections: [{ heading, content, chartData? }] }`

---

### Step 4.6 — Analytics AI UI Components
**Files:**
- `frontend/src/components/AIChat/NLQueryInput.jsx` — Natural language query bar
- `frontend/src/components/AIChat/QueryResultChart.jsx` — Renders chart from query results
- `frontend/src/components/AIChat/InsightCard.jsx` — AI-generated insight cards
- `frontend/src/components/AIChat/ReportViewer.jsx` — Render AI-generated reports

Integrate into Analytics page as an overlay.

---

### Step 4.7 — KPI Recommendation AI
AI suggests which KPIs matter most based on:
- User's role
- Current business context
- Historical patterns
- Industry benchmarks

**Endpoint:** `GET /api/ai/analytics/kpi-recommendations`

---

## 🔴 PHASE 5: Document & Communication AI

> **Goal:** AI helps create, summarize, and analyze documents and communications.
>
> **Estimated Steps:** 6

### Step 5.1 — AI Email/Message Composer
**Endpoint:** `POST /api/ai/communication/compose`

User provides: recipient, context, tone → AI drafts professional message.

---

### Step 5.2 — Document Summarization
**Endpoint:** `POST /api/ai/documents/summarize`

Upload text/PDF → AI returns bullet-point summary.

---

### Step 5.3 — Contract/Invoice Generation
**Endpoint:** `POST /api/ai/documents/generate`

AI fills templates from CRM/Services data:
- Invoice: pulls customer, services, pricing
- Contract: pulls terms, parties, scope

---

### Step 5.4 — Sentiment Analysis Engine
**Endpoint:** `POST /api/ai/communication/sentiment`

Analyzes email threads, customer messages → returns sentiment score + flags negative interactions.

---

### Step 5.5 — Smart Reply Suggestions
**Endpoint:** `POST /api/ai/communication/smart-reply`

Given a message thread → AI suggests 3 reply options.

---

### Step 5.6 — Document Classification AI
AI auto-categorizes uploaded documents:
- Invoice, Contract, Report, Proposal, Receipt
- Extracts key entities (dates, amounts, parties)

---

## 🟣 PHASE 6: Workflow Automation AI

> **Goal:** Users describe automations in natural language, AI builds and runs them.
>
> **Estimated Steps:** 6

### Step 6.1 — Natural Language Workflow Builder
User types: "When a new lead is added, assign it to the sales team and send a welcome email"
AI parses intent, creates workflow config:
```json
{
  "trigger": { "type": "record_created", "entity": "leads" },
  "actions": [
    { "type": "assign", "to": "sales_team" },
    { "type": "send_email", "template": "welcome" }
  ]
}
```

**Endpoint:** `POST /api/ai/workflows/build`

---

### Step 6.2 — Bottleneck Detection AI
AI analyzes workflows and finds inefficiencies:
- "Approval step adds avg 3 days delay"
- "70% of leads don't progress past step 2"
- "Manual data entry between CRM and ERP is redundant"

**Endpoint:** `GET /api/ai/workflows/bottlenecks`

---

### Step 6.3 — Task Auto-Creation
AI creates tasks from:
- Conversation mentions ("I need to follow up with John")
- Email threads
- Meeting notes
- Anomaly detection results

**Endpoint:** `POST /api/ai/tasks/auto-create`

---

### Step 6.4 — Deadline Prediction AI
AI estimates realistic completion dates based on:
- Historical completion times
- Current workload
- Task complexity
- Team availability

---

### Step 6.5 — Process Optimization AI
AI suggests process improvements:
- "Combine steps 3 and 4 to save 2 hours per cycle"
- "Automate data sync between Service A and Service B"
- "Reassign 30% of tasks to reduce bottleneck"

---

### Step 6.6 — Workflow UI Components
**Files:**
- `frontend/src/components/AIChat/WorkflowBuilder.jsx`
- `frontend/src/components/AIChat/WorkflowVisualization.jsx`
- `frontend/src/components/AIChat/TaskCard.jsx`

---

## ⚫ PHASE 7: Security, Search & Advanced AI

> **Goal:** Complete the AI layer with security, semantic search, and multi-agent capabilities.
>
> **Estimated Steps:** 8

### Step 7.1 — Behavioral Anomaly Detection
AI monitors for:
- Unusual login times/locations
- Abnormal data access patterns
- Bulk data downloads
- Privilege escalation attempts

**Endpoint:** `GET /api/ai/security/anomalies`

---

### Step 7.2 — Semantic Search Engine
Replace/augment existing search with vector similarity:
- Search "biggest clients this quarter" → returns relevant user/service records
- Works across all entities (users, services, documents)

**Endpoint:** `GET /api/ai/search?q=...`
Uses `ai_query_vectors` pgvector table.

---

### Step 7.3 — Knowledge Base Chat AI
AI answers questions about company policies, documentation, procedures:
- "What's our refund policy?"
- "How do I onboard a new user?"
- "What are the compliance requirements?"

Requires ingesting documentation into `ai_knowledge_vectors`.

---

### Step 7.4 — Multi-Agent AI System
Introduce specialized AI agents:
- `sales_agent` — Handles CRM/sales queries
- `analytics_agent` — Handles data queries and insights
- `support_agent` — Handles help/FAQ
- `security_agent` — Handles security monitoring

Router determines which agent handles the request.

**Table:** `ai_agents` (already created in Phase 1)

---

### Step 7.5 — Self-Learning System
AI improves over time by:
- Tracking which responses users found helpful
- Learning preferred response formats
- Adjusting tone based on user feedback
- Auto-updating prompt templates

---

### Step 7.6 — AI Collaboration Agents
Multiple AI agents work together:
- Analytics agent finds data → Sales agent interprets → Support agent drafts response

---

### Step 7.7 — Voice-to-Action AI
User speaks → AI transcribes → AI detects intent → AI executes action.
Uses Whisper API for transcription + existing AI pipeline for intent.

---

### Step 7.8 — Decision Support AI
AI helps with complex decisions by:
- Gathering relevant data
- Presenting pros/cons
- Showing historical similar decisions
- Providing confidence scores
- Explaining reasoning

---

## 📊 Phase Summary & Dependencies

```
Phase 1: AI Foundation          ← Start here (required for everything)
    │
    ├── Phase 2: Role-Based AI   ← Builds on Phase 1 context engine
    │
    ├── Phase 3: CRM & Sales     ← Builds on Phase 1 + 2
    │
    ├── Phase 4: Analytics AI    ← Builds on Phase 1 + 2
    │
    ├── Phase 5: Documents AI    ← Builds on Phase 1
    │
    ├── Phase 6: Workflow AI     ← Builds on Phase 1 + 3 + 4
    │
    └── Phase 7: Advanced AI     ← Builds on all previous phases
```

---

## 🚦 Execution Rules

1. **One phase at a time.** Do not start Phase 3 until Phase 2 is complete and tested.
2. **One step at a time.** Each step is a discrete unit of work.
3. **Test after each step.** Verify the endpoint/component works before moving to the next step.
4. **Commit after each step.** Clean git history with step-by-step commits.
5. **Never modify Phase 1 files during later phases.** Phase 1 is the foundation — extend it, don't rewrite it.
6. **Track token costs.** Monitor `ai_usage_log` to ensure AI features are cost-effective.
7. **Always validate AI output.** JSON schema validation on every AI response.
8. **Rate limit everything.** Per-user, per-day limits prevent runaway costs.

---

## 📁 Complete File Map (All Phases)

```
backend/
├── .env                              [Phase 1.2]
├── ai-setup.js                       [Phase 1.3]
├── services/
│   ├── aiService.js                  [Phase 1.4]
│   ├── aiBehaviorProfiler.js         [Phase 2.4]
│   └── crmAI.js                      [Phase 3.1]
├── routes/
│   ├── ai.js                         [Phase 1.5]
│   └── ai-workflows.js               [Phase 6.1]
├── middleware/
│   └── aiRateLimiter.js              [Phase 1.5]
└── server.js                         [Phase 1.6 — modified]

frontend/
├── src/
│   ├── api/
│   │   └── ai.js                     [Phase 1.7]
│   ├── hooks/
│   │   ├── useAIChat.js              [Phase 1.8]
│   │   ├── useAIQuery.js             [Phase 1.8]
│   │   └── useAISuggest.js           [Phase 1.8]
│   ├── components/
│   │   └── AIChat/
│   │       ├── AIChatPanel.jsx       [Phase 1.9]
│   │       ├── AIMessage.jsx         [Phase 1.9]
│   │       ├── CommandBar.jsx        [Phase 1.10]
│   │       ├── LeadScoreCard.jsx     [Phase 3.8]
│   │       ├── DealRiskBadge.jsx     [Phase 3.8]
│   │       ├── NextActionBanner.jsx  [Phase 3.8]
│   │       ├── ForecastChart.jsx     [Phase 3.8]
│   │       ├── NLQueryInput.jsx      [Phase 4.6]
│   │       ├── QueryResultChart.jsx  [Phase 4.6]
│   │       ├── InsightCard.jsx       [Phase 4.6]
│   │       ├── ReportViewer.jsx      [Phase 4.6]
│   │       ├── WorkflowBuilder.jsx   [Phase 6.6]
│   │       ├── WorkflowVisualization.jsx [Phase 6.6]
│   │       └── TaskCard.jsx          [Phase 6.6]
│   └── App.jsx                       [Phase 1.11 — modified]
```

---

## 🎯 Quick Reference: How to Use This Plan

1. **Before starting any phase:** Read the phase description and all steps.
2. **Tell the agent:** "Start Phase X, Step X.Y"
3. **After each step:** Test the feature, verify it works.
4. **When phase is complete:** Run the phase checklist, mark all items done.
5. **Before next phase:** Review dependencies, ensure nothing is missing.

---

*Last updated: April 8, 2026*
*Project: Master App — AI Layer*
*Status: Plan Created — Ready for Phase 1*
