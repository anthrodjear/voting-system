'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  showDot?: boolean;
  pulse?: boolean;
}

// ============================================
// Variants Configuration
// ============================================

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-light dark:bg-success/20 text-success-dark dark:text-success',
  warning: 'bg-warning-light dark:bg-warning/20 text-warning-dark dark:text-warning',
  error: 'bg-error-light dark:bg-error/20 text-error-dark dark:text-error',
  info: 'bg-info-light dark:bg-info/20 text-info-dark dark:text-info',
  neutral: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
  neutral: 'bg-neutral-500',
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
};

// ============================================
// Component
// ============================================

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  showDot = false,
  pulse = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Badge Component Usage:
 * 
 * // Basic usage
 * <Badge>Default</Badge>
 * 
 * // Variants
 * <Badge variant="success">Success</Badge>
 * <Badge variant="warning">Warning</Badge>
 * <Badge variant="error">Error</Badge>
 * <Badge variant="info">Info</Badge>
 * <Badge variant="neutral">Neutral</Badge>
 * 
 * // Sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="md">Medium</Badge>
 * <Badge size="lg">Large</Badge>
 * 
 * // With dot indicator
 * <Badge showDot>With dot</Badge>
 * <Badge variant="success" showDot>Verified</Badge>
 * 
 * // With pulse animation
 * <Badge variant="success" showDot pulse>Live</Badge>
 * <Badge variant="warning" showDot pulse>Pending</Badge>
 * <Badge variant="error" showDot pulse>Urgent</Badge>
 * 
 * // In context
 * <div className="flex gap-2">
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="warning">Pending</Badge>
 *   <Badge variant="error">Failed</Badge>
 * </div>
 */
