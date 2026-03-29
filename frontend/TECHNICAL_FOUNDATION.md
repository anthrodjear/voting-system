# Blockchain Voting System - Technical UX Architecture Foundation

**Architect:** Technical Foundation Specialist  
**Project:** Kenya IEBC-Inspired Blockchain Voting System  
**Date:** 2026-03-28  
**Purpose:** Solid foundation for developers to implement voter registration, voting, and admin management interfaces

---

## Table of Contents

1. [CSS Architecture & Design System](#1-css-architecture--design-system)
2. [Component Library Foundation](#2-component-library-foundation)
3. [State Management Patterns](#3-state-management-patterns)
4. [TypeScript Type Definitions](#4-typescript-type-definitions)
5. [Layout & Navigation Systems](#5-layout--navigation-systems)
6. [Responsive Design Strategy](#6-responsive-design-strategy)
7. [Theme System (Light/Dark/System)](#7-theme-system-lightsystem)
8. [Accessibility Requirements](#8-accessibility-requirements)
9. [Security-First Design Patterns](#9-security-first-design-patterns)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. CSS Architecture & Design System

### 1.1 Tailwind Configuration with Custom Theme

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ===========================================
      // COLOR SYSTEM - Semantic Naming
      // ===========================================
      colors: {
        // Brand Colors - IEBC-Inspired
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Primary brand
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // Status Colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        
        // Neutral Grays
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // Surface Colors (for light/dark mode)
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
          elevated: 'var(--surface-elevated)',
        },
        
        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        
        // Border Colors
        border: {
          DEFAULT: 'var(--border-default)',
          focus: 'var(--border-focus)',
        },
      },
      
      // ===========================================
      // TYPOGRAPHY SCALE
      // ===========================================
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1' }],            // 48px
      },
      
      // ===========================================
      // SPACING SYSTEM (4px Grid)
      // ===========================================
      spacing: {
        '0': '0',
        'px': '1px',
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '28': '7rem',       // 112px
        '32': '8rem',       // 128px
      },
      
      // ===========================================
      // BORDER RADIUS
      // ===========================================
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',   // 2px
        'DEFAULT': '0.25rem', // 4px
        'md': '0.375rem',   // 6px
        'lg': '0.5rem',     // 8px
        'xl': '0.75rem',    // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
        'full': '9999px',
      },
      
      // ===========================================
      // SHADOWS
      // ===========================================
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
      },
      
      // ===========================================
      // CONTAINER SYSTEM
      // ===========================================
      container: {
        center: true,
        padding: {
          'DEFAULT': '1rem',
          'sm': '2rem',
          'lg': '4rem',
          'xl': '5rem',
          '2xl': '6rem',
        },
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1400px',
        },
      },
      
      // ===========================================
      // TRANSITIONS
      // ===========================================
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // ===========================================
      // Z-INDEX SCALE
      // ===========================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
  ],
};

export default config;
```

### 1.2 CSS Custom Properties (Design Tokens)

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===========================================
   CSS CUSTOM PROPERTIES - DESIGN TOKENS
   =========================================== */

:root {
  /* ===========================================
     LIGHT THEME COLORS
     =========================================== */
  --surface-primary: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-tertiary: #f1f5f9;
  --surface-elevated: #ffffff;
  
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-inverse: #ffffff;
  
  --border-default: #e2e8f0;
  --border-focus: #0ea5e9;
  
  /* Interactive States */
  --hover-overlay: rgba(0, 0, 0, 0.04);
  --active-overlay: rgba(0, 0, 0, 0.08);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  
  /* Focus Ring */
  --focus-ring: 0 0 0 3px rgba(14, 165, 233, 0.4);
}

/* ===========================================
   DARK THEME COLORS
   =========================================== */

[data-theme="dark"] {
  --surface-primary: #0f172a;
  --surface-secondary: #1e293b;
  --surface-tertiary: #334155;
  --surface-elevated: #1e293b;
  
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --text-inverse: #0f172a;
  
  --border-default: #334155;
  --border-focus: #38bdf8;
  
  /* Interactive States */
  --hover-overlay: rgba(255, 255, 255, 0.04);
  --active-overlay: rgba(255, 255, 255, 0.08);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  
  /* Focus Ring */
  --focus-ring: 0 0 0 3px rgba(56, 189, 248, 0.4);
}

/* System Theme Preference */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --surface-primary: #0f172a;
    --surface-secondary: #1e293b;
    --surface-tertiary: #334155;
    --surface-elevated: #1e293b;
    
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    --text-inverse: #0f172a;
    
    --border-default: #334155;
    --border-focus: #38bdf8;
    
    --hover-overlay: rgba(255, 255, 255, 0.04);
    --active-overlay: rgba(255, 255, 255, 0.08);
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
    
    --focus-ring: 0 0 0 3px rgba(56, 189, 248, 0.4);
  }
}

/* ===========================================
   BASE STYLES
   =========================================== */

@layer base {
  html {
    @apply scroll-smooth;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
  
  body {
    @apply bg-surface-primary text-text-primary antialiased;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  /* Focus visible for accessibility */
  :focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
  
  /* Selection colors */
  ::selection {
    @apply bg-brand-500/20 text-brand-700;
  }
  
  [data-theme="dark"] ::selection {
    @apply bg-brand-400/30 text-brand-100;
  }
}

@layer components {
  /* ===========================================
     COMPONENT BASE CLASSES
     =========================================== */
  
  .btn {
    @apply inline-flex items-center justify-center gap-2;
    @apply px-4 py-2.5 text-sm font-medium rounded-lg;
    @apply transition-all duration-200 ease-out;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-primary {
    @apply btn bg-brand-600 text-white;
    @apply hover:bg-brand-700 active:bg-brand-800;
    @apply focus-visible:ring-brand-500;
  }
  
  .btn-secondary {
    @apply btn bg-surface-secondary text-text-primary;
    @apply border border-border-default;
    @apply hover:bg-surface-tertiary active:bg-surface-secondary;
    @apply focus-visible:ring-brand-500;
  }
  
  .btn-ghost {
    @apply btn bg-transparent text-text-secondary;
    @apply hover:bg-surface-secondary hover:text-text-primary;
    @apply focus-visible:ring-brand-500;
  }
  
  .btn-danger {
    @apply btn bg-error-600 text-white;
    @apply hover:bg-error-700 active:bg-error-800;
    @apply focus-visible:ring-error-500;
  }
  
  .btn-sm {
    @apply px-3 py-1.5 text-xs;
  }
  
  .btn-lg {
    @apply px-6 py-3 text-base;
  }
  
  /* ===========================================
     FORM INPUTS
     =========================================== */
  
  .input {
    @apply w-full px-4 py-2.5 text-sm;
    @apply bg-surface-primary border border-border-default rounded-lg;
    @apply placeholder:text-text-tertiary;
    @apply transition-all duration-200;
    @apply focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .input-error {
    @apply border-error-500 focus:border-error-500 focus:ring-error-500/20;
  }
  
  .input-label {
    @apply block text-sm font-medium text-text-primary mb-1.5;
  }
  
  .input-helper {
    @apply mt-1.5 text-xs text-text-tertiary;
  }
  
  .input-error-message {
    @apply mt-1.5 text-xs text-error-600;
  }
  
  /* ===========================================
     CARD COMPONENT
     =========================================== */
  
  .card {
    @apply bg-surface-elevated rounded-xl border border-border-default;
    @apply shadow-sm;
    transition: all 0.2s ease;
  }
  
  .card-hover {
    @apply hover:shadow-md hover:border-border-focus/30;
  }
  
  .card-header {
    @apply px-6 py-4 border-b border-border-default;
  }
  
  .card-body {
    @apply px-6 py-4;
  }
  
  .card-footer {
    @apply px-6 py-4 border-t border-border-default bg-surface-secondary/50;
  }
  
  /* ===========================================
     BADGE COMPONENTS
     =========================================== */
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply badge bg-success-100 text-success-700;
  }
  
  [data-theme="dark"] .badge-success {
    @apply bg-success-900/30 text-success-400;
  }
  
  .badge-warning {
    @apply badge bg-warning-100 text-warning-700;
  }
  
  [data-theme="dark"] .badge-warning {
    @apply bg-warning-900/30 text-warning-400;
  }
  
  .badge-error {
    @apply badge bg-error-100 text-error-700;
  }
  
  [data-theme="dark"] .badge-error {
    @apply bg-error-900/30 text-error-400;
  }
  
  .badge-info {
    @apply badge bg-brand-100 text-brand-700;
  }
  
  [data-theme="dark"] .badge-info {
    @apply bg-brand-900/30 text-brand-400;
  }
  
  .badge-neutral {
    @apply badge bg-neutral-100 text-neutral-700;
  }
  
  [data-theme="dark"] .badge-neutral {
    @apply bg-neutral-800 text-neutral-300;
  }
  
  /* ===========================================
     STATUS INDICATOR
     =========================================== */
  
  .status-indicator {
    @apply inline-flex items-center gap-2;
  }
  
  .status-dot {
    @apply w-2 h-2 rounded-full;
  }
  
  .status-dot-success {
    @apply status-dot bg-success-500;
  }
  
  .status-dot-warning {
    @apply status-dot bg-warning-500;
  }
  
  .status-dot-error {
    @apply status-dot bg-error-500;
  }
  
  .status-dot-neutral {
    @apply status-dot bg-neutral-400;
  }
  
  .status-dot-animated {
    @apply animate-pulse;
  }
  
  /* ===========================================
     PROGRESS BAR
     =========================================== */
  
  .progress {
    @apply h-2 bg-surface-tertiary rounded-full overflow-hidden;
  }
  
  .progress-bar {
    @apply h-full bg-brand-500 rounded-full;
    @apply transition-all duration-500 ease-out;
  }
  
  .progress-bar-success {
    @apply bg-success-500;
  }
  
  .progress-bar-striped {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
  }
  
  /* ===========================================
     SKELETON LOADER
     =========================================== */
  
  .skeleton {
    @apply bg-surface-tertiary rounded animate-pulse;
  }
  
  .skeleton-text {
    @apply skeleton h-4;
  }
  
  .skeleton-title {
    @apply skeleton h-6 w-1/3;
  }
  
  .skeleton-avatar {
    @apply skeleton w-10 h-10 rounded-full;
  }
  
  .skeleton-card {
    @apply skeleton h-48;
  }
  
  /* ===========================================
     DIVIDER
     =========================================== */
  
  .divider {
    @apply border-t border-border-default my-4;
  }
  
  .divider-vertical {
    @apply border-l border-border-default h-full mx-4;
  }
}

@layer utilities {
  /* ===========================================
     TEXT UTILITIES
     =========================================== */
  
  .text-balance {
    text-wrap: balance;
  }
  
  .text-gradient {
    @apply bg-clip-text text-transparent;
    @apply bg-gradient-to-r from-brand-500 to-brand-700;
  }
  
  /* ===========================================
     SCROLLBAR UTILITIES
     =========================================== */
  
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: var(--border-default) transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: var(--border-default);
    border-radius: 3px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: var(--text-tertiary);
  }
  
  /* ===========================================
     ANIMATION UTILITIES
     =========================================== */
  
  .animate-in {
    animation: animate-in 0.3s ease-out;
  }
  
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
  
  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(16px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* ===========================================
     ACCESSIBILITY UTILITIES
     =========================================== */
  
  .sr-only {
    @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
    clip: rect(0, 0, 0, 0);
  }
  
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2;
  }
  
  /* ===========================================
     RESPONSIVE VISIBILITY
     =========================================== */
  
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

---

## 2. Component Library Foundation

### 2.1 Base UI Components

```tsx
// src/components/ui/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500',
      secondary: 'bg-surface-secondary text-text-primary border border-border-default hover:bg-surface-tertiary active:bg-surface-secondary focus-visible:ring-brand-500',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary focus-visible:ring-brand-500',
      danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500',
      outline: 'bg-transparent border border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 focus-visible:ring-brand-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      icon: 'p-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

export { Button };
```

```tsx
// src/components/ui/Input/Input.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              error && 'input-error',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="input-error-message">{error}</p>}
        {helperText && !error && <p className="input-helper">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

```tsx
// src/components/ui/Card/Card.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface-elevated border border-border-default shadow-sm',
      interactive: 'bg-surface-elevated border border-border-default shadow-sm hover:shadow-md hover:border-brand-300/50 transition-all duration-200 cursor-pointer',
      elevated: 'bg-surface-elevated shadow-lg border border-border-default',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4 border-b border-border-default', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-text-primary', className)} {...props} />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-text-secondary mt-1', className)} {...props} />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-border-default bg-surface-secondary/50', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
```

```tsx
// src/components/ui/Modal/Modal.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from '../Button/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Lock body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      firstElement?.focus();
      document.addEventListener('keydown', handleTab);

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-surface-elevated rounded-xl shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200',
          sizes[size]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-border-default">
            <div>
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-4 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
```

```tsx
// src/components/ui/Select/Select.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input appearance-none pr-10',
              error && 'input-error',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary pointer-events-none" />
        </div>
        {error && <p className="input-error-message">{error}</p>}
        {helperText && !error && <p className="input-helper">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
```

```tsx
// src/components/ui/Progress/Progress.tsx
import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  showValue?: boolean;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  showValue = false,
  striped = false,
  animated = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const variants = {
    default: 'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-text-secondary">{label}</span>}
          {showValue && <span className="text-sm font-medium text-text-primary">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-surface-tertiary rounded-full overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variants[variant],
            striped && 'progress-bar-striped',
            animated && 'animate-progress'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
```

### 2.2 Utility Functions

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with tailwind-merge for proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number with commas for thousands
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-KE').format(num);
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return then.toLocaleDateString('en-KE');
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-KE', options || defaultOptions);
}

/**
 * Format datetime to locale string
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time remaining (e.g., "45:00")
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Validate Kenya National ID format
 */
export function validateNationalId(id: string): boolean {
  // 8 digits for old format or 14 digits for new format
  return /^\d{8}$|^\d{14}$/.test(id);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 3. State Management Patterns

### 3.1 Theme Manager

```typescript
// src/stores/theme.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: getSystemTheme(),

      setTheme: (theme: Theme) => {
        const resolvedTheme = getResolvedTheme(theme);
        
        // Apply to document
        if (theme === 'system') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
        }
        
        set({ theme, resolvedTheme });
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setTheme(state.theme);
        }
      },
    }
  )
);

// Initialize theme on mount
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    const { state } = JSON.parse(stored);
    if (state?.theme) {
      document.documentElement.setAttribute('data-theme', state.theme === 'system' ? getSystemTheme() : state.theme);
    }
  }
}
```

### 3.2 Auth Store

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'super_admin' | 'admin' | 'returning_officer' | 'sub_ro' | 'voter';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  county?: string;
  constituency?: string;
  ward?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiresAt: number | null;
  
  // Actions
  login: (user: User, token: string, expiresIn?: number) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      sessionExpiresAt: null,

      login: (user: User, token: string, expiresIn = 7200000) => { // 2 hours default
        const sessionExpiresAt = Date.now() + expiresIn;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiresAt,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkSession: () => {
        const { sessionExpiresAt, isAuthenticated } = get();
        if (!isAuthenticated || !sessionExpiresAt) return false;
        
        if (Date.now() > sessionExpiresAt) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
```

### 3.3 Voter Registration Store

```typescript
// src/stores/voter-registration.store.ts
import { create } from 'zustand';

export interface VoterRegistrationState {
  // Registration step (1-5)
  step: number;
  
  // Step 1: ID Verification
  nationalId: string;
  
  // Step 2: Personal Info (from NIIF)
  niifData: NIIFResponse | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: 'M' | 'F';
    dateOfBirth: string;
    county: string;
    constituency: string;
    ward: string;
  };
  
  // Step 3: Biometrics
  biometrics: {
    faceCapture: string | null; // Base64 or template reference
    fingerprints: FingerprintData[];
    livenessVerified: boolean;
  };
  
  // Step 4: Account
  account: {
    password: string;
    securityQuestions: SecurityAnswer[];
  };
  
  // UI State
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setNationalId: (id: string) => void;
  setNiifData: (data: NIIFResponse | null) => void;
  setPersonalInfo: (info: Partial<VoterRegistrationState['personalInfo']>) => void;
  setBiometrics: (biometrics: Partial<VoterRegistrationState['biometrics']>) => void;
  setAccount: (account: Partial<VoterRegistrationState['account']>) => void;
  setValidationError: (field: string, error: string) => void;
  clearValidationError: (field: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

interface NIIFResponse {
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  placeOfBirth: {
    county: string;
    constituency: string;
  };
}

interface FingerprintData {
  finger: string;
  template: string;
  quality: number;
}

interface SecurityAnswer {
  questionId: string;
  answer: string;
}

const initialState = {
  step: 1,
  nationalId: '',
  niifData: null,
  personalInfo: {
    firstName: '',
    lastName: '',
    gender: 'M' as const,
    dateOfBirth: '',
    county: '',
    constituency: '',
    ward: '',
  },
  biometrics: {
    faceCapture: null,
    fingerprints: [],
    livenessVerified: false,
  },
  account: {
    password: '',
    securityQuestions: [],
  },
  validationErrors: {},
  isSubmitting: false,
};

export const useVoterRegistrationStore = create<VoterRegistrationState>()((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  
  setNationalId: (nationalId) => set({ nationalId }),
  
  setNiifData: (niifData) => set({ niifData }),
  
  setPersonalInfo: (info) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...info },
    })),
  
  setBiometrics: (biometrics) =>
    set((state) => ({
      biometrics: { ...state.biometrics, ...biometrics },
    })),
  
  setAccount: (account) =>
    set((state) => ({
      account: { ...state.account, ...account },
    })),
  
  setValidationError: (field, error) =>
    set((state) => ({
      validationErrors: { ...state.validationErrors, [field]: error },
    })),
  
  clearValidationError: (field) =>
    set((state) => {
      const { [field]: _, ...rest } = state.validationErrors;
      return { validationErrors: rest };
    }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  reset: () => set(initialState),
}));
```

### 3.4 Voting Store

```typescript
// src/stores/voting.store.ts
import { create } from 'zustand';

export type BatchStatus = 'waiting' | 'active' | 'submitting' | 'completed';

export interface VotingState {
  // Batch management
  batchId: string | null;
  batchStatus: BatchStatus;
  positionInBatch: number;
  totalInBatch: number;
  timeRemaining: number;
  
  // Ballot
  positions: Position[];
  selections: Record<string, string>; // positionId -> candidateId
  
  // Submission
  isSubmitting: boolean;
  submissionProgress: SubmissionProgress | null;
  confirmation: VoteConfirmation | null;
  
  // UI State
  error: VotingError | null;
  
  // Actions
  setBatchInfo: (info: Partial<VotingState>) => void;
  setPositions: (positions: Position[]) => void;
  selectCandidate: (positionId: string, candidateId: string) => void;
  clearSelection: (positionId: string) => void;
  clearAllSelections: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setSubmissionProgress: (progress: SubmissionProgress | null) => void;
  setConfirmation: (confirmation: VoteConfirmation | null) => void;
  setError: (error: VotingError | null) => void;
  reset: () => void;
}

interface Position {
  id: string;
  title: string;
  description?: string;
  candidates: Candidate[];
  maxSelections: number;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  photo?: string;
  symbol?: string;
}

interface SubmissionProgress {
  stage: 'encrypting' | 'submitting' | 'confirming' | 'complete';
  message: string;
}

interface VoteConfirmation {
  confirmationNumber: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

interface VotingError {
  code: string;
  title: string;
  message: string;
}

const initialState = {
  batchId: null,
  batchStatus: 'waiting' as BatchStatus,
  positionInBatch: 0,
  totalInBatch: 0,
  timeRemaining: 0,
  positions: [],
  selections: {},
  isSubmitting: false,
  submissionProgress: null,
  confirmation: null,
  error: null,
};

export const useVotingStore = create<VotingState>()((set) => ({
  ...initialState,

  setBatchInfo: (info) => set(info),
  
  setPositions: (positions) => set({ positions }),
  
  selectCandidate: (positionId, candidateId) =>
    set((state) => ({
      selections: { ...state.selections, [positionId]: candidateId },
    })),
  
  clearSelection: (positionId) =>
    set((state) => {
      const { [positionId]: _, ...rest } = state.selections;
      return { selections: rest };
    }),
  
  clearAllSelections: () => set({ selections: {} }),
  
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  setSubmissionProgress: (submissionProgress) => set({ submissionProgress }),
  
  setConfirmation: (confirmation) => set({ confirmation }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
}));
```

---

## 4. TypeScript Type Definitions

### 4.1 Core Types

```typescript
// src/types/index.ts

// ===========================================
// USER & AUTH TYPES
// ===========================================

export type UserRole = 'super_admin' | 'admin' | 'returning_officer' | 'sub_ro' | 'voter';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// ===========================================
// VOTER TYPES
// ===========================================

export type RegistrationStatus = 'not_registered' | 'pending' | 'verified' | 'rejected';

export interface VoterProfile {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  email?: string;
  phone?: string;
  county: string;
  constituency: string;
  ward: string;
  registrationStatus: RegistrationStatus;
  biometricsEnrolled: {
    face: boolean;
    fingerprints: boolean;
  };
  registeredAt?: string;
  verifiedAt?: string;
}

export interface VoterRegistrationData {
  nationalId: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  county: string;
  constituency: string;
  ward: string;
  email?: string;
  phone?: string;
  faceTemplate: string;
  fingerprints: FingerprintData[];
  password: string;
  securityQuestions: SecurityAnswer[];
}

export interface FingerprintData {
  finger: string;
  template: string;
  quality: number;
}

export interface SecurityAnswer {
  questionId: string;
  answer: string;
}

// ===========================================
// ELECTION TYPES
// ===========================================

export type ElectionStatus = 'draft' | 'published' | 'registration_open' | 'voting_open' | 'voting_closed' | 'results_published' | 'cancelled';

export interface Election {
  id: string;
  name: string;
  type: 'general' | 'by-election' | 'primary';
  status: ElectionStatus;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  positions: Position[];
  counties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  description?: string;
  level: 'national' | 'county' | 'constituency' | 'ward';
  maxCandidates: number;
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  partySymbol?: string;
  photo?: string;
  bio?: string;
  county?: string;
  constituency?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

// ===========================================
// COUNTY & LOCATION TYPES
// ===========================================

export interface County {
  code: string;
  name: string;
  region: string;
  constituencies: Constituency[];
}

export interface Constituency {
  code: string;
  name: string;
  countyCode: string;
  wards: Ward[];
}

export interface Ward {
  code: string;
  name: string;
  constituencyCode: string;
}

// ===========================================
// VOTING TYPES
// ===========================================

export interface Batch {
  id: string;
  electionId: string;
  status: BatchStatus;
  position: number;
  totalVoters: number;
  votesCollected: number;
  startTime?: string;
  endTime?: string;
}

export type BatchStatus = 'waiting' | 'active' | 'submitting' | 'completed' | 'expired';

export interface VoteSubmission {
  batchId: string;
  encryptedVote: string;
  zkProof: string;
  timestamp: number;
}

export interface VoteConfirmation {
  confirmationNumber: string;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  electionId: string;
  voterId: string;
}

// ===========================================
// ADMIN TYPES
// ===========================================

export interface ReturningOfficer {
  id: string;
  userId: string;
  user: User;
  county: County;
  status: 'pending' | 'approved' | 'suspended';
  assignedAt?: string;
  approvedBy?: string;
}

export interface DashboardStats {
  voters: {
    total: number;
    registered: number;
    verified: number;
    pending: number;
    change: number;
  };
  votes: {
    total: number;
    turnout: number;
    lastHour: number;
  };
  counties: {
    total: number;
    active: number;
  };
  ro: {
    total: number;
    approved: number;
    pending: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'ro_application' | 'candidate' | 'election' | 'vote' | 'system';
  action: string;
  details: string;
  timestamp: string;
  user?: string;
  status: 'success' | 'warning' | 'error';
}

// ===========================================
// NOTIFICATION TYPES
// ===========================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===========================================
// FORM TYPES
// ===========================================

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}
```

---

## 5. Layout & Navigation Systems

### 5.1 Main Layout Component

```tsx
// src/components/layout/MainLayout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import {
  HomeIcon,
  UserGroupIcon,
  MapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigationByRole = {
  super_admin: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Returning Officers', href: '/admin/returning-officers', icon: UserGroupIcon },
    { name: 'Counties', href: '/admin/counties', icon: MapIcon },
    { name: 'Candidates', href: '/admin/candidates', icon: DocumentTextIcon },
    { name: 'Elections', href: '/admin/elections', icon: ChartBarIcon },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Returning Officers', href: '/admin/returning-officers', icon: UserGroupIcon },
    { name: 'Counties', href: '/admin/counties', icon: MapIcon },
    { name: 'Candidates', href: '/admin/candidates', icon: DocumentTextIcon },
    { name: 'Elections', href: '/admin/elections', icon: ChartBarIcon },
  ],
  returning_officer: [
    { name: 'Dashboard', href: '/ro', icon: HomeIcon },
    { name: 'Voters', href: '/ro/voters', icon: UserGroupIcon },
    { name: 'Candidates', href: '/ro/candidates', icon: DocumentTextIcon },
    { name: 'Sub-ROs', href: '/ro/sub-officers', icon: UserGroupIcon },
    { name: 'Elections', href: '/ro/elections', icon: ChartBarIcon },
    { name: 'Reports', href: '/ro/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/ro/settings', icon: Cog6ToothIcon },
  ],
  sub_ro: [
    { name: 'Dashboard', href: '/ro', icon: HomeIcon },
    { name: 'Voters', href: '/ro/voters', icon: UserGroupIcon },
    { name: 'Reports', href: '/ro/reports', icon: ChartBarIcon },
  ],
  voter: [], // Voter doesn't have sidebar
};

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const role = user?.role || 'voter';
  const navigation = navigationByRole[role] || [];

  // For voter role, use simpler layout
  if (role === 'voter') {
    return (
      <div className="min-h-screen bg-surface-primary">
        <header className="bg-surface-elevated border-b border-border-default sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/voter" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IEBC</span>
                </div>
                <span className="font-semibold text-text-primary hidden sm:block">Online Voting</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link
                  href="/voter/notifications"
                  className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span className="sr-only">Notifications</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                    <span className="text-brand-700 font-medium text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-800">
          <Link href={role === 'super_admin' || role === 'admin' ? '/admin' : '/ro'} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IEBC</span>
            </div>
            <span className="font-semibold">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="bg-surface-elevated border-b border-border-default sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/notifications"
                className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="sr-only">Notifications</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                  <span className="text-brand-700 font-medium text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-tertiary capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
```

### 5.2 Theme Toggle Component

```tsx
// src/components/layout/ThemeToggle.tsx
'use client';

import { useThemeStore, type Theme } from '@/stores/theme.store';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const themes: { value: Theme; label: string; icon: JSX.Element }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="relative flex items-center bg-surface-secondary border border-border-default rounded-full p-1"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
            theme === t.value
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary'
          )}
          role="radio"
          aria-checked={theme === t.value}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 6. Responsive Design Strategy

### 6.1 Breakpoint System

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `xs` | 0px | Extra small devices |
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 6.2 Responsive Component Patterns

```tsx
// Example: Responsive Grid Component
export function StatsGrid({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

// Example: Responsive Navigation
export function TabNavigation({ tabs }: { tabs: Tab[] }) {
  return (
    <div className="border-b border-border-default">
      {/* Mobile: Horizontal scroll */}
      <nav className="flex gap-x-6 overflow-x-auto hide-scrollbar -mb-px sm:mb-0">
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} className="whitespace-nowrap" />
        ))}
      </nav>
      
      {/* Desktop: Full visible */}
      <nav className="hidden sm:flex gap-x-6 -mb-px">
        {tabs.map((tab) => (
          <TabButton key={tab.id} tab={tab} />
        ))}
      </nav>
    </div>
  );
}

// Example: Responsive Card Layout
export function CardGrid({ cards }: { cards: CardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {cards.map((card) => (
        <Card key={card.id} className="md:break-none" {...card} />
      ))}
    </div>
  );
}
```

---

## 7. Theme System (Light/Dark/System)

### 7.1 Theme Initialization

```tsx
// src/app/providers.tsx
'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/theme.store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
```

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IEBC Online Voting',
  description: 'Secure blockchain-based voting system for Kenya',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 8. Accessibility Requirements

### 8.1 WCAG 2.2 Level AA Compliance Checklist

- [ ] **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Focus Indicators**: Visible focus rings on all interactive elements
- [ ] **Keyboard Navigation**: All functionality accessible via keyboard
- [ ] **Screen Reader Support**: Proper ARIA labels and semantic HTML
- [ ] **Form Labels**: All inputs have associated labels
- [ ] **Error Messages**: Clear, actionable error messages
- [ ] **Skip Links**: Skip to main content link
- [ ] **Heading Hierarchy**: Proper h1-h6 structure
- [ ] **Alt Text**: Descriptive alt text for images
- [ ] **Motion**: Respect prefers-reduced-motion

### 8.2 Accessibility Utilities

```tsx
// src/components/ui/VisuallyHidden.tsx
import { cn } from '@/lib/utils';

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function VisuallyHidden({ children, className, ...props }: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        'clip-rect(0, 0, 0, 0)',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Usage: <VisuallyHidden>Label for screen readers</VisuallyHidden>
```

```tsx
// src/components/ui/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}
```

---

## 9. Security-First Design Patterns

### 9.1 Session Timeout Indicator

```tsx
// src/components/security/SessionTimeout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { AlertTriangleIcon } from '@heroicons/react/24/outline';

export function SessionTimeout() {
  const { sessionExpiresAt, checkSession } = useAuthStore();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!sessionExpiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(0, sessionExpiresAt - Date.now());
      setTimeRemaining(remaining);
      
      // Show warning at 5 minutes
      if (remaining <= 300000 && remaining > 0) {
        setShowWarning(true);
      }
      
      // Check session validity
      if (!checkSession()) {
        window.location.href = '/login?reason=session_expired';
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt, checkSession]);

  if (!showWarning || !timeRemaining) return null;

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  return (
    <div className="fixed bottom-4 right-4 bg-warning-50 border border-warning-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-800">Session Expiring</p>
          <p className="text-sm text-warning-700">
            Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
          <button
            onClick={() => setShowWarning(false)}
            className="mt-2 text-xs text-warning-800 hover:underline"
          >
            Continue working
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 9.2 Biometric Privacy Components

```tsx
// src/components/biometric/BiometricStatus.tsx
interface BiometricStatusProps {
  faceEnrolled: boolean;
  fingerprintsEnrolled: boolean;
  showDetails?: boolean;
}

export function BiometricStatus({ faceEnrolled, fingerprintsEnrolled, showDetails = false }: BiometricStatusProps) {
  const isComplete = faceEnrolled && fingerprintsEnrolled;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${faceEnrolled ? 'bg-success-500' : 'bg-neutral-300'}`} />
        <span className="text-sm text-text-secondary">
          Face Recognition {faceEnrolled ? '✓ Enrolled' : '✗ Not Enrolled'}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${fingerprintsEnrolled ? 'bg-success-500' : 'bg-neutral-300'}`} />
        <span className="text-sm text-text-secondary">
          Fingerprints {fingerprintsEnrolled ? '✓ Enrolled' : '✗ Not Enrolled'}
        </span>
      </div>

      {showDetails && isComplete && (
        <p className="text-xs text-text-tertiary pt-2">
          Your biometric templates are securely encrypted and stored. Original biometric data is never displayed or transmitted.
        </p>
      )}
    </div>
  );
}
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS with custom theme
- [ ] Implement design tokens in CSS variables
- [ ] Create base UI components (Button, Input, Card, Modal)
- [ ] Set up Zustand stores and theme system

### Phase 2: Layout & Navigation (Week 2-3)
- [ ] Build responsive layout components
- [ ] Implement sidebar navigation with role-based menus
- [ ] Create theme toggle component
- [ ] Add session timeout indicator

### Phase 3: Core Features (Week 3-5)
- [ ] Build voter registration flow (5-step wizard)
- [ ] Implement voter dashboard
- [ ] Create voting interface with batch management
- [ ] Build admin dashboard
- [ ] Build RO dashboard

### Phase 4: Polish & Accessibility (Week 5-6)
- [ ] Complete accessibility audit (WCAG 2.2 AA)
- [ ] Add keyboard navigation
- [ ] Implement screen reader support
- [ ] Add loading states and error handling
- [ ] Performance optimization

---

## File Structure Summary

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles + design tokens
│   │   ├── layout.tsx           # Root layout
│   │   ├── providers.tsx       # Context providers
│   │   └── (auth)/             # Auth routes
│   │   └── (voter)/            # Voter routes
│   │   └── (admin)/            # Admin routes
│   │
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Select/
│   │   │   ├── Progress/
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── MainLayout/
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   └── ThemeToggle/
│   │   │
│   │   ├── forms/              # Form components
│   │   ├── biometric/          # Biometric components
│   │   └── security/          # Security components
│   │
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities
│   ├── services/               # API services
│   ├── stores/                 # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── theme.store.ts
│   │   ├── voter-registration.store.ts
│   │   └── voting.store.ts
│   │
│   └── types/                  # TypeScript types
│       └── index.ts
│
├── tailwind.config.ts
└── package.json
```

---

**Foundation Complete** - Ready for developer implementation

This technical foundation provides:
- Scalable CSS architecture with design tokens
- Reusable component library
- Type-safe state management
- Responsive design patterns
- Built-in accessibility
- Security-first patterns
- Theme system (light/dark/system)

Developers can now confidently build features using these established patterns.
