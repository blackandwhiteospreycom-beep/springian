# Core CRM Data Layer Contract

Purpose
- Provide a single canonical contract for frontend modules (Accounts, Contacts, Leads, Deals, Activities, Enrichment, Duplicates).
- Make modules interoperable while allowing independent front-end components and mock/back-end swap.

Principles
- Canonical IDs: use string UUID v4 for all primary entity IDs (id). Also allow external_ids: [{ provider, id }] for mapping.
- Immutable schema versioning: include a `schema_version` at the top-level of persisted records.
- Event-first sync: components subscribe to a small event bus to react to create/update/delete and suggestions.
- Optimistic UI: support optimistic updates with server reconciliation using updated_at timestamps.

Primary Entities
- Account
  - id: string (uuid)
  - external_ids: Array<{ provider:string, id:string }>
  - name, industry, owner_id, annual_revenue (number/string), created_at, updated_at, schema_version
  - meta: { source, confidence }

- Contact
  - id, external_ids, account_id, first_name, last_name, email, phone, role, owner_id, created_at, updated_at, schema_version

- Lead
  - id, external_ids, source, status (new / contacted / qualified / disqualified), assigned_to, score, created_at, updated_at

- Deal
  - id, account_id, contact_id, stage, amount (number), close_date, probability, owner_id, created_at, updated_at

- Activity
  - id, entity_type (account|contact|lead|deal), entity_id, type (email|call|meeting|note), direction, subject, body, created_at, created_by

- CommunicationLog
  - id, activity_id, channel, raw_payload, sanitized_text, created_at

- EnrichmentRecord
  - id, entity_type, entity_id, source, data, fetched_at, freshness

Selectors / Contract API (frontend)
- getEntityById(entityType, id) -> Entity | null
- listEntities(entityType, filters?, paging?) -> { items: Entity[], total }
- searchEntities(entityType, query, options)
- getContactsByAccount(accountId)
- getActivitiesByEntity(entityType, entityId, { limit, since })
- getDealsByAccount(accountId)
- createEntity(entityType, payload) -> emits entity.created
- updateEntity(entityType, id, patch) -> emits entity.updated
- deleteEntity(entityType, id) -> emits entity.deleted

Event Bus (memory-first)
- Namespaced events:
  - entity.created (payload: { entityType, entity })
  - entity.updated (payload: { entityType, entity, patch })
  - entity.deleted (payload: { entityType, id })
  - activity.created (payload: { activity })
  - enrichment.updated (payload: { entityType, entityId, enrichment })
  - duplicate.suspected (payload: { candidates: [id], reason })
  - merge.completed (payload: { keptId, mergedIds })

Event Payload rules
- Always include `source` (ui|local|server), `requestId` (for tracing), and `timestamp`.
- Keep payloads small; include ids and deltas, not full heavy blobs.

Conflict resolution & versioning
- Each record must have `updated_at` (ISO) and `schema_version`.
- Default strategy: Last-write-wins using updated_at. For critical merges, surface conflicts to the UI for manual resolution.
- Keep an audit log of server authoritative changes for reconciliation.

Mock / Local Implementation notes
- Use current CRMContext as base. Extract EventEmitter and selectors into a shared module `core-crm/data-layer`.
- Provide a LocalStore implementation exposing the selectors and functions above; wire to localStorage for persistence during frontend-first development.

Integration guidelines for modules
- Modules should import selector functions from the data-layer rather than accessing arrays directly.
- UI components listen for event bus events to refresh views (e.g., activity.created => increment activity counters).
- Use minimal, well-defined interfaces (see example TypeScript below) so server adapters can be swapped in.

Example TypeScript interfaces
```ts
export type UUID = string;
export interface BaseEntity { id: UUID; external_ids?: {provider:string, id:string}[]; created_at:string; updated_at:string; schema_version?: string }
export interface Account extends BaseEntity { name:string; industry?:string; owner_id?:UUID; annual_revenue?:number }
export interface Contact extends BaseEntity { account_id:UUID; first_name:string; last_name:string; email?:string }
export interface Activity { id:UUID; entity_type:string; entity_id:UUID; type:string; subject?:string; body?:string; created_at:string; created_by?:UUID }
```

Example EventEmitter (JS outline)
```js
import EventEmitter from 'events';
const bus = new EventEmitter();
export const emit = (evt, payload) => bus.emit(evt, payload);
export const on = (evt, fn) => bus.on(evt, fn);
export default { emit, on };
```

Migration & rollout
- Phase 1: Extract selectors + bus into frontend module; keep existing CRMContext and adapt to use new selectors.
- Phase 2: Add LocalStore implementation (localStorage) and tests for selectors and events.
- Phase 3: Implement server adapter that fulfills the same selector API and event hooks; add reconciliation layer.

Next steps / todos
- Implement `core-crm/data-layer` module (selectors + event bus) and migrate Contact & Account components to consume it.
- Add unit tests for selectors and event propagation.
- Provide a small adapter that proxies local operations to server endpoints when available.

Contact for questions: keep frontend-first approach; if server-side ML or large data is required, design server endpoints to accept batched activity payloads.
