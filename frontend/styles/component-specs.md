# Component Design Specifications

## IEBC Blockchain Voting System

---

## Table of Contents

1. [Button Component](#1-button-component)
2. [Input Components](#2-input-components)
3. [Card Components](#3-card-components)
4. [Modal Components](#4-modal-components)
5. [Status Components](#5-status-components)
6. [Navigation Components](#6-navigation-components)
7. [Form Components](#7-form-components)
8. [Data Display Components](#8-data-display-components)

---

## 1. Button Component

### Variants

#### Primary Button
- **Purpose**: Main call-to-action
- **Background**: `var(--color-primary-500)` (role-based)
- **Text**: White (`#FFFFFF`)
- **Border**: None
- **Padding**: `12px 24px` (py-3 px-6)
- **Border Radius**: `var(--radius-lg)` (8px)
- **Font Weight**: 600
- **Hover**: Darken 10%, lift shadow
- **Active**: Scale 0.98
- **Focus**: Ring shadow `0 0 0 3px rgb(primary / 0.4)`

#### Secondary Button
- **Purpose**: Secondary actions
- **Background**: Transparent
- **Text**: `var(--color-primary-500)`
- **Border**: `1px solid var(--color-primary-500)`
- **Padding**: `12px 24px`
- **Border Radius**: `var(--radius-lg)`
- **Hover**: Background `var(--color-primary-50)`
- **Active**: Scale 0.98

#### Ghost Button
- **Purpose**: Tertiary actions, toolbar
- **Background**: Transparent
- **Text**: `var(--color-neutral-700)`
- **Border**: None
- **Padding**: `8px 16px`
- **Hover**: Background `var(--color-neutral-100)`
- **Active**: Scale 0.98

#### Danger Button
- **Purpose**: Destructive actions
- **Background**: `var(--color-error)`
- **Text**: White
- **Hover**: `var(--color-error-dark)`
- **Focus**: Ring `0 0 0 3px rgb(error / 0.4)`

#### Success Button
- **Purpose**: Confirm/approve actions
- **Background**: `var(--color-success)`
- **Text**: White
- **Hover**: `var(--color-success-dark)`

### Size Variants

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| sm | 32px | px-3 py-1.5 | 14px | 6px |
| md | 40px | px-4 py-2 | 16px | 8px |
| lg | 48px | px-6 py-3 | 18px | 10px |
| xl | 56px | px-8 py-4 | 20px | 12px |

### States

| State | Visual Treatment |
|-------|------------------|
| Default | Base styling |
| Hover | Background darken 10%, translateY(-1px), shadow-md |
| Active | Scale 0.98, shadow-sm |
| Focus | Ring shadow, outline-offset |
| Disabled | Opacity 0.5, cursor not-allowed |
| Loading | Spinner icon, text hidden, opacity 0.8 |

### Icon Buttons

- **Square**: Equal width/height
- **Icon + Text**: Icon 20px, gap 8px
- **Icon Only**: Center icon, aria-label required

---

## 2. Input Components

### Text Input

#### Default State
- **Background**: White (`#FFFFFF`)
- **Border**: `1px solid var(--color-neutral-300)`
- **Border Radius**: `var(--radius-md)` (6px)
- **Padding**: `12px 16px` (py-3 px-4)
- **Font Size**: 16px (prevents iOS zoom)
- **Placeholder**: `var(--color-neutral-400)`

#### Focus State
- **Border**: `2px solid var(--color-primary-500)`
- **Shadow**: `0 0 0 3px rgb(primary / 0.1)`
- **Outline**: None

#### Error State
- **Border**: `1px solid var(--color-error)`
- **Shadow**: `0 0 0 3px rgb(error / 0.1)`
- **Error Message**: Red text below, 14px

#### Disabled State
- **Background**: `var(--color-neutral-100)`
- **Border**: `1px solid var(--color-neutral-200)`
- **Text**: `var(--color-neutral-400)`
- **Cursor**: Not-allowed

#### Success State
- **Border**: `1px solid var(--color-success)`
- **Shadow**: `0 0 0 3px rgb(success / 0.1)`
- **Icon**: Checkmark on right

### Select Dropdown

- Same sizing as Text Input
- Custom dropdown arrow (chevron)
- Option hover: `var(--color-primary-50)`
- Selected option: `var(--color-primary-100)` + checkmark

### Textarea

- Min height: 120px
- Resize: vertical only
- Same border/focus states as Input

### Checkbox & Radio

- **Size**: 20px × 20px
- **Border Radius**: 4px (checkbox), full (radio)
- **Focus**: Ring shadow
- **Checked**: Primary color background + white icon
- **Label**: 16px, gap 12px from control

### Toggle Switch

- **Width**: 48px
- **Height**: 24px
- **Knob**: 20px circle
- **Transition**: 200ms ease
- **On State**: Primary color background
- **Off State**: Neutral gray background

---

## 3. Card Components

### Base Card

- **Background**: White
- **Border**: `1px solid var(--color-neutral-200)`
- **Border Radius**: `var(--radius-xl)` (12px)
- **Padding**: 24px
- **Shadow**: `var(--shadow-sm)`
- **Transition**: All 200ms ease

### Interactive Card

- **Hover**: Shadow `var(--shadow-md)`, translateY(-2px)
- **Active**: Shadow `var(--shadow-sm)`, translateY(0)
- **Cursor**: Pointer
- **Focus**: Ring outline

### Elevated Card

- **Background**: White
- **Border**: None
- **Shadow**: `var(--shadow-lg)`
- **Padding**: 32px

### Outlined Card

- **Background**: Transparent
- **Border**: `2px solid var(--color-neutral-200)`
- **Shadow**: None

### Status Card (Dashboard Stats)

- **Layout**: Icon + Value + Label + Trend
- **Icon**: 40px, rounded, light background
- **Value**: 2xl font, bold
- **Label**: sm font, neutral color
- **Trend**: Green up / Red down arrow + percentage

### Card Header

- **Border Bottom**: `1px solid var(--color-neutral-200)`
- **Padding Bottom**: 16px
- **Title**: lg font, semibold
- **Actions**: Right-aligned buttons/icons

---

## 4. Modal Components

### Size Variants

| Size | Max Width | Use Case |
|------|-----------|----------|
| sm | 400px | Confirmations, alerts |
| md | 560px | Forms, small content |
| lg | 720px | Complex forms, tables |
| xl | 960px | Large data views |
| full | 100vw | Full-screen workflows |

### Structure

```
┌─────────────────────────────────────┐
│  Header                             │
│  ┌─────────────┬─────────────────┐ │
│  │ Title       │ Close (X)       │ │
│  └─────────────┴─────────────────┘ │
├─────────────────────────────────────┤
│  Body                               │
│  (Scrollable content area)           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Footer                             │
│  ┌───────────────────────────────┐ │
│  │ [Cancel]          [Confirm]   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Styling

- **Background Overlay**: `rgba(0, 0, 0, 0.5)`
- **Modal Background**: White
- **Border Radius**: `var(--radius-2xl)` (16px)
- **Shadow**: `var(--shadow-2xl)`
- **Padding**: 24px
- **Animation**: Scale in + fade in (200ms)

### Header

- **Title**: xl font, semibold
- **Close Button**: 32px, ghost variant, top-right
- **Border Bottom**: Optional separator

### Body

- **Max Height**: 70vh (scrollable)
- **Padding**: 0 (flush with edges)
- **Content Padding**: 24px

### Footer

- **Border Top**: `1px solid var(--color-neutral-200)`
- **Padding Top**: 16px
- **Layout**: Flex, gap 12px, right-aligned
- **Sticky**: Optional, for mobile

---

## 5. Status Components

### Badge

#### Variants

| Variant | Background | Text | Use |
|---------|------------|------|-----|
| success | success-light | success-dark | Verified, Complete |
| warning | warning-light | warning-dark | Pending, Attention |
| error | error-light | error-dark | Failed, Rejected |
| info | info-light | info-dark | In Progress |
| neutral | neutral-100 | neutral-700 | Default |

#### Sizes

- **sm**: px-2 py-0.5, text-xs
- **md**: px-2.5 py-1, text-sm
- **lg**: px-3 py-1.5, text-base

### Status Indicator

- **Type**: Dot + Text
- **Dot Size**: 8px (sm), 10px (md), 12px (lg)
- **Colors**: success, warning, error, info, neutral
- **Pulse Animation**: For active/live states

### Progress Bar

- **Height**: 8px (sm), 12px (md), 16px (lg)
- **Background**: `var(--color-neutral-200)`
- **Fill**: Primary color (role-based)
- **Border Radius**: Full
- **Animation**: Smooth fill transition
- **Label**: Optional percentage above

### Step Indicator (Multi-step Forms)

- **Layout**: Horizontal steps with connecting line
- **Step Circle**: 32px, number or checkmark
- **States**:
  - Completed: Primary fill, checkmark
  - Current: Primary fill, number
  - Pending: Neutral border, number
- **Connector**: 2px line, primary when completed
- **Label**: Step name below, text-sm

---

## 6. Navigation Components

### Sidebar

- **Width**: 280px (expanded), 72px (collapsed)
- **Background**: White
- **Border Right**: `1px solid var(--color-neutral-200)`
- **Items**: Full-width buttons
- **Item Height**: 48px
- **Item Padding**: 16px
- **Icon Size**: 20px
- **Active Item**: Primary background (light), primary text
- **Hover**: `var(--color-neutral-100)` background
- **Badge**: Red dot or count on right
- **Collapse Button**: Bottom of sidebar

### Header

- **Height**: 64px
- **Background**: White
- **Border Bottom**: `1px solid var(--color-neutral-200)`
- **Left**: Logo + Title
- **Center**: Search bar (optional)
- **Right**: Notifications + Profile dropdown
- **Sticky**: Fixed at top

### Tabs

- **Style**: Underline (default), Pill, Boxed
- **Underline**: 2px bottom border, primary when active
- **Pill**: Rounded full, light background when active
- **Height**: 40px
- **Gap**: 8px between tabs

### Breadcrumb

- **Separator**: Chevron (/) or slash
- **Link Color**: `var(--color-text-link)`
- **Current Page**: `var(--color-text-secondary)`, not linked
- **Hover**: Underline

---

## 7. Form Components

### Form Field

```
┌────────────────────────────────────────┐
│ Label (required indicator *)           │
├────────────────────────────────────────┤
│ Input / Select / Textarea              │
├────────────────────────────────────────┤
│ Helper Text (optional, gray)           │
│ Error Message (required, red)         │
└────────────────────────────────────────┘
```

### Label

- **Font Size**: 14px
- **Font Weight**: 500
- **Color**: `var(--color-neutral-700)`
- **Required**: Red asterisk (*)
- **Gap**: 8px from input

### Helper Text

- **Font Size**: 14px
- **Color**: `var(--color-neutral-500)`
- **Margin Top**: 4px

### Error Message

- **Font Size**: 14px
- **Color**: `var(--color-error)`
- **Icon**: Exclamation circle (left)
- **Margin Top**: 4px

### Form Section

- **Group**: Related fields together
- **Title**: Section header, semibold, mb-4
- **Description**: Optional, below title
- **Fields**: Grid or stacked layout

### Password Field

- **Requirements**:
  - Show/hide toggle
  - Strength meter (4 segments)
  - Requirements list (checkmarks)
- **Strength Levels**:
  - Weak: Red, 1 segment
  - Fair: Orange, 2 segments
  - Good: Yellow, 3 segments
  - Strong: Green, 4 segments

---

## 8. Data Display Components

### Data Table

#### Structure

```
┌────────────────────────────────────────────────────┐
│ Table Header                                       │
│ ┌──────────┬──────────┬──────────┬──────────────┐ │
│ │ Header 1│ Header 2│ Header 3│ Actions      │ │
│ └──────────┴──────────┴──────────┴──────────────┘ │
├────────────────────────────────────────────────────┤
│ Table Body                                         │
│ ┌──────────┬──────────┬──────────┬──────────────┐ │
│ │ Cell 1   │ Cell 2   │ Cell 3   │ [Edit][Del] │ │
│ ├──────────┼──────────┼──────────┼──────────────┤ │
│ │ Cell 1   │ Cell 2   │ Cell 3   │ [Edit][Del] │ │
│ └──────────┴──────────┴──────────┴──────────────┘ │
├────────────────────────────────────────────────────┤
│ Pagination                                         │
│ [< Prev] 1 2 3 ... 10 [Next >]  |  Showing 1-10   │
└────────────────────────────────────────────────────┘
```

#### Styling

- **Header**: `var(--color-neutral-100)`, font-weight 600
- **Row Hover**: `var(--color-neutral-50)`
- **Border**: `1px solid var(--color-neutral-200)`
- **Cell Padding**: 12px 16px
- **Zebra Striping**: Optional

### Stat Card

- **Layout**: Icon | Value + Label | Trend
- **Icon**: 48px container, primary light background
- **Value**: 3xl font, bold
- **Label**: Base font, secondary color
- **Trend**: Percentage with up/down arrow

### Activity Timeline

- **Item Layout**: Dot | Content
- **Dot**: 12px, colored by status
- **Line**: 2px, neutral-200, vertical
- **Content**: Title + description + timestamp
- **Timestamp**: Right-aligned or below

### Empty State

- **Icon**: 64px, neutral-300
- **Title**: xl font, semibold
- **Description**: Base font, secondary color
- **Action**: Primary button below

---

## Interaction Patterns

### Loading States

#### Button Loading
- Replace text with spinner
- Disable interaction
- Maintain button size

#### Skeleton Screen
- Animated gradient shimmer
- Match content layout
- 150ms fade transition

#### Spinner
- Role-based color
- Sizes: sm (16px), md (24px), lg (32px)
- Centered in container

### Error States

#### Inline Error
- Red border on input
- Error icon + message below
- Focus trap in form

#### Error Alert
- Red left border (4px)
- Error icon + title + message
- Dismiss button (optional)
- Action button (optional)

### Empty States

- Centered icon (64px)
- Title (xl, semibold)
- Description (base, secondary)
- Primary action button
- Secondary action (optional)

### Success States

#### Toast Notification
- Green left border
- Checkmark icon
- Auto-dismiss (5s)
- Manual dismiss button

#### Success Page
- Large checkmark animation
- Confirmation number
- Transaction hash (copyable)
- Print/Download buttons

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Normal text: 4.5:1
   - Large text (18px+): 3:1
   - UI components: 3:1

2. **Focus Indicators**
   - Visible focus ring on all interactive elements
   - 2px minimum, high contrast
   - 2px offset

3. **Touch Targets**
   - Minimum 44×44px
   - Adequate spacing between targets

4. **Keyboard Navigation**
   - Logical tab order
   - Skip links for main content
   - Focus traps in modals

5. **Screen Readers**
   - Semantic HTML
   - ARIA labels where needed
   - Live regions for dynamic content

6. **Text Sizing**
   - Support 200% text scaling
   - No text in images

---

## Responsive Behavior

### Mobile (< 640px)

- Single column layouts
- Full-width buttons
- Collapsible navigation
- Bottom sheet modals
- Swipeable carousels

### Tablet (640px - 1024px)

- 2-column grids
- Sidebar collapsed by default
- Adaptive table scroll

### Desktop (> 1024px)

- Full layouts
- Expanded sidebar
- Multi-column tables

---

## Implementation Notes

### Tailwind Classes Reference

```tsx
// Button
<button className="btn btn-primary btn-md">
  Button Text
</button>

// Input
<input className="input input-md" placeholder="Enter text" />

// Card
<div className="card card-interactive">
  Card Content
</div>

// Modal
<Modal size="md">
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>

// Badge
<span className="badge badge-success badge-md">
  Status
</span>
```

### CSS Variables Usage

```css
/* Use design tokens */
.btn {
  background-color: var(--color-primary-500);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
}
```
