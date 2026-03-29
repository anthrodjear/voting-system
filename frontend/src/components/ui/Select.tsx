'use client';

import React from 'react';

// ============================================
// Types
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export interface SelectRef extends HTMLSelectElement {}

// ============================================
// Component
// ============================================

export const Select = React.forwardRef<SelectRef, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      placeholder = 'Select an option',
      options,
      onChange,
      className = '',
      id,
      disabled,
      value,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const getBorderColor = () => {
      if (error) return 'border-error focus:ring-error';
      return 'border-neutral-300 focus:ring-primary-500 dark:border-neutral-600';
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            {label}
            {required && (
              <span className="text-error ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              block w-full rounded-lg bg-white dark:bg-neutral-800
              px-4 py-2.5 text-neutral-900 dark:text-neutral-100
              transition-all duration-200 appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              ${getBorderColor()}
              ${error ? 'focus:border-error' : ''}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400 dark:text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
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
);

Select.displayName = 'Select';

// ============================================
// Storybook/Usage Examples
// ============================================

/**
 * Select Component Usage:
 * 
 * // Basic usage
 * <Select 
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]} 
 * />
 * 
 * // With label and placeholder
 * <Select
 *   label="Country"
 *   placeholder="Select your country"
 *   options={[
 *     { value: 'ke', label: 'Kenya' },
 *     { value: 'tz', label: 'Tanzania' }
 *   ]}
 * />
 * 
 * // With error
 * <Select
 *   label="County"
 *   error="Please select a county"
 *   options={[...]}
 * />
 * 
 * // With helper text
 * <Select
 *   label="Role"
 *   helperText="Choose your role in the system"
 *   options={[...]}
 * />
 * 
 * // Controlled
 * <Select
 *   value={selectedValue}
 *   onChange={(value) => setSelectedValue(value)}
 *   options={[...]}
 * />
 */
