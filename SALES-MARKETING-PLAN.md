# Sales & Marketing CRM/ERP — Master Implementation Plan

## Project Vision

Build a **modular, reusable service architecture** where every feature (Contact Management, Lead Management, Pipeline, etc.) is a self-contained module controlled by SuperAdmin and pluggable into any domain (Sales, Finance, HR, Accounts).

```
┌─────────────────────────────────────┐
│         Super Admin Panel            │
│  "Enable Contact Mgmt for Sales?" ✓ │
│  "Enable Contact Mgmt for HR?"   ✗  │
└─────────────────────────────────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌─────────┐
│ Sales  │   │ Finance │  ← same Contact Mgmt module
│ Module │   │ Module  │     plugged into both
└────────┘   └─────────┘
```

---

## PART A: Project Structure

### Current → Proposed Directory Layout

```
frontend/src/
├── core/                              # ← NEW: Shared across ALL modules
│   ├── components/                    #    Reusable UI primitives
│   │   ├── DataTable/                 #    Sortable, filterable, paginated table
│   │   ├── Modal/                     #    Base modal
│   │   ├── Form/                      #    Form builder components
│   │   ├── SearchBar/
│   │   ├── Tags/
│   │   └── EmptyState/
│   ├── hooks/                         #    useFetch, useDebounce, useLocalStorage
│   ├── context/                       #    (AuthContext, DashboardContext already exist)
│   ├── utils/                         #    formatters, validators, helpers
│   └── api/                           #    Base API client (api/index.js already exists)
│
├── modules/                           # ← NEW: Each service is a self-contained module
│   ├── contact-management/            #    ← Phase 1-2 target
│   │   ├── components/                #       ContactCard, ContactForm, ContactTags
│   │   ├── pages/                     #       ContactListPage, ContactDetailPage
│   │   ├── hooks/                     #       useContacts, useAccounts
│   │   ├── api/                       #       contactAPI.js
│   │   ├── utils/                     #       contactHelpers.js, validators.js
│   │   └── index.js                   #       Public exports (what other modules import)
│   │
│   ├── lead-management/               #    ← Phase 4
│   ├── pipeline-management/           #    ← Phase 5
│   ├── sales-execution/               #    ← Phase 6
│   ├── marketing-automation/          #    ← Phase 7
│   ├── digital-marketing/             #    ← Phase 8
│   ├── analytics-reporting/           #    ← Phase 9
│   ├── ai-automation/                 #    ← Phase 10
│   ├── customer-experience/           #    ← Phase 11
│   └── erp-extensions/                #    ← Phase 12
│
├── dashboard/                         #    Already exists — stays here
│   ├── pages/
│   ├── components/
│   ├── utils/
│   └── context/
│
├── pages/                             #    Auth pages (Login, Signup, Onboarding) — stays
├── components/                        #    Layout components (LauncherGrid, etc.)
├── context/                           #    AuthContext, DashboardContext
└── App.jsx                            #    Route definitions (imports from modules/)

backend/
├── routes/
│   ├── modules/                       # ← NEW: Module-specific route files
│   │   ├── contacts.js                #    Contact Management API
│   │   ├── leads.js
│   │   ├── pipelines.js
│   │   └── ...
│   ├── auth.js
│   └── ai.js
│
├── services/
│   ├── modules/                       # ← NEW: Module-specific service/business logic
│   │   ├── contactService.js
│   │   ├── leadService.js
│   │   └── ...
│   ├── authService.js
│   └── aiService.js
│
├── middleware/
│   ├── auth.js                        #    Already exists
│   └── moduleAuth.js                  # ← NEW: Per-module permission/enablement checks
│
└── db.js
```

### Standard Module Shape (Every Module Follows This)

```
module/
├── api/           # API client functions (fetch, create, update, delete)
├── components/    # Reusable UI within the module (forms, cards, lists)
├── hooks/         # Data fetching, state management hooks
├── pages/         # Route-level page components
├── utils/         # Helpers, formatters, validators
└── index.js       # Public API — what other modules import from
```

---

## PART B: Developer Workflow (2 Devs, Zero Conflicts)

### File Ownership Rules

| Dev 1 (Backend) Owns | Dev 2 (Frontend) Owns |
|----------------------|----------------------|
| `backend/routes/modules/*.js` | `frontend/src/modules/*/` (all files) |
| `backend/services/modules/*.js` | `frontend/src/core/components/` |
| `backend/middleware/moduleAuth.js` | `frontend/src/core/hooks/` |
| Database schema changes | Routing in `App.jsx` |

**Rule:** Backend dev touches `backend/` only. Frontend dev touches `frontend/` only. They meet at the API contract (defined in `api/index.js` and route files).

### Module Development Flow

1. Backend dev creates DB schema + CRUD API
2. Frontend dev creates API client (`api/xxxAPI.js`) from the route definitions
3. Both work in parallel on their module folder — no file overlap
4. Wire routes in `App.jsx` together
5. Test end-to-end

---

## PART C: Implementation Phases

---

### Phase 1: Contact Management — Foundation
**Estimated: Week 1-2** | **Status: NOT STARTED**

**Goal:** A working, reusable contact management module that Sales can use immediately.

| Step | Task | Location | Dev |
|------|------|----------|-----|
| 1.1 | Database schema: `contacts`, `accounts`, `contact_tags`, `contact_custom_fields`, `contact_relationships` | `backend/setup.js` or migration | Dev 1 |
| 1.2 | CRUD API: Create, Read, Update, Delete contacts | `backend/routes/modules/contacts.js` | Dev 1 |
| 1.3 | Contact search, filter, pagination API | Same file | Dev 1 |
| 1.4 | API client: `contactAPI.js` (create, list, update, delete, search) | `frontend/src/modules/contact-management/api/` | Dev 2 |
| 1.5 | Contact List Page (DataTable with search, filter, pagination) | `frontend/src/modules/contact-management/pages/ContactListPage.jsx` | Dev 2 |
| 1.6 | Contact Create/Edit Form (modal or page) | `frontend/src/modules/contact-management/components/ContactForm.jsx` | Dev 2 |
| 1.7 | Contact Detail View (360° view placeholder — empty tabs for future phases) | `frontend/src/modules/contact-management/pages/ContactDetailPage.jsx` | Dev 2 |
| 1.8 | Wire routes: `/sales/contacts` → ContactListPage, `/sales/contacts/:id` → Detail | `frontend/src/App.jsx` | Either |

**Deliverable:** Super admin enables Contact Management for Sales → Sales user sees `/sales/contacts` with full CRUD.

**Database Schema (Draft):**
```sql
-- Accounts (companies/organizations)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(255),
  phone VARCHAR(50),
  billing_address TEXT,
  shipping_address TEXT,
  annual_revenue DECIMAL(15,2),
  employee_count INTEGER,
  owner_id UUID REFERENCES users(id),
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (people)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  account_id UUID REFERENCES accounts(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  title VARCHAR(150),
  department VARCHAR(100),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  owner_id UUID REFERENCES users(id),
  source VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  avatar_url TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ
);

-- Contact Tags
CREATE TABLE contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);
CREATE INDEX idx_contact_tags_contact ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag ON contact_tags(tag);

-- Contact Custom Fields Definition (per org)
CREATE TABLE contact_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  field_key VARCHAR(100) NOT NULL,
  field_label VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(org_id, field_key)
);

-- Contact Relationships (link contacts to each other)
CREATE TABLE contact_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  from_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  to_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_contact_id, to_contact_id, relationship_type)
);

-- Activity Timeline (placeholder for future phases)
CREATE TABLE contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type VARCHAR(100),  -- 'call', 'email', 'meeting', 'note', 'task'
  subject VARCHAR(255),
  description TEXT,
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
CREATE INDEX idx_activities_contact ON contact_activities(contact_id);
```

---

### Phase 2: Contact Management — Advanced Features
**Estimated: Week 2-3** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 2.1 | Bulk operations: bulk delete, bulk tag, bulk export/import CSV | Backend + Frontend |
| 2.2 | Custom fields: create/manage custom fields per org, render dynamically in forms | Backend + Frontend |
| 2.3 | Duplicate detection & merge UI (match on email, phone, name) | Backend + Frontend |
| 2.4 | Contact relationships UI (link, unlink, view related) | Frontend |
| 2.5 | Import contacts from CSV/Excel (column mapping, preview, error handling) | Backend + Frontend |
| 2.6 | Activity timeline on Contact Detail (call logs, email logs, notes — placeholder data) | Frontend |
| 2.7 | Contact Management as embeddable widget (for dashboards) | Frontend |

**Deliverable:** Contact Management is a mature, self-contained module with all core features.

---

### Phase 3: Module Registration System (SuperAdmin Toggle)
**Estimated: Week 3** | **Status: NOT STARTED**

**Goal:** Make Contact Management (and future modules) truly toggle-able by SuperAdmin.

| Step | Task | Location | Dev |
|------|------|----------|-----|
| 3.1 | Extend `service_catalog` with `module_key` (e.g., `contact_management`) | Backend | Dev 1 |
| 3.2 | `org_service_modules` table: tracks which modules are enabled per org | Backend | Dev 1 |
| 3.3 | SuperAdmin UI: toggle modules on/off per org | Frontend | Dev 2 |
| 3.4 | Middleware: block API calls if module not enabled for org | `backend/middleware/moduleAuth.js` | Dev 1 |
| 3.5 | Frontend: hide/show module nav items based on enabled modules | `frontend/src/context/ModuleContext.jsx` | Dev 2 |
| 3.6 | Contact Management `index.js` exports everything needed for other modules to import | `frontend/src/modules/contact-management/index.js` | Dev 2 |

**Database:**
```sql
CREATE TABLE org_service_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  service_id UUID REFERENCES service_catalog(id),
  module_key VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, service_id, module_key)
);
```

**Deliverable:** SuperAdmin can enable/disable Contact Management per org. Module is truly reusable.

---

### Phase 4: Lead Management
**Estimated: Week 4-5** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 4.1 | Database: `leads`, `lead_sources`, `lead_assignments` | Leads extend contacts (foreign key to contacts) |
| 4.2 | CRUD API + Lead-specific endpoints (assign, score, qualify, convert) | Backend |
| 4.3 | Lead list page, detail page, create/edit form | Frontend — reuses ContactForm from Phase 1 |
| 4.4 | Lead scoring (manual rules: source, activity, fit) | Backend + Frontend |
| 4.5 | Lead assignment (auto round-robin, manual, rule-based) | Backend |
| 4.6 | Lead import tools (CSV/Excel) | Backend + Frontend |
| 4.7 | MQL/SQL classification + status workflows | Backend |
| 4.8 | Lead routing rules (by territory, product, round-robin) | Backend |
| 4.9 | Lead nurturing workflows (trigger-based status changes) | Backend |

**Key Design Decision:** A Lead **is a Contact** with additional lead-specific fields. `leads` table has `contact_id` FK. Lead UI **imports** ContactForm:
```jsx
import { ContactForm } from '../../contact-management';
// Extend with lead-specific fields
```

---

### Phase 5: Pipeline & Opportunity Management
**Estimated: Week 5-6** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 5.1 | Database: `pipelines`, `pipeline_stages`, `deals`, `deal_stage_history` | |
| 5.2 | Kanban board UI (drag deals between stages) | Frontend — `@dnd-kit` or `react-beautiful-dnd` |
| 5.3 | Deal CRUD + stage transitions with history tracking | Backend |
| 5.4 | Pipeline visualization (funnel chart, stage counts) | Frontend |
| 5.5 | Forecasting (basic: deal value × stage probability) | Backend |
| 5.6 | Multi-pipeline support (different pipelines per team/product) | Backend |
| 5.7 | Pipeline velocity tracking (avg days per stage) | Backend + Frontend |
| 5.8 | Deal alerts & reminders | Backend (scheduled jobs) |
| 5.9 | Sales goals/quota tracking | Backend + Frontend |
| 5.10 | Territory-based pipelines | Backend |

---

### Phase 6: Sales Execution Tools
**Estimated: Week 6-7** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 6.1 | Task & activity management (CRUD, assign, due dates) | Backend + Frontend |
| 6.2 | Meeting scheduling (calendar integration placeholder) | Frontend |
| 6.3 | Email integration (Gmail/Outlook sync — placeholder) | Backend schema + Frontend |
| 6.4 | Call tracking & logging (manual entry) | Frontend |
| 6.5 | Sales cadences/sequences (multi-step outreach) | Backend + Frontend |
| 6.6 | Sales scripts/templates library | Frontend |
| 6.7 | Proposal generation (template-based) | Backend + Frontend |
| 6.8 | Quote management (CPQ – Configure Price Quote) | Backend + Frontend |
| 6.9 | Contract lifecycle management | Backend + Frontend |
| 6.10 | E-signature integration (placeholder) | Frontend |

---

### Phase 7: Marketing Automation
**Estimated: Week 7-8** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 7.1 | Email marketing campaigns (create, schedule, send) | Backend + Frontend |
| 7.2 | Drip campaigns (multi-step automated sequences) | Backend |
| 7.3 | Marketing workflows (automation rules engine) | Backend |
| 7.4 | Campaign segmentation (audience builder) | Frontend |
| 7.5 | Personalization engines (dynamic content) | Backend |
| 7.6 | Trigger-based marketing (event → action) | Backend |
| 7.7 | Multi-channel campaigns (email, SMS, social) | Backend + Frontend |
| 7.8 | Campaign performance tracking (opens, clicks, conversions) | Backend + Frontend |
| 7.9 | A/B testing framework | Backend + Frontend |
| 7.10 | Marketing calendar (visual campaign timeline) | Frontend |

---

### Phase 8: Digital Marketing & Content
**Estimated: Week 8-9** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 8.1 | Social media integration (posting & tracking) | Backend + Frontend |
| 8.2 | Ad campaign integration (Google/Facebook Ads — placeholder) | Frontend |
| 8.3 | SEO tools integration | Frontend |
| 8.4 | Website tracking (visitor tracking → contact matching) | Backend |
| 8.5 | Landing page builder (drag-and-drop) | Frontend |
| 8.6 | Form builders (embeddable forms) | Frontend |
| 8.7 | Chatbots & live chat (placeholder — connects to existing AI chat) | Frontend |
| 8.8 | Retargeting tools + cookie tracking + consent | Backend |
| 8.9 | UTM tracking & attribution | Backend + Frontend |
| 8.10 | Content library (images, docs, videos) | Backend + Frontend |
| 8.11 | Email templates + sales collateral management | Frontend |
| 8.12 | Document sharing & tracking | Backend + Frontend |
| 8.13 | Content performance analytics | Frontend |
| 8.14 | Version control + brand asset management | Backend + Frontend |
| 8.15 | Knowledge base + CMS | Backend + Frontend |
| 8.16 | AI content suggestions (connect to existing AI) | Backend + Frontend |

---

### Phase 9: Analytics & Reporting
**Estimated: Week 9-10** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 9.1 | Sales dashboards (revenue, pipeline, activity) | Frontend — dashboard widgets |
| 9.2 | Marketing dashboards (campaigns, ROI, channels) | Frontend |
| 9.3 | Custom report builder (drag-and-drop report designer) | Frontend |
| 9.4 | Funnel analytics (lead → contact → deal → customer) | Backend + Frontend |
| 9.5 | Conversion tracking (stage-by-stage) | Backend + Frontend |
| 9.6 | ROI tracking (campaign cost → revenue) | Backend + Frontend |
| 9.7 | Attribution modeling (multi-touch) | Backend |
| 9.8 | Cohort analysis | Backend + Frontend |
| 9.9 | Predictive analytics (AI insights — connect Phase 10) | Backend |
| 9.10 | Data visualization tools (charts, graphs, export) | Frontend |

---

### Phase 10: AI & Automation Layer
**Estimated: Week 10-12** | **Status: NOT STARTED**

**This is where existing AI infrastructure (Phase 1-2 from AI-LAYER-PLAN.md) connects to Sales data.**

| Step | Task | Notes |
|------|------|-------|
| 10.1 | Predictive lead scoring (AI model using contact + activity data) | Uses `aiService.js` |
| 10.2 | Sales forecasting (AI-driven trend analysis) | Uses `aiService.js` |
| 10.3 | Next-best-action recommendations | Uses `aiService.js` |
| 10.4 | Email writing assistance (AI compose) | Uses existing AI chat |
| 10.5 | Workflow automation (no-code rule builder) | Backend + Frontend |
| 10.6 | Customer sentiment analysis (from emails, calls) | Backend |
| 10.7 | Voice assistants (AI call summaries) | Backend |
| 10.8 | Intelligent alerts (anomaly detection, threshold triggers) | Backend |
| 10.9 | Data anomaly detection (outlier identification) | Backend |
| 10.10 | AI-powered search across all modules | Backend + Frontend |

---

### Phase 11: Customer Experience & Retention
**Estimated: Week 12-13** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 11.1 | Customer onboarding workflows (step-by-step setup) | Backend + Frontend |
| 11.2 | Customer support/ticketing system | Backend + Frontend |
| 11.3 | SLA tracking (response time, resolution time) | Backend |
| 11.4 | Customer feedback collection (NPS, surveys) | Frontend |
| 11.5 | Loyalty program management | Backend + Frontend |
| 11.6 | Renewal management (auto-alerts, tracking) | Backend |
| 11.7 | Upsell/cross-sell recommendations (AI-assisted) | Backend + Frontend |
| 11.8 | Customer health scoring (composite metric) | Backend |
| 11.9 | Omnichannel support (chat, email, phone) | Frontend |
| 11.10 | Self-service portals | Frontend |

---

### Phase 12: ERP Extensions & Integrations
**Estimated: Week 13-14** | **Status: NOT STARTED**

| Step | Task | Notes |
|------|------|-------|
| 12.1 | Order management (create, track, fulfill) | Backend + Frontend |
| 12.2 | Inventory integration with sales (stock checks, reservations) | Backend |
| 12.3 | Pricing & discount rules engine | Backend |
| 12.4 | Supply-demand alignment | Backend |
| 12.5 | Billing & invoicing | Backend + Frontend |
| 12.6 | Revenue recognition (ASC 606 compliance) | Backend |
| 12.7 | Subscription billing (recurring, proration) | Backend |
| 12.8 | Channel/partner management | Backend + Frontend |
| 12.9 | Procurement-sales linkage | Backend |
| 12.10 | Financial reporting integration | Frontend |
| 12.11 | API marketplace for third-party integrations | Backend + Frontend |
| 12.12 | Mobile CRM apps (React Native or PWA) | Separate project |

---

## Key Design Decisions (Day 1 Rules)

### 1. Every Module is a Package
```js
// modules/contact-management/index.js
export { default as ContactListPage } from './pages/ContactListPage';
export { default as ContactDetailPage } from './pages/ContactDetailPage';
export { default as ContactForm } from './components/ContactForm';
export { default as ContactCard } from './components/ContactCard';
export { contactAPI } from './api/contactAPI';
export { useContacts } from './hooks/useContacts';
export { formatContact, validateContact } from './utils/contactHelpers';
```

Other modules import from it:
```js
import { ContactForm, useContacts } from '../../contact-management';
```

### 2. Modules Don't Own Routing
Routes are defined in `App.jsx`. Modules export page components.
```jsx
// App.jsx
import { ContactListPage, ContactDetailPage } from './modules/contact-management';
import { LeadListPage } from './modules/lead-management';

<Route path="/sales/contacts" element={<ProtectedRoute><ContactListPage /></ProtectedRoute>} />
<Route path="/sales/contacts/:id" element={<ProtectedRoute><ContactDetailPage /></ProtectedRoute>} />
```

### 3. Modules Share Core Components
`core/components/` contains primitives. Modules use them. Don't rebuild.
```
core/components/DataTable/    → Used by Contact List, Lead List, Deal List
core/components/Modal/        → Used by Contact Form, Lead Form, etc.
core/components/SearchBar/    → Used everywhere
```

### 4. SuperAdmin Controls via `org_service_modules`
Single table: `{ org_id, service_id, module_key, is_enabled }`
- Middleware blocks API calls if module not enabled
- Frontend hides nav items for disabled modules

### 5. Leads Extend Contacts (Not Separate)
A Lead **is a Contact** with additional fields:
```sql
leads (
  id UUID PK,
  contact_id UUID REFERENCES contacts(id),  -- One-to-one
  lead_source VARCHAR(100),
  lead_status VARCHAR(50),
  lead_score INTEGER,
  mql_date TIMESTAMPTZ,
  sql_date TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_contact_id UUID REFERENCES contacts(id)
)
```

### 6. API Contract Convention
Every module API client follows the same pattern:
```js
// api/contactAPI.js
export const contactAPI = {
  list: (params) => api.get('/contacts', { params }),
  get: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  search: (query) => api.get('/contacts/search', { params: { q: query } }),
  bulkCreate: (data) => api.post('/contacts/bulk', data),
  bulkDelete: (ids) => api.delete('/contacts/bulk', { data: { ids } }),
  import: (file) => api.post('/contacts/import', file),
  export: (params) => api.get('/contacts/export', { params }),
};
```

---

## Phase Dependency Graph

```
Phase 1: Contact Management  ─────────────────────────────┐
Phase 2: Contact Advanced     ─────────────────────────────┤  Foundation
Phase 3: Module Registration  ─────────────────────────────┘
       │
Phase 4: Lead Management      ─────────────────────────────┐
Phase 5: Pipeline Management  ─────────────────────────────┤  Sales Core
Phase 6: Sales Execution      ─────────────────────────────┘
       │
Phase 7: Marketing Automation ─────────────────────────────┐
Phase 8: Digital Marketing    ─────────────────────────────┤  Marketing
       │                                                    │
Phase 9: Analytics            ─────────────────────────────┤  Reporting
       │                                                    │
Phase 10: AI Layer            ─────────────────────────────┤  Intelligence
       │                                                    │  (Connects to
Phase 11: Customer Exp        ─────────────────────────────┤   existing AI infra)
       │                                                    │
Phase 12: ERP Extensions      ─────────────────────────────┘  Enterprise
```

---

## Current Status Tracker

| Phase | Name | Status | Started | Completed | Notes |
|-------|------|--------|---------|-----------|-------|
| 1 | Contact Management — Foundation | 🔴 NOT STARTED | | | Next to build |
| 2 | Contact Management — Advanced | 🔴 NOT STARTED | | | Depends on Phase 1 |
| 3 | Module Registration System | 🔴 NOT STARTED | | | Depends on Phase 1 |
| 4 | Lead Management | 🔴 NOT STARTED | | | Depends on Phase 1 |
| 5 | Pipeline Management | 🔴 NOT STARTED | | | Depends on Phase 4 |
| 6 | Sales Execution | 🔴 NOT STARTED | | | Depends on Phase 5 |
| 7 | Marketing Automation | 🔴 NOT STARTED | | | Depends on Phase 4 |
| 8 | Digital Marketing & Content | 🔴 NOT STARTED | | | Depends on Phase 7 |
| 9 | Analytics & Reporting | 🔴 NOT STARTED | | | Depends on Phase 4-8 |
| 10 | AI & Automation | 🔴 NOT STARTED | | | Depends on Phase 4-9 + AI Phase 1-2 |
| 11 | Customer Experience | 🔴 NOT STARTED | | | Depends on Phase 4-6 |
| 12 | ERP Extensions | 🔴 NOT STARTED | | | Depends on Phase 5-6 |

---

## Getting Started: Next Immediate Steps

### Step 1: Create Folder Structure (5 min)
```bash
# Frontend
mkdir -p frontend/src/core/components
mkdir -p frontend/src/core/hooks
mkdir -p frontend/src/core/utils
mkdir -p frontend/src/modules/contact-management/{components,pages,hooks,api,utils}

# Backend
mkdir -p backend/routes/modules
mkdir -p backend/services/modules
mkdir -p backend/middleware
```

### Step 2: Run Database Schema (Dev 1)
Execute the SQL from Phase 1 against the PostgreSQL database.

### Step 3: Build Contact CRUD API (Dev 1)
Create `backend/routes/modules/contacts.js` + `backend/services/modules/contactService.js`

### Step 4: Build Contact UI (Dev 2)
Create `frontend/src/modules/contact-management/` — list, form, detail views.

### Step 5: Wire Routes & Test (Both)
Add routes to `App.jsx`, test end-to-end.

---

## Notes & Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2025-04-13 | Use modular architecture instead of monolith | 2 devs working, need zero-conflict workflow |
| 2025-04-13 | Contact Management built first, reused by all modules | Foundation data layer for everything |
| 2025-04-13 | Leads extend contacts (not separate table) | Single source of truth for person data |
| 2025-04-13 | Modules don't own routing | Centralized route control, module-level lazy loading possible |
| 2025-04-13 | AI Phase 3 deferred until dashboard stabilized + data exists | Need real CRM data before AI predictions make sense |
| 2025-04-13 | SuperAdminDashboard removed from routing | Unified DashboardBuilder for all roles |
