'use client';

import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// ============================================
// Types
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface ToastProps extends Toast {
  onClose: () => void;
}

// ============================================
// Icons
// ============================================

const ToastIcon: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================
// Context
// ============================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================
// Toast Item Component
// ============================================

const ToastItem: React.FC<ToastProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variantStyles: Record<ToastType, { icon: string; bg: string; border: string }> = {
    success: { icon: 'text-success', bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20' },
    warning: { icon: 'text-warning', bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20' },
    error: { icon: 'text-error', bg: 'bg-error-light dark:bg-error/10', border: 'border-error/20' },
    info: { icon: 'text-info', bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20' },
  };

  const styles = variantStyles[type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${styles.bg} ${styles.border}
        animate-slide-in-right
        max-w-sm w-full
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {ToastIcon[type]}
      </div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </p>
        )}
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ============================================
// Toast Container
// ============================================

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, position, onRemove }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-notification flex flex-col gap-2`}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

// ============================================
// Provider Component
// ============================================

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {typeof window !== 'undefined' && toasts.length > 0 && (
        <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
      )}
    </ToastContext.Provider>
  );
};

// ============================================
// Standalone Toast (for simple usage)
// ============================================

export const Toast: React.FC<ToastProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return createPortal(
    <ToastContainer
      toasts={[props]}
      position="top-right"
      onRemove={() => props.onClose()}
    />,
    document.body
  );
};

Toast.displayName = 'Toast';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Toast Component Usage:
 * 
 * // 1. Wrap your app with ToastProvider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // 2. Use the useToast hook
 * const { addToast } = useToast();
 * 
 * // Show toast
 * addToast({ type: 'success', message: 'Vote recorded successfully!' });
 * addToast({ type: 'error', message: 'Failed to record vote' });
 * addToast({ type: 'warning', message: 'Please verify your identity' });
 * addToast({ type: 'info', message: 'Election ends in 2 hours' });
 * 
 * // With title
 * addToast({ 
 *   type: 'success', 
 *   title: 'Success!', 
 *   message: 'Your vote has been recorded.' 
 * });
 * 
 * // Custom duration (0 = never auto-dismiss)
 * addToast({ 
 *   type: 'info', 
 *   message: 'Processing...', 
 *   duration: 0 
 * });
 * 
 * // Bottom right position
 * <ToastProvider position="bottom-right">
 *   <App />
 * </ToastProvider>
 */
