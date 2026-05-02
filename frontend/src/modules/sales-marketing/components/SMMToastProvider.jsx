import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Toast Context ──────────────────────────────────────────────────

const ToastContext = createContext(null);

export function useSMMToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useSMMToast must be used within SMMToastProvider');
  return ctx;
}

// ─── Toast Provider ─────────────────────────────────────────────────

/**
 * SMMToastProvider - Centralized toast notification system for Sales & Marketing module
 * 
 * Usage:
 * - Wrap your component tree with <SMMToastProvider>
 * - Use useSMMToast() to get { showToast, hideToast }
 * - showToast(message, options) displays a toast
 * - Toasts auto-dismiss after duration (default: 2500ms)
 */
export function SMMToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, options = {}) => {
    const {
      type = 'info', // 'info' | 'success' | 'warning' | 'error'
      duration = 2500,
      id = Date.now().toString(),
    } = options;

    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toasts,
    showToast,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={hideToast} />
    </ToastContext.Provider>
  );
}

// ─── Toast Container ────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Single Toast ───────────────────────────────────────────────────

function Toast({ toast, onDismiss }) {
  const { id, message, type } = toast;

  const styles = {
    info: {
      bg: 'bg-gray-800',
      border: 'border-gray-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-green-700',
      border: 'border-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-600',
      border: 'border-amber-500',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-700',
      border: 'border-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`${style.bg} ${style.border} border text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in cursor-pointer`}
      onClick={() => onDismiss(id)}
      role="alert"
    >
      <span className="flex-shrink-0">{style.icon}</span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
        className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default SMMToastProvider;
