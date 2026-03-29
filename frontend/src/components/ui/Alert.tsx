'use client';

import React, { useState, useEffect } from 'react';

// ============================================
// Types
// ============================================

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

// ============================================
// Icons Configuration
// ============================================

const AlertIcon: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================
// Variants Configuration
// ============================================

const variantStyles: Record<AlertVariant, string> = {
  success: 'bg-success-light dark:bg-success/10 text-success-dark dark:text-success border-success/20',
  warning: 'bg-warning-light dark:bg-warning/10 text-warning-dark dark:text-warning border-warning/20',
  error: 'bg-error-light dark:bg-error/10 text-error-dark dark:text-error border-error/20',
  info: 'bg-info-light dark:bg-info/10 text-info-dark dark:text-info border-info/20',
};

const iconStyles: Record<AlertVariant, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

// ============================================
// Component
// ============================================

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-dismiss after 5 seconds if dismissible
  useEffect(() => {
    if (dismissible && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [dismissible, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) return null;

  return (
    <div
      className={`
        relative flex gap-3 p-4 rounded-lg border
        ${variantStyles[variant]}
        ${className}
      `}
      role="alert"
      {...props}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${iconStyles[variant]}`}>
        {icon || AlertIcon[variant]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {title}
          </h3>
        )}
        <div className="text-sm text-neutral-700 dark:text-neutral-300">
          {children}
        </div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md
            ${iconStyles[variant]}
            hover:opacity-70 transition-opacity
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
          `}
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Alert Component Usage:
 * 
 * // Basic usage
 * <Alert>Simple alert message</Alert>
 * 
 * // With title
 * <Alert title="Success!">Your vote has been recorded.</Alert>
 * 
 * // Variants
 * <Alert variant="success">Success alert</Alert>
 * <Alert variant="warning">Warning alert</Alert>
 * <Alert variant="error">Error alert</Alert>
 * <Alert variant="info">Info alert</Alert>
 * 
 * // With dismissible
 * <Alert dismissible>Auto-dismiss alert</Alert>
 * <Alert dismissible onDismiss={() => console.log('dismissed')}>
 *   Dismissable with callback
 * </Alert>
 * 
 * // With custom icon
 * <Alert icon={<CustomIcon />}>Custom icon alert</Alert>
 * 
 * // Full examples
 * <Alert variant="success" title="Vote Submitted">
 *   Your vote has been successfully recorded on the blockchain.
 * </Alert>
 * 
 * <Alert variant="warning" title="Warning">
 *   Please verify your identity before proceeding.
 * </Alert>
 * 
 * <Alert variant="error" title="Error">
 *   Unable to connect to the server. Please try again.
 * </Alert>
 * 
 * <Alert variant="info" title="Information">
 *   The election period ends in 2 hours.
 * </Alert>
 */
