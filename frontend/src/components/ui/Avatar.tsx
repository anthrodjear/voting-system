'use client';

import React, { useState } from 'react';

// ============================================
// Types
// ============================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'bottom-right';
}

// ============================================
// Size Configuration
// ============================================

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-success',
  offline: 'bg-neutral-400',
  away: 'bg-warning',
  busy: 'bg-error',
};

// ============================================
// Component
// ============================================

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  initials,
  size = 'md',
  status,
  statusPosition = 'bottom-right',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  // Generate initials from fallback or name
  const getInitials = () => {
    if (fallback) return fallback;

    // Try to extract initials from alt text
    const words = alt.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const showImage = src && !hasError;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`} {...props}>
      {/* Avatar Image or Initials */}
      <div
        className={`
          ${sizeStyles[size]}
          rounded-full overflow-hidden flex items-center justify-center
          bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400
          font-semibold
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          getInitials()
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute rounded-full ${statusSizes[size]} ${statusColors[status]}
            ${statusPosition === 'top-right' ? '-top-0.5 -right-0.5' : '-bottom-0.5 -right-0.5'}
            border-2 border-white dark:border-neutral-800
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

// Default export for convenience
export default Avatar;

// ============================================
// Avatar Group
// ============================================

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarSize;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 4,
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const childArray = React.Children.toArray(children);
  const visibleAvatars = childArray.slice(0, max);
  const remainingCount = childArray.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`} {...props}>
      {visibleAvatars.map((child, index) => (
        <div
          key={index}
          className="ring-2 ring-white dark:ring-neutral-800 rounded-full"
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
            : child}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full overflow-hidden flex items-center justify-center
            bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400
            font-semibold text-xs ring-2 ring-white dark:ring-neutral-800
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Avatar Component Usage:
 * 
 * // Basic usage
 * <Avatar alt="John Doe" />
 * 
 * // With image
 * <Avatar src="/path/to/image.jpg" alt="John Doe" />
 * 
 * // Sizes
 * <Avatar alt="John Doe" size="xs" />
 * <Avatar alt="John Doe" size="sm" />
 * <Avatar alt="John Doe" size="md" />
 * <Avatar alt="John Doe" size="lg" />
 * <Avatar alt="John Doe" size="xl" />
 * 
 * // With status
 * <Avatar alt="John Doe" status="online" />
 * <Avatar alt="John Doe" status="offline" />
 * <Avatar alt="John Doe" status="away" />
 * <Avatar alt="John Doe" status="busy" />
 * 
 * // With custom fallback
 * <Avatar alt="John Doe" fallback="JD" />
 * 
 * // Status position
 * <Avatar alt="John Doe" status="online" statusPosition="top-right" />
 * <Avatar alt="John Doe" status="online" statusPosition="bottom-right" />
 * 
 * // Avatar Group
 * <AvatarGroup>
 *   <Avatar alt="User 1" src="/img1.jpg" />
 *   <Avatar alt="User 2" src="/img2.jpg" />
 *   <Avatar alt="User 3" src="/img3.jpg" />
 *   <Avatar alt="User 4" src="/img4.jpg" />
 *   <Avatar alt="User 5" src="/img5.jpg" />
 * </AvatarGroup>
 * 
 * // With custom max
 * <AvatarGroup max={3}>
 *   <Avatar alt="User 1" />
 *   <Avatar alt="User 2" />
 *   <Avatar alt="User 3" />
 *   <Avatar alt="User 4" />
 * </AvatarGroup>
 */
