# API Standards Contract

**All module routes MUST follow this contract.** Consistency across modules
enables the SuperAdmin dashboard to programmatically discover, manage, and
monitor every module without custom integrations.

---

## 1. Route Structure

Every module registers under `/api/<module-key>/`.

```
/api/contacts/                  — Contact management
/api/leads/                     — Lead management
/api/pipelines/                 — Pipeline management
```

---

## 2. Standard Endpoints

Every module MUST implement these standard endpoints (where applicable):

| Method   | Path                              | Purpose                          |
|----------|-----------------------------------|----------------------------------|
| `GET`    | `/api/{module}/`                  | List entities (paginated)        |
| `GET`    | `/api/{module}/:id`               | Get single entity                |
| `POST`   | `/api/{module}/`                  | Create entity                    |
| `PUT`    | `/api/{module}/:id`               | Update entity                    |
| `DELETE` | `/api/{module}/:id`               | Delete entity                    |
| `DELETE` | `/api/{module}/bulk`              | Bulk delete (body: `{ ids: [] }`) |
| `GET`    | `/api/{module}/stats`             | Module-level stats summary       |
| `GET`    | `/api/{module}/search?q=term`     | Module-specific search           |
| `GET`    | `/api/{module}/export`            | Export data (CSV/JSON)           |
| `POST`   | `/api/{module}/import`            | Import data (CSV/Excel)          |

---

## 3. Request Format

### Authentication
Every request MUST include `Authorization: Bearer <token>` header.
Token is issued via `/api/auth/login` and contains `{ id, email, role, org_id }`.

### Pagination (Query Params)
```
?page=1&limit=20&sortBy=created_at&sortOrder=DESC
```

### Filtering (Query Params)
Standard filters shared across modules:
```
?status=active&owner_id=5&tags=important,vip
```

Module-specific filters are appended as needed.

### Search
```
?q=john doe          — Full-text search across entity fields
```

---

## 4. Response Format

### Success — Single Entity
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    ...
  }
}
```

### Success — List (Paginated)
```json
{
  "success": true,
  "data": {
    "rows": [ ... ],
    "total": 142,
    "page": 1,
    "limit": 20
  }
}
```

### Success — No Content
```json
{
  "success": true
}
```

### Error
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Error — Validation
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "first_name", "message": "Required" }
  ]
}
```

### Error — Permission Denied
```json
{
  "success": false,
  "error": "Module \"contact_management\" is not enabled for your organization."
}
```

```json
{
  "success": false,
  "error": "Permission denied. Your role \"user\" does not have \"delete\" access to \"contact_management\"."
}
```

---

## 5. Middleware Chain (Required Order)

Every module route MUST apply middleware in this order:

```js
router.post('/contacts',
  authenticate,                    // Verify JWT, attach req.user
  enforceOrgIsolation(),           // Set req.orgId, prevent cross-org access
  requireModuleEnabled('contact_management'),  // Block if module disabled
  requirePermission('contact_management', 'create'),  // Block if role lacks permission
  auditAction('contact_management', 'create'),  // Log the action
  handler
);
```

---

## 6. Events (Emit After Mutations)

After every create/update/delete, the module MUST emit an event:

```js
const eventBus = require('./services/modules/eventBus');

// After creating a contact:
await eventBus.emit('contact.created', {
  orgId: contact.org_id,
  userId: req.user.id,
  moduleKey: 'contact_management',
  data: { contactId: contact.id, ...contact }
});

// After updating:
await eventBus.emit('contact.updated', { ... });

// After deleting:
await eventBus.emit('contact.deleted', { ... });
```

### Standard Event Names
```
<entity>.created
<entity>.updated
<entity>.deleted
<entity>.merged
```

---

## 7. Global Search Registration

After creating/updating/deleting an entity, register it in the global search index:

```js
const search = require('./services/modules/globalSearch');

// On create:
await search.indexEntity('contact_management', 'contact', contact.id, {
  orgId: contact.org_id,
  title: `${contact.first_name} ${contact.last_name}`,
  description: contact.title,
  text: `${contact.email} ${contact.phone} ${contact.city} ${contact.state}`,
  tags: ['contact', contact.status],
  metadata: { email: contact.email, account_id: contact.account_id }
});

// On delete:
await search.unindexEntity('contact_management', 'contact', contactId);
```

---

## 8. Stats Endpoint

Every module MUST implement `GET /api/{module}/stats` returning:

```json
{
  "success": true,
  "data": {
    "total": 142,
    "active": 128,
    "inactive": 10,
    "archived": 4,
    "createdThisMonth": 23,
    "updatedThisWeek": 45,
    "topTags": [
      { "tag": "vip", "count": 15 },
      { "tag": "prospect", "count": 12 }
    ]
  }
}
```

---

## 9. Error Codes

| HTTP Code | Meaning                           |
|-----------|-----------------------------------|
| 200       | Success                           |
| 201       | Created                           |
| 400       | Bad request / Validation error    |
| 401       | Not authenticated (missing/invalid token) |
| 403       | Forbidden (module disabled / permission denied / cross-org access) |
| 404       | Not found                         |
| 429       | Rate limited                      |
| 500       | Internal server error             |

---

## 10. Rate Limiting

All module routes inherit the global rate limiter from the auth middleware.
Module-specific rate limits can be added per-module if needed:

```js
const { rateLimit } = require('express-rate-limit');

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window
  message: { success: false, error: 'Too many requests, please try again later.' }
});

router.use('/api/contacts', contactRateLimiter);
```

---

## Checklist for New Module Developers

- [ ] All routes follow `/api/{module}/` prefix
- [ ] All routes use the 5-part middleware chain
- [ ] All responses follow `{ success, data }` or `{ success, error }` format
- [ ] Paginated list returns `{ rows, total, page, limit }`
- [ ] Events emitted on create/update/delete
- [ ] Entities registered in global search index
- [ ] Stats endpoint implemented
- [ ] Error responses use standard format
- [ ] Module registered in `org_service_modules` on first enable
