# IEBC Blockchain Voting System - UI Design System

## Project Overview

Professional, trustworthy, secure, democratic - a blockchain voting system supporting 20M+ voters with 5,000 votes/second throughput.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing System](#4-spacing-system)
5. [Component Library](#5-component-library)
6. [Page Layouts](#6-page-layouts)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility](#8-accessibility)
9. [Interaction Patterns](#9-interaction-patterns)

---

## 1. Brand Identity

### Visual Personality
- **Professional**: Clean lines, authoritative design
- **Trustworthy**: Secure visual cues, verified badges
- **Secure**: Lock icons, shield imagery, encryption indicators
- **Democratic**: Inclusive, accessible, warm

### Role-Based Color Themes
Each system role has a distinct color theme for visual differentiation:

| Role | Color | Hex | Psychological Meaning |
|------|-------|-----|----------------------|
| Super Admin | Purple | `#7C3AED` | Authority, oversight |
| Admin | Blue | `#2563EB` | Trust, professionalism |
| Returning Officer | Green | `#059669` | County operations, growth |
| Voter | Orange | `#EA580C` | Warmth, accessibility |

---

## 2. Color System

### Role Colors (Full Palette)

```css
/* Super Admin - Purple */
--color-super-admin-50: #F5F3FF;
--color-super-admin-100: #EDE9FE;
--color-super-admin-200: #DDD6FE;
--color-super-admin-300: #C4B5FD;
--color-super-admin-400: #A78BFA;
--color-super-admin-500: #7C3AED;
--color-super-admin-600: #6D28D9;
--color-super-admin-700: #5B21B6;
--color-super-admin-800: #4C1D95;
--color-super-admin-900: #3B0764;

/* Admin - Blue */
--color-admin-50: #EFF6FF;
--color-admin-100: #DBEAFE;
--color-admin-200: #BFDBFE;
--color-admin-300: #93C5FD;
--color-admin-400: #60A5FA;
--color-admin-500: #2563EB;
--color-admin-600: #1D4ED8;
--color-admin-700: #1E40AF;
--color-admin-800: #1E3A8A;
--color-admin-900: #172554;

/* Returning Officer - Green */
--color-ro-50: #ECFDF5;
--color-ro-100: #D1FAE5;
--color-ro-200: #A7F3D0;
--color-ro-300: #6EE7B7;
--color-ro-400: #34D399;
--color-ro-500: #059669;
--color-ro-600: #047857;
--color-ro-700: #065F46;
--color-ro-800: #064E3B;
--color-ro-900: #022C22;

/* Voter - Orange */
--color-voter-50: #FFF7ED;
--color-voter-100: #FFEDD5;
--color-voter-200: #FED7AA;
--color-voter-300: #FDBA74;
--color-voter-400: #FB923C;
--color-voter-500: #EA580C;
--color-voter-600: #D97706;
--color-voter-700: #C2410C;
--color-voter-800: #9A3412;
--color-voter-900: #7C2D12;
```

### Semantic Colors

| Purpose | Color | Hex | Light Variant | Dark Variant |
|---------|-------|-----|---------------|--------------|
| Success | Emerald | `#10B981` | `#D1FAE5` | `#047857` |
| Warning | Amber | `#F59E0B` | `#FEF3C7` | `#B45309` |
| Error | Red | `#EF4444` | `#FEE2E2` | `#B91C1C` |
| Info | Sky | `#0EA5E9` | `#E0F2FE` | `#0369A1` |

### Neutral Palette

```css
--color-neutral-50: #F9FAFB;
--color-neutral-100: #F3F4F6;
--color-neutral-200: #E5E7EB;
--color-neutral-300: #D1D5DB;
--color-neutral-400: #9CA3AF;
--color-neutral-500: #6B7280;
--color-neutral-600: #4B5563;
--color-neutral-700: #374151;
--color-neutral-800: #1F2937;
--color-neutral-900: #111827;
--color-neutral-950: #030712;
```

### Surface Colors

```css
--color-surface-primary: #FFFFFF;
--color-surface-secondary: #F9FAFB;
--color-surface-tertiary: #F3F4F6;
--color-surface-overlay: rgba(0, 0, 0, 0.5);
--color-surface-backdrop: rgba(255, 255, 255, 0.8);
```

### Text Colors

```css
--color-text-primary: #111827;
--color-text-secondary: #4B5563;
--color-text-tertiary: #9CA3AF;
--color-text-inverse: #FFFFFF;
--color-text-link: #2563EB;
--color-text-link-hover: #1D4ED8;
```

### Border Colors

```css
--color-border-default: #E5E7EB;
--color-border-strong: #D1D5DB;
--color-border-focus: #2563EB;
--color-border-error: #EF4444;
--color-border-success: #10B981;
```

### IEBC Brand Colors

```css
--color-iebc-primary: #1E40AF;
--color-iebc-secondary: #059669;
--color-iebc-accent: #F59E0B;
--color-iebc-dark: #0F172A;
```

---

## 3. Typography System

### Font Families

```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
--font-family-display: 'Inter', system-ui, sans-serif;
```

### Font Sizes (1.25 Ratio)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--font-size-xs` | 12px | 1rem | Badges, captions |
| `--font-size-sm` | 14px | 1.25rem | Secondary text, labels |
| `--font-size-base` | 16px | 1.5rem | Body text |
| `--font-size-lg` | 18px | 1.75rem | Lead text |
| `--font-size-xl` | 20px | 1.75rem | H4, subtitles |
| `--font-size-2xl` | 24px | 2rem | H3, section titles |
| `--font-size-3xl` | 30px | 2.25rem | H2, page titles |
| `--font-size-4xl` | 36px | 2.5rem | H1, hero text |
| `--font-size-5xl` | 48px | 1 | Display text |
| `--font-size-6xl` | 60px | 1 | Landing hero |

### Font Weights

```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Line Heights

```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

---

## 4. Spacing System (8px Grid)

```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */

/* Semantic */
--space-xs: var(--space-1);
--space-sm: var(--space-2);
--space-md: var(--space-4);
--space-lg: var(--space-6);
--space-xl: var(--space-8);
--space-2xl: var(--space-12);
--space-3xl: var(--space-16);
--space-section: var(--space-24);
```

---

## 5. Component Library

### Buttons

| Variant | Purpose | Background | Border |
|---------|---------|------------|--------|
| Primary | Main CTA | `--color-primary-500` | None |
| Secondary | Secondary actions | Transparent | `--color-primary-500` |
| Ghost | Tertiary, toolbar | Transparent | None |
| Danger | Destructive | `--color-error` | None |
| Success | Confirm/approve | `--color-success` | None |

**Sizes**: sm (32px), md (40px), lg (48px), xl (56px)

### Inputs

- Text, Select, Textarea
- Focus: 2px primary border + ring shadow
- Error: Red border + error message
- Disabled: Gray background

### Cards

| Variant | Use Case |
|---------|----------|
| Default | Standard content |
| Elevated | Featured content |
| Outlined | Subtle separation |
| Interactive | Clickable items |

### Modals

| Size | Max Width | Use Case |
|------|-----------|----------|
| sm | 400px | Confirmations |
| md | 560px | Forms |
| lg | 720px | Complex content |
| xl | 960px | Data views |
| full | 100vw | Full-screen workflows |

### Badges

- Variants: success, warning, error, info, neutral
- Sizes: sm, md, lg
- Optional pulse animation

---

## 6. Page Layouts

### Voter Registration (5-Step Flow)

1. **ID Verification**: National ID input, NIIF verification
2. **Personal Info**: Auto-filled from NIIF, location selectors
3. **Biometrics**: Face capture, 10-finger scanner UI
4. **Account**: Password with strength meter, security questions
5. **Confirmation**: Summary review, submission

### Voter Dashboard

- Status cards (registration, biometric, voter ID)
- Upcoming elections with countdown
- Quick actions grid
- Election countdown banner

### Vote Page

- Batch status panel (position, time, heartbeat)
- Ballot display with position cards
- Confirmation modal with progress
- Success screen with transaction hash

### Admin Dashboard

- Stats grid (voters, votes, counties, ROs)
- Election overview with live progress
- Activity feed with timeline
- Quick actions

### RO Dashboard

- Welcome header with county
- Stats grid (voters, candidates, votes, turnout)
- Voting progress with polling station status
- Pending approvals list

---

## 7. Responsive Design

### Breakpoints

| Name | Width | Target |
|------|-------|--------|
| xs | 0 | Small phones |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

### Responsive Patterns

- **Mobile**: Single column, full-width buttons, bottom navigation
- **Tablet**: 2-column grids, collapsible sidebar
- **Desktop**: Full layout, expanded sidebar, multi-column tables

---

## 8. Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- Normal text: **4.5:1** ratio
- Large text (18px+): **3:1** ratio
- UI components: **3:1** ratio

#### Focus Indicators
- Visible focus ring on all interactive elements
- 2px minimum, high contrast
- 2px offset

#### Touch Targets
- Minimum **44×44px**
- Adequate spacing between targets

#### Keyboard Navigation
- Logical tab order
- Skip links for main content
- Focus traps in modals

#### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Live regions for dynamic content

---

## 9. Interaction Patterns

### Loading States

- **Button Loading**: Spinner replaces text, disabled
- **Skeleton Screen**: Animated shimmer gradient
- **Spinner**: Role-based colors, sizes sm/md/lg

### Error States

- **Inline Error**: Red border, icon + message below
- **Error Alert**: Left border, title + message + action
- **Form Validation**: Real-time with recovery actions

### Empty States

- Centered icon (64px)
- Title (xl, semibold)
- Description (base, secondary)
- Primary action button

### Success States

- **Toast**: Auto-dismiss, colored by type
- **Success Page**: Large checkmark animation, confirmation number, transaction hash

---

## Implementation Files

### Design Tokens
- `frontend/styles/design-tokens.css` - Complete CSS custom properties

### Tailwind Config
- `frontend/tailwind.config.ts` - Full Tailwind configuration

### Components
- `frontend/components/ui/index.tsx` - Base UI components
- `frontend/components/layout/index.tsx` - Layout components
- `frontend/components/pages/VoterRegistration.tsx` - 5-step registration
- `frontend/components/pages/VoterDashboard.tsx` - Voter dashboard
- `frontend/components/pages/Vote.tsx` - Vote casting page
- `frontend/components/pages/AdminDashboard.tsx` - Admin dashboard
- `frontend/components/pages/RODashboard.tsx` - RO dashboard

---

## Usage

### Using Components

```tsx
import { Button, Input, Card, Badge, Modal, ProgressBar } from './components/ui';
import { Layout, Sidebar, Header } from './components/layout';

// Button with variants
<Button variant="primary" size="md">Click Me</Button>

// Input with validation
<Input label="Email" error="Invalid email" helperText="We'll never share" />

// Card with different styles
<Card variant="interactive" padding="lg">Content</Card>

// Layout for admin
<Layout role="admin" sidebarItems={items} title="Dashboard" />
```

### Using Role Themes

```css
/* Apply role theme */
<body data-theme="voter">
  <!-- Or -->
<body data-theme="admin">
  <!-- Or -->
<body data-theme="returning-officer">
  <!-- Or -->
<body data-theme="super-admin">
```

---

## Design Principles Summary

1. **Trust & Security**: Lock icons, shields, verified badges, encryption indicators
2. **Accessibility First**: 4.5:1 contrast, 44px touch targets, keyboard navigation
3. **Progressive Disclosure**: Show only necessary information, expand as needed
4. **Role-Based Design**: Distinct color themes for each user type
5. **Responsive**: Mobile-first, adapts across all breakpoints

---

**UI Designer**: Design System v1.0  
**Date**: March 28, 2026  
**Implementation**: Ready for developer handoff
