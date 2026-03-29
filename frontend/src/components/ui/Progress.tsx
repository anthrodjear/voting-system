'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: ProgressVariant;
  size?: ProgressSize;
  animated?: boolean;
}

// ============================================
// Variants Configuration
// ============================================

const variantStyles: Record<ProgressVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const trackStyles: Record<ProgressVariant, string> = {
  primary: 'bg-primary-100 dark:bg-primary-900/30',
  success: 'bg-success-light dark:bg-success/20',
  warning: 'bg-warning-light dark:bg-warning/20',
  error: 'bg-error-light dark:bg-error/20',
  info: 'bg-info-light dark:bg-info/20',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

// ============================================
// Component
// ============================================

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  variant = 'primary',
  size = 'md',
  animated = false,
  className = '',
  ...props
}) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Label and value */}
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress track */}
      <div
        className={`
          w-full ${sizeStyles[size]} rounded-full overflow-hidden
          ${trackStyles[variant]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        {/* Progress bar */}
        <div
          className={`
            ${sizeStyles[size]} ${variantStyles[variant]}
            rounded-full transition-all duration-500 ease-out
            ${animated ? 'animate-progress bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%]' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

Progress.displayName = 'Progress';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Progress Component Usage:
 * 
 * // Basic usage
 * <Progress value={50} />
 * 
 * // With label
 * <Progress value={75} label="Voter turnout" />
 * 
 * // With value display
 * <Progress value={60} showValue />
 * 
 * // With label and value
 * <Progress value={45} label="Counted" showValue />
 * 
 * // Variants
 * <Progress value={75} variant="primary" />
 * <Progress value={75} variant="success" />
 * <Progress value={75} variant="warning" />
 * <Progress value={75} variant="error" />
 * <Progress value={75} variant="info" />
 * 
 * // Sizes
 * <Progress value={50} size="sm" />
 * <Progress value={50} size="md" />
 * <Progress value={50} size="lg" />
 * 
 * // Animated
 * <Progress value={75} animated />
 * 
 * // With custom max
 * <Progress value={150} max={200} showValue />
 */
