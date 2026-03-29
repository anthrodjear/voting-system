/**
 * IEBC Blockchain Voting System - Base UI Components
 * Professional, trustworthy, secure, democratic
 */

import React from 'react';

// ============================================
// TYPES
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type InputSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ============================================
// BUTTON COMPONENT
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    transition-all duration-150 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    active:scale-[0.98]
  `;

  const variantStyles = {
    primary: `
      bg-primary-500 text-white
      hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-md
      focus-visible:ring-primary-500
    `,
    secondary: `
      bg-transparent text-primary-500 border-2 border-primary-500
      hover:bg-primary-50 active:scale-[0.98]
      focus-visible:ring-primary-500
    `,
    ghost: `
      bg-transparent text-neutral-700
      hover:bg-neutral-100 active:scale-[0.98]
      focus-visible:ring-primary-500
    `,
    danger: `
      bg-error text-white
      hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-md
      focus-visible:ring-error
    `,
    success: `
      bg-success text-white
      hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-md
      focus-visible:ring-success
    `,
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
    md: 'h-10 px-4 text-base rounded-lg gap-2',
    lg: 'h-12 px-6 text-lg rounded-lg gap-2',
    xl: 'h-14 px-8 text-xl rounded-xl gap-3',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

// ============================================
// INPUT COMPONENT
// ============================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseStyles = `
    w-full bg-white text-neutral-900
    border border-neutral-300 rounded-md
    transition-all duration-150
    placeholder:text-neutral-400
    focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
    disabled:bg-neutral-100 disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-14 px-5 text-lg',
  };

  const errorStyles = error
    ? 'border-error focus:border-error focus:ring-error/20'
    : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-1.5"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            ${baseStyles}
            ${sizeStyles[size]}
            ${errorStyles}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-error flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  pulse = false,
}) => {
  const variantStyles = {
    success: 'bg-success-light text-success-dark',
    warning: 'bg-warning-light text-warning-dark',
    error: 'bg-error-light text-error-dark',
    info: 'bg-info-light text-info-dark',
    neutral: 'bg-neutral-100 text-neutral-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
};

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  onClick,
  padding = 'md',
}) => {
  const variantStyles = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-transparent border-2 border-neutral-200',
    interactive: 'bg-white border border-neutral-200 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ============================================
// STAT CARD COMPONENT (Dashboard Stats)
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  color = 'primary',
}) => {
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-500',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    error: 'bg-error-light text-error',
    info: 'bg-info-light text-info',
  };

  return (
    <Card variant="default" className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-neutral-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-neutral-900">{value}</span>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-success' : 'text-error'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlay?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  size = 'md',
  title,
  children,
  footer,
  closeOnOverlay = true,
}) => {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[100vw] h-[100vh] m-0 rounded-none',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlay ? onClose : undefined}
        />
        
        {/* Modal */}
        <div
          className={`
            relative bg-white rounded-2xl shadow-2xl
            w-full ${sizeStyles[size]}
            animate-scale-in
            ${size === 'full' ? 'my-0' : ''}
          `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className={`px-6 py-4 ${size !== 'full' ? 'max-h-[70vh] overflow-y-auto' : 'flex-1 overflow-auto'}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'voter' | 'ro';
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorStyles = {
    primary: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    voter: 'bg-voter-500',
    ro: 'bg-ro-500',
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          {showLabel && (
            <span className="text-sm text-neutral-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-neutral-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full ${colorStyles[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================
// STEP INDICATOR COMPONENT
// ============================================

interface Step {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep?: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep = 0,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-200
                ${step.status === 'completed' 
                  ? 'bg-success text-white' 
                  : step.status === 'current'
                    ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                    : 'bg-neutral-200 text-neutral-500'
                }
              `}
            >
              {step.status === 'completed' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`
                mt-2 text-xs font-medium text-center
                ${step.status === 'current' ? 'text-primary-600' : 'text-neutral-500'}
              `}
            >
              {step.label}
            </span>
          </div>

          {/* Connector */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-0.5 mx-2
                ${index < currentStep ? 'bg-success' : 'bg-neutral-200'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ============================================
// ALERT COMPONENT
// ============================================

interface AlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  action,
  onDismiss,
  className = '',
}) => {
  const variantStyles = {
    success: {
      bg: 'bg-success-light',
      border: 'border-l-success',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-warning-light',
      border: 'border-l-warning',
      icon: 'text-warning',
    },
    error: {
      bg: 'bg-error-light',
      border: 'border-l-error',
      icon: 'text-error',
    },
    info: {
      bg: 'bg-info-light',
      border: 'border-l-info',
      icon: 'text-info',
    },
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`
        ${variantStyles[variant].bg}
        ${variantStyles[variant].border}
        border-l-4
        rounded-r-lg
        p-4
        ${className}
      `}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${variantStyles[variant].icon}`}>
          {icons[variant]}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold text-neutral-900 mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm text-neutral-700">{children}</div>
          {action && (
            <div className="mt-3">{action}</div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto -mx-1.5 -my-1.5 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg focus:outline-none"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================

interface ToastProps {
  message: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  onDismiss,
}) => {
  const variantStyles = {
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`
        ${variantStyles[variant]}
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
        animate-slide-up
        min-w-[300px] max-w-md
      `}
    >
      {icons[variant]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================
// EXPORT ALL COMPONENTS
// ============================================

export default {
  Button,
  Input,
  Badge,
  Card,
  StatCard,
  Modal,
  ProgressBar,
  StepIndicator,
  Alert,
  Toast,
};
