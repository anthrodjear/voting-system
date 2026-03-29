'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ============================================
// Variants Configuration
// ============================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700
    dark:bg-primary-600 dark:hover:bg-primary-500 dark:active:bg-primary-700
    focus:ring-primary-500
  `,
  secondary: `
    bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300
    dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 dark:active:bg-neutral-500
    focus:ring-neutral-500
  `,
  ghost: `
    bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200
    dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
    focus:ring-neutral-500
  `,
  danger: `
    bg-error text-white hover:bg-error/90 active:bg-error-dark
    dark:bg-error dark:hover:bg-error/90 dark:active:bg-error-dark
    focus:ring-error
  `,
  success: `
    bg-success text-white hover:bg-success/90 active:bg-success-dark
    dark:bg-success dark:hover:bg-success/90 dark:active:bg-success-dark
    focus:ring-success
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

// ============================================
// Component
// ============================================

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loading,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Support both isLoading and loading props
    const isActuallyLoading = isLoading || loading;
    const isDisabled = disabled || isActuallyLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isActuallyLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Button Component Usage:
 * 
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * // With variants
 * <Button variant="primary">Primary</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="ghost">Ghost</Button>
 * <Button variant="danger">Danger</Button>
 * <Button variant="success">Success</Button>
 * 
 * // With sizes
 * <Button size="sm">Small</Button>
 * <Button size="md">Medium</Button>
 * <Button size="lg">Large</Button>
 * 
 * // With loading state
 * <Button isLoading>Loading</Button>
 * 
 * // With icons
 * <Button leftIcon={<Icon />}>With left icon</Button>
 * <Button rightIcon={<Icon />}>With right icon</Button>
 * 
 * // Full width
 * <Button fullWidth>Full width button</Button>
 */
