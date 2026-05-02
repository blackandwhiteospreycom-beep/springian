import { useCRM } from '../context/CRMContext';
import * as bus from './bus';

// Hook facade that exposes existing CRMContext selectors/actions plus a small event bus
export const useDataLayer = () => {
  const crm = useCRM();
  return {
    ...crm,
    // event bus helpers
    on: bus.on,
    off: bus.off,
    emit: bus.emit,
  };
};

// Non-hook helpers (for non-React code) — use sparingly
export const dataLayer = {
  on: bus.on,
  off: bus.off,
  emit: bus.emit,
};

export default useDataLayer;