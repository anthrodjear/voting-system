'use client';

import React, { useState } from 'react';

// ============================================
// Types
// ============================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  as?: 'input' | 'select' | 'textarea';
  children?: React.ReactNode;
}

export interface InputRef extends HTMLInputElement {}

// ============================================
// Component
// ============================================

export const Input = React.forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      type = 'text',
      className = '',
      id,
      disabled,
      as = 'input',
      children,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const getBorderColor = () => {
      if (error) return 'border-error focus:ring-error';
      return 'border-neutral-300 focus:ring-primary-500 dark:border-neutral-600';
    };

    // Render select element
    if (as === 'select') {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              {label}
              {props.required && (
                <span className="text-error ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}

          <div className="relative">
            {/* Left Icon */}
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none z-10">
                {leftIcon}
              </div>
            )}

            {/* Select */}
            <select
              ref={ref as React.Ref<HTMLSelectElement>}
              id={inputId}
              disabled={disabled}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : helperText ? helperId : undefined}
              className={`
                block w-full rounded-lg bg-white dark:bg-neutral-800
                px-4 py-2.5 text-neutral-900 dark:text-neutral-100
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                transition-all duration-200 appearance-none
                focus:outline-none focus:ring-2 focus:ring-offset-0
                disabled:cursor-not-allowed disabled:opacity-50
                ${getBorderColor()}
                ${leftIcon ? 'pl-10' : ''}
                pr-10
                ${className}
              `}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {children}
            </select>

            {/* Chevron icon for select */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p id={errorId} className="mt-1.5 text-sm text-error dark:text-error" role="alert">
              {error}
            </p>
          )}

          {/* Helper Text */}
          {helperText && !error && (
            <p id={helperId} className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Render textarea element
    if (as === 'textarea') {
      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              {label}
              {props.required && (
                <span className="text-error ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}

          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              block w-full rounded-lg bg-white dark:bg-neutral-800
              px-4 py-2.5 text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              ${getBorderColor()}
              ${className}
            `}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />

          {/* Error Message */}
          {error && (
            <p id={errorId} className="mt-1.5 text-sm text-error dark:text-error" role="alert">
              {error}
            </p>
          )}

          {/* Helper Text */}
          {helperText && !error && (
            <p id={helperId} className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    // Render input element (default)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-error ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            type={inputType}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              block w-full rounded-lg bg-white dark:bg-neutral-800
              px-4 py-2.5 text-neutral-900 dark:text-neutral-100
              placeholder:text-neutral-400 dark:placeholder:text-neutral-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              ${getBorderColor()}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || (showPasswordToggle && isPassword) ? 'pr-10' : ''}
              ${error ? 'focus:border-error' : ''}
              ${className}
            `}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />

          {/* Right Icon / Password Toggle */}
          {(rightIcon || (showPasswordToggle && isPassword)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none focus:text-primary-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error dark:text-error" role="alert">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Input Component Usage:
 * 
 * // Basic usage
 * <Input placeholder="Enter text" />
 * 
 * // With label
 * <Input label="Email" type="email" placeholder="Enter your email" />
 * 
 * // With error
 * <Input label="Password" type="password" error="Password is required" />
 * 
 * // With helper text
 * <Input label="Phone" helperText="We'll never share your number" />
 * 
 * // With icons
 * <Input leftIcon={<MailIcon />} placeholder="Email" />
 * <Input rightIcon={<SearchIcon />} placeholder="Search" />
 * 
 * // Password with toggle
 * <Input type="password" showPasswordToggle />
 * 
 * // Disabled
 * <Input disabled placeholder="Disabled input" />
 */
