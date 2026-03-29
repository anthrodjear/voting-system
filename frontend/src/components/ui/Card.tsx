'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  isInteractive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

// ============================================
// Variants Configuration
// ============================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm',
  elevated: 'bg-white dark:bg-neutral-800 shadow-lg',
  outlined: 'bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700',
  interactive: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

// ============================================
// Card Component
// ============================================

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      isInteractive = false,
      padding = 'md',
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    // Use a simple div with onClick for interactive cards instead of button element
    const Component = 'div';

    return (
      <Component
        ref={ref}
        onClick={onClick}
        className={`
          rounded-xl w-full
          transition-all duration-200
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${isInteractive ? 'cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-left' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

// ============================================
// Card Header
// ============================================

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between mb-4 ${className}`}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// ============================================
// Card Body
// ============================================

export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ noPadding = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${noPadding ? '' : 'px-1'} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// ============================================
// Card Footer
// ============================================

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', className = '', children, ...props }, ref) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={`flex items-center gap-3 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${alignClasses[align]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Card Component Usage:
 * 
 * // Basic usage
 * <Card>
 *   <CardHeader title="Card Title" subtitle="Card subtitle" />
 *   <CardBody>Card content goes here</CardBody>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 * 
 * // Variants
 * <Card variant="default">Default card</Card>
 * <Card variant="elevated">Elevated card</Card>
 * <Card variant="outlined">Outlined card</Card>
 * 
 * // Padding variants
 * <Card padding="none">No padding</Card>
 * <Card padding="sm">Small padding</Card>
 * <Card padding="md">Medium padding</Card>
 * <Card padding="lg">Large padding</Card>
 * 
 * // Interactive card
 * <Card isInteractive onClick={() => console.log('clicked')}>
 *   Click me
 * </Card>
 * 
 * // With action button
 * <Card>
 *   <CardHeader 
 *     title="Profile" 
 *     action={<Button size="sm">Edit</Button>}
 *   />
 *   <CardBody>Content</CardBody>
 * </Card>
 */
