const pool = require('../../db');

/**
 * Event Bus System
 *
 * Modules emit events. Other modules can subscribe and react.
 * Decoupled, async, cross-module communication.
 *
 * Usage:
 *   const eventBus = require('./services/modules/eventBus');
 *
 *   // Emit an event (e.g., contact was created)
 *   await eventBus.emit('contact.created', {
 *     orgId: 1,
 *     contactId: 'abc-123',
 *     data: { first_name: 'John', ... }
 *   });
 *
 *   // Subscribe to an event (e.g., lead module listens for new contacts)
 *   eventBus.on('contact.created', async (payload) => {
 *     // Auto-create a lead from the contact
 *   });
 */

class EventBus {
  constructor() {
    /** @type {Map<string, Function[]>} */
    this._listeners = new Map();
  }

  /**
   * Register a listener for an event.
   * @param {string} eventName - e.g., 'contact.created', 'deal.moved', 'invoice.sent'
   * @param {Function} handler - async function that receives the payload
   */
  on(eventName, handler) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }
    this._listeners.get(eventName).push(handler);
  }

  /**
   * Remove a specific listener.
   */
  off(eventName, handler) {
    const handlers = this._listeners.get(eventName);
    if (!handlers) return;
    this._listeners.set(eventName, handlers.filter(h => h !== handler));
  }

  /**
   * Emit an event. Fires all registered handlers.
   * Also persists the event to the database for audit and async processing.
   *
   * @param {string} eventName
   * @param {object} payload - { orgId, userId, moduleKey, data }
   */
  async emit(eventName, payload) {
    const handlers = this._listeners.get(eventName) || [];

    // Fire all handlers in parallel (don't await — non-blocking)
    const promises = handlers.map(async (handler) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`EventBus handler error for "${eventName}":`, err.message);
      }
    });

    // Log the event to database for audit/replay
    try {
      await pool.query(
        `INSERT INTO event_subscriptions (module_key, event_name, handler_type, config)
         VALUES ($1, $2, 'logged', $3)
         ON CONFLICT DO NOTHING`,
        [payload.moduleKey || 'system', eventName, JSON.stringify(payload)]
      );
    } catch (err) {
      // Don't fail event emission on log failure
      console.error(`EventBus log error for "${eventName}":`, err.message);
    }

    return Promise.allSettled(promises);
  }

  /**
   * Get all registered event names.
   */
  getRegisteredEvents() {
    return Array.from(this._listeners.keys());
  }

  /**
   * Remove all listeners for an event (or all events if no name given).
   */
  clear(eventName) {
    if (eventName) {
      this._listeners.delete(eventName);
    } else {
      this._listeners.clear();
    }
  }
}

// Singleton instance
const eventBus = new EventBus();

// ─── Pre-registered Cross-Module Events ──────────────────────────────
// These are documented here so module developers know what events exist.
// Actual handlers are registered by the modules that care about them.
//
// Event Naming Convention: <module>.<action>
//
// contact.created      — New contact added
// contact.updated      — Contact data changed
// contact.deleted      — Contact removed
// contact.merged       — Duplicate contacts merged
//
// lead.created         — New lead (often from contact)
// lead.qualified       — Lead moved to MQL/SQL
// lead.converted       — Lead converted to deal/contact
//
// deal.created         — New deal/opportunity
// deal.moved           — Deal stage changed
// deal.won             — Deal closed-won
// deal.lost            — Deal closed-lost
//
// invoice.created      — Invoice generated
// invoice.sent         — Invoice delivered to client
// invoice.paid         — Payment received
// invoice.overdue      — Past due date
//
// campaign.started     — Marketing campaign launched
// campaign.completed   — Campaign finished
//
// order.created        — Sales order placed
// order.fulfilled      — Order shipped/delivered
// order.cancelled      — Order cancelled

module.exports = eventBus;
module.exports.EventBus = EventBus;
