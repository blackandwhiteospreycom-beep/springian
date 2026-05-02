# Sales & Marketing Module - Toggle System Implementation Guide

## Overview

The Sales & Marketing module features a **hierarchical toggle system** that allows granular control over module and feature access. This guide explains the architecture, components, and how to integrate with the toggle system.

---

## Architecture

### Toggle Hierarchy

```
Sales & Marketing (Section/Module Level)
├── Core CRM Data Layer
│   ├── Contact Management (Feature Level)
│   ├── Account Management
│   ├── Lead Database
│   └── ... (10 features total)
├── Lead Management System
│   ├── Lead Capture Forms
│   ├── Lead Assignment
│   └── ... (10 features)
├── Pipeline & Opportunity Management
├── Sales Execution Tools
├── Marketing Automation
├── ... (12 sections total, 120 features)
```

**3-Level Toggle System:**
1. **Section Toggle** - Controls entire module (e.g., Core CRM)
2. **Feature Toggle** - Controls individual features within a section
3. **Tool Toggle** (future) - Controls sub-features within a feature

---

## Core Components

### 1. `SMContext.jsx` - State Management
**Location:** `modules/sales-marketing/context/SMContext.jsx`

**What it does:**
- Centralized toggle state (stored in localStorage)
- Provides toggle/check APIs for sections and features
- Event bus for toast notifications
- Backwards compatibility aliases

**API:**
```javascript
import { useSM } from './modules/sales-marketing/context/SMContext';

function MyComponent() {
  const {
    isSectionEnabled,      // (sectionId) => boolean
    isFeatureEnabled,      // (sectionId, featureId) => boolean
    toggleSection,         // (sectionId) => void
    toggleFeature,         // (sectionId, featureId) => void
    setSection,            // (sectionId, enabled) => void
    setFeature,            // (sectionId, featureId, enabled) => void
    enabledSectionCount,   // () => number
    enabledFeatureCount,   // (sectionId, totalFeatures) => number
  } = useSM();
}
```

**State Shape:**
```javascript
{
  sectionEnabled: {
    'core-crm': true,
    'lead-management': false,
    // ...
  },
  featureEnabled: {
    'core-crm': {
      'contacts': true,
      'accounts': false,
      // ...
    },
    // ...
  }
}
```

---

### 2. `SMModuleGuard.jsx` - Access Control Gate
**Location:** `modules/sales-marketing/components/SMModuleGuard.jsx`

**What it does:**
- Wraps protected routes/components
- Checks section AND feature-level toggles
- Shows disabled state with actionable messaging

**Usage:**
```javascript
import { SMModuleGuard } from './modules/sales-marketing/components';

<Route path="/sm/core-crm/contacts" element={
  <ProtectedRoute>
    <SMModuleGuard sectionId="core-crm" featureId="contacts">
      <ContactManagementPage />
    </SMModuleGuard>
  </ProtectedRoute>
} />
```

**Props:**
- `sectionId` (required) - Section/module ID to check
- `featureId` (optional) - Feature ID to check
- `children` - Content to render when enabled
- `fallback` (optional) - Custom fallback UI when disabled
- `backRoute` (optional) - Back navigation route (default: `/dashboard`)
- `settingsRoute` (optional) - Settings page route (default: `/dashboard/sales-marketing`)

---

### 3. `SMFeatureCard.jsx` - Reusable Feature Card
**Location:** `modules/sales-marketing/components/SMFeatureCard.jsx`

**What it does:**
- Card-based UI for displaying features with toggle
- Handles click navigation to feature route
- Shows "Under Maintenance" overlay when disabled
- Status badges (Active/Disabled)

**Usage:**
```javascript
import { SMFeatureCard } from './modules/sales-marketing/components';

<SMFeatureCard 
  feature={{ 
    id: 'contacts', 
    label: 'Contact Management',
    route: '/sm/core-crm/contacts',
    description: 'Manage your contacts', // optional
    icon: <Icon />, // optional
  }}
  sectionId="core-crm"
/>
```

---

### 4. `SMDisabledState.jsx` - Disabled/Maintenance UI
**Location:** `modules/sales-marketing/components/SMDisabledState.jsx`

**What it does:**
- Consistent disabled state across all pages
- Supports 4 levels: `section`, `feature`, `tool`, `page`
- Auto-generates title/message based on level
- Provides navigation to settings or dashboard

**Usage:**
```javascript
import { SMDisabledState } from './modules/sales-marketing/components';

// Full page disabled state
<SMDisabledState 
  level="section" 
  name="Core CRM" 
/>

// Compact inline state (for cards/panels)
<SMDisabledState 
  level="feature" 
  name="Contact Management" 
  compact 
/>
```

---

### 5. `SMMToastProvider.jsx` - Toast Notification System
**Location:** `modules/sales-marketing/components/SMMToastProvider.jsx`

**What it does:**
- Centralized toast system for toggle feedback
- Supports 4 types: `info`, `success`, `warning`, `error`
- Auto-dismiss after duration (default: 2500ms)

**Usage:**
```javascript
import { SMMToastProvider, useSMMToast } from './modules/sales-marketing/components';

// Wrap your app
<SMMToastProvider>
  <App />
</SMMToastProvider>

// Use in components
function MyComponent() {
  const { showToast } = useSMMToast();
  
  showToast('Feature enabled!', 'success');
  showToast('Feature disabled', 'warning');
}
```

**Note:** SMContext already integrates with the toast event bus, so toggles automatically show toasts.

---

### 6. `useSMWidget.js` - Widget Integration Hook
**Location:** `modules/sales-marketing/hooks/useSMWidget.js`

**What it does:**
- Allows dashboard widgets to check toggle states
- Real-time reaction to toggle changes
- Status reporting for widget UI

**Usage:**
```javascript
import { useSMWidget } from './modules/sales-marketing/hooks';

function ContactWidget() {
  const { isEnabled, status } = useSMWidget({
    sectionId: 'core-crm',
    featureId: 'contacts',
  });
  
  if (!isEnabled) {
    return <DisabledWidget message={status.message} />;
  }
  
  return <ActiveWidget />;
}

// Or check multiple widgets at once
import { useSMWidgetList } from './modules/sales-marketing/hooks';

function WidgetGrid() {
  const widgets = useSMWidgetList([
    { sectionId: 'core-crm', featureId: 'contacts', label: 'Contacts' },
    { sectionId: 'lead-management', label: 'Leads' },
  ]);
  
  return (
    <div>
      {widgets.map(w => (
        <WidgetCard key={w.sectionId} widget={w} enabled={w.enabled} />
      ))}
    </div>
  );
}
```

---

## Routing Setup

All Sales & Marketing routes should be wrapped with `SMModuleGuard`:

```javascript
// App.jsx
import { SMModuleGuard } from './modules/sales-marketing/components';
import SMContactManagement from './modules/sales-marketing/core-crm/pages/ContactManagementPage';

<Routes>
  {/* Settings Page (no guard needed) */}
  <Route path="/dashboard/sales-marketing" element={
    <ProtectedRoute><SalesMarketingPage /></ProtectedRoute>
  } />
  
  {/* Feature Pages (guarded) */}
  <Route path="/sm/core-crm/contacts" element={
    <ProtectedRoute>
      <SMModuleGuard sectionId="core-crm" featureId="contacts">
        <SMContactManagement />
      </SMModuleGuard>
    </ProtectedRoute>
  } />
  
  {/* Add more routes following the same pattern */}
</Routes>
```

---

## Adding New Features

### Step 1: Define in `SM_MODULES` array
In `SalesMarketingPage.jsx`, add your feature to the appropriate section:

```javascript
{
  id: 'core-crm',
  name: 'Core CRM Data Layer',
  // ...
  features: [
    // ... existing features
    { 
      id: 'my-new-feature', 
      label: 'My New Feature', 
      route: '/sm/core-crm/my-new-feature',
      description: 'What this feature does', // optional
    },
  ],
}
```

### Step 2: Create the feature page
```
modules/sales-marketing/core-crm/
  pages/
    MyNewFeaturePage.jsx
  hooks/
    useMyNewFeature.js
  components/
    ...
```

### Step 3: Add route with guard
```javascript
<Route path="/sm/core-crm/my-new-feature" element={
  <ProtectedRoute>
    <SMModuleGuard sectionId="core-crm" featureId="my-new-feature">
      <MyNewFeaturePage />
    </SMModuleGuard>
  </ProtectedRoute>
} />
```

---

## UI Behavior

### Section Toggle = OFF
- Entire section card shows disabled overlay
- "This module is currently disabled" message
- "Enable Module" button to re-enable
- All features within are inaccessible

### Feature Toggle = OFF
- Feature card shows "Under Maintenance" overlay
- Greyed out with lock icon
- Not clickable
- Badge: "Disabled"

### Feature Toggle = ON
- Fully functional
- Clickable card with hover effects
- Badge: "Active"
- "Open →" arrow on hover

---

## State Persistence

All toggle states are stored in **localStorage** under the key:
```
sm_service_toggles_v2
```

This means:
- ✅ Persists across page reloads
- ✅ Per-browser (not synced across devices)
- ❌ Not synced to server (yet)
- ❌ Not per-user or per-organization (yet)

**Future Enhancement:** Server-side sync can be added by:
1. Creating API endpoints: `GET /api/sm/toggles` and `POST /api/sm/toggles`
2. Updating `SMContext` to fetch/save toggle state
3. Using localStorage as optimistic cache

---

## Files Created/Modified

### New Files:
- `modules/sales-marketing/components/SMFeatureCard.jsx` - Reusable feature card
- `modules/sales-marketing/components/SMDisabledState.jsx` - Disabled state component
- `modules/sales-marketing/components/SMMToastProvider.jsx` - Toast system
- `modules/sales-marketing/components/index.js` - Barrel exports
- `modules/sales-marketing/hooks/useSMWidget.js` - Widget integration hook
- `modules/sales-marketing/hooks/index.js` - Hook exports

### Modified Files:
- `modules/sales-marketing/components/SMModuleGuard.jsx` - Added feature-level support
- `modules/sales-marketing/context/SMContext.jsx` - Added toast event bus
- `dashboard/pages/SalesMarketingPage.jsx` - Improved disabled UI
- `App.jsx` - Added SMModuleGuard to routes

---

## Testing Checklist

- [ ] Navigate to `/dashboard/sales-marketing`
- [ ] Toggle a section OFF → verify overlay appears
- [ ] Toggle a feature OFF → verify "Under Maintenance" overlay
- [ ] Toggle section back ON → verify features are accessible
- [ ] Navigate to a feature page (e.g., `/sm/core-crm/contacts`)
- [ ] Disable the section from settings → verify guard shows disabled state
- [ ] Disable the feature from settings → verify guard shows maintenance state
- [ ] Click "Go to Settings" from guard → verify navigation
- [ ] Reload page → verify toggle states persist
- [ ] Use browser dev tools to clear `sm_service_toggles_v2` → verify defaults to all enabled

---

## Next Steps (Not Implemented Yet)

1. **Server-side toggle persistence** - Sync toggles to backend per user/org
2. **Widget integration** - Wire up dashboard widgets to use `useSMWidget`
3. **Role-based toggle restrictions** - Only allow admins to toggle
4. **Bulk toggle operations** - Enable/disable all features in a section at once
5. **Toggle audit log** - Track who changed what toggle when
6. **Feature-level permissions** - Different toggle states per user role
7. **Import/Export toggle config** - Share toggle presets across orgs
8. **Real-time sync** - WebSockets to sync toggles across browser tabs

---

## Support

For questions or issues:
- Check the SALES-MARKETING-PLAN.md for roadmap
- Check the AI-LAYER-PLAN.md for AI integration plans
- Review the API-STANDARDS.md for backend contracts
