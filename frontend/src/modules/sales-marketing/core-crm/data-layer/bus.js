// Simple in-memory event bus for frontend modules
const listeners = {};

export function on(event, fn) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(fn);
  return () => off(event, fn);
}

export function off(event, fn) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(f => f !== fn);
}

export function emit(event, payload = {}) {
  const handlers = listeners[event] || [];
  handlers.slice().forEach(fn => {
    try {
      fn(payload);
    } catch (err) {
      // swallow handler errors but log for debugging
      // eslint-disable-next-line no-console
      console.error('Event handler error for', event, err);
    }
  });
}

export default { on, off, emit };