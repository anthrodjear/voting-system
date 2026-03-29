'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

// ============================================
// Component
// ============================================

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse',
  className = '',
  ...props
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'skeleton-wave';
      case 'none':
        return '';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'text':
        return 'rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
    }
  };

  const getSizeStyle = () => {
    const style: React.CSSProperties = {};

    if (width) {
      style.width = typeof width === 'number' ? `${width}px` : width;
    }

    if (height) {
      style.height = typeof height === 'number' ? `${height}px` : height;
    } else if (variant === 'text') {
      style.height = '1rem';
    }

    return style;
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`
              bg-neutral-200 dark:bg-neutral-700
              ${getAnimationClass()}
              ${getVariantClass()}
              ${index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
            `}
            style={{
              height: height ? (typeof height === 'number' ? `${height}px` : height) : '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`
        bg-neutral-200 dark:bg-neutral-700
        ${getAnimationClass()}
        ${getVariantClass()}
        ${className}
      `}
      style={getSizeStyle()}
      aria-hidden="true"
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';

// ============================================
// Skeleton Components for common patterns
// ============================================

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} className="mt-2" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 ${className}`}>
      {/* Header */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 p-4">
              <Skeleton width="80%" height={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex border-b border-neutral-200 dark:border-neutral-700 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 p-4">
              <Skeleton width="70%" height={14} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  );
};

export const SkeletonButton: React.FC<{ width?: string | number; className?: string }> = ({
  width = 100,
  className = '',
}) => {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={40}
      className={className}
    />
  );
};

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Skeleton Component Usage:
 * 
 * // Basic usage
 * <Skeleton />
 * 
 * // With dimensions
 * <Skeleton width={200} height={20} />
 * 
 * // Variants
 * <Skeleton variant="text" />
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" width="100%" height={100} />
 * 
 * // Text lines
 * <Skeleton lines={3} />
 * <Skeleton lines={4} height={14} />
 * 
 * // Animation
 * <Skeleton animation="pulse" />
 * <Skeleton animation="wave" />
 * <Skeleton animation="none" />
 * 
 * // Pre-built components
 * <SkeletonCard />
 * <SkeletonTable rows={5} columns={4} />
 * <SkeletonAvatar size="lg" />
 * <SkeletonButton width={120} />
 */
