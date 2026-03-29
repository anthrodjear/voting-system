'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: TrendDirection;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

// ============================================
// Icons
// ============================================

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const TrendNeutralIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
  </svg>
);

// ============================================
// Variants Configuration
// ============================================

const iconContainerStyles: Record<string, string> = {
  default: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  success: 'bg-success-light dark:bg-success/20 text-success',
  warning: 'bg-warning-light dark:bg-warning/20 text-warning',
  error: 'bg-error-light dark:bg-error/20 text-error',
  info: 'bg-info-light dark:bg-info/20 text-info',
};

const trendStyles: Record<TrendDirection, { color: string; bg: string }> = {
  up: { color: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
  down: { color: 'text-error', bg: 'bg-error-light dark:bg-error/20' },
  neutral: { color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-700' },
};

// ============================================
// Component
// ============================================

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  trend = 'neutral',
  icon,
  variant = 'default',
  className = '',
  ...props
}) => {
  const TrendIcon = trend === 'up' ? TrendUpIcon : trend === 'down' ? TrendDownIcon : TrendNeutralIcon;

  return (
    <div
      className={`
        bg-white dark:bg-neutral-800 
        rounded-xl border border-neutral-200 dark:border-neutral-700
        p-5 shadow-sm
        transition-all duration-200 hover:shadow-md
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        {icon && (
          <div
            className={`
              flex items-center justify-center w-12 h-12 rounded-xl
              ${iconContainerStyles[variant]}
            `}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`
                  inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium
                  ${trendStyles[trend].bg} ${trendStyles[trend].color}
                `}
              >
                <TrendIcon />
                <span>{Math.abs(change)}%</span>
              </span>
              {changeLabel && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

StatCard.displayName = 'StatCard';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * StatCard Component Usage:
 * 
 * // Basic usage
 * <StatCard title="Total Voters" value="1,234,567" />
 * 
 * // With icon
 * <StatCard 
 *   title="Total Voters" 
 *   value="1,234,567" 
 *   icon={<UsersIcon />}
 * />
 * 
 * // With change/trend
 * <StatCard 
 *   title="Total Voters" 
 *   value="1,234,567" 
 *   change={12.5}
 *   trend="up"
 *   changeLabel="vs last month"
 * />
 * 
 * // Variants
 * <StatCard title="Active Voters" value="50,000" variant="success" />
 * <StatCard title="Pending" value="1,000" variant="warning" />
 * <StatCard title="Failed" value="50" variant="error" />
 * <StatCard title="Counties" value="47" variant="info" />
 * 
 * // Full example
 * <StatCard
 *   title="Votes Cast"
 *   value="450,234"
 *   change={8.3}
 *   trend="up"
 *   changeLabel="vs yesterday"
 *   icon={
 *     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 *       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 *     </svg>
 *   }
 *   variant="success"
 * />
 */
