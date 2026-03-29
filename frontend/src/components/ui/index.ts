/**
 * IEBC Blockchain Voting System - UI Component Library
 * 
 * A comprehensive, accessible, and themeable component library
 * built with React, TypeScript, and Tailwind CSS.
 * 
 * @version 1.0.0
 * @author IEBC Development Team
 */

// ============================================
// Core Components
// ============================================

// Button
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';

// Input
export { Input, type InputProps, type InputRef } from './Input';

// Select
export { Select, type SelectProps, type SelectOption, type SelectRef } from './Select';

// Card
export { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  type CardProps, 
  type CardVariant,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps
} from './Card';

// Modal
export { 
  Modal, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  type ModalProps, 
  type ModalSize,
  type ModalHeaderProps,
  type ModalBodyProps,
  type ModalFooterProps
} from './Modal';

// Badge
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge';

// Progress
export { Progress, type ProgressProps, type ProgressVariant, type ProgressSize } from './Progress';

// Alert
export { Alert, type AlertProps, type AlertVariant } from './Alert';

// StepIndicator
export { StepIndicator, type StepIndicatorProps, type Step } from './StepIndicator';

// DataTable
export { DataTable, type DataTableProps, type TableColumn } from './DataTable';

// StatCard
export { StatCard, type StatCardProps, type TrendDirection } from './StatCard';

// Toast
export { 
  Toast, 
  ToastProvider, 
  useToast,
  type ToastProps, 
  type ToastType, 
  type ToastPosition,
  type ToastContextType
} from './Toast';

// Skeleton
export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonAvatar, 
  SkeletonButton,
  type SkeletonProps, 
  type SkeletonVariant 
} from './Skeleton';

// Avatar
export { 
  Avatar, 
  AvatarGroup, 
  type AvatarProps, 
  type AvatarSize, 
  type AvatarStatus,
  type AvatarGroupProps 
} from './Avatar';

// Dropdown
export { 
  Dropdown, 
  DropdownSearch,
  type DropdownProps, 
  type DropdownItem,
  type DropdownSearchProps
} from './Dropdown';

// ============================================
// Component Categories
// ============================================

/**
 * Form Components
 * - Button: Action buttons with variants and states
 * - Input: Text input with icons, errors, and validation
 * - Select: Dropdown select with options
 * - Progress: Progress bars for loading states
 * 
 * Layout Components
 * - Card: Container with header, body, footer
 * - Modal: Dialog overlays
 * - DataTable: Tabular data display
 * - StatCard: Statistics display cards
 * 
 * Feedback Components
 * - Alert: Contextual notifications
 * - Badge: Status indicators
 * - Toast: Temporary notifications
 * - Skeleton: Loading placeholders
 * 
 * Navigation Components
 * - StepIndicator: Multi-step progress
 * - Dropdown: Menu dropdowns
 * 
 * User Components
 * - Avatar: User profile images
 */

// ============================================
// Design Tokens Reference
// ============================================

/**
 * The components use the following design tokens:
 * 
 * Colors:
 * - primary (blue): Admin/dashboard theme
 * - success (green): Positive states
 * - warning (yellow): Caution states
 * - error (red): Error states
 * - info (cyan): Informational states
 * - neutral (gray): Default states
 * 
 * Role Colors:
 * - super-admin: Purple theme
 * - admin: Blue theme
 * - ro: Green theme (Returning Officer)
 * - voter: Orange theme
 * 
 * Sizes:
 * - xs: Extra small (12px)
 * - sm: Small (14px)
 * - md: Medium (16px)
 * - lg: Large (18px)
 * - xl: Extra large (20px)
 * 
 * Dark Mode:
 * - All components support dark mode via the 'dark' class on html element
 * - Use with Tailwind's 'dark:' prefix for dark mode styles
 * 
 * Accessibility:
 * - All interactive elements have proper focus states
 * - Components use ARIA attributes appropriately
 * - Keyboard navigation is supported
 */

// ============================================
// Version
// ============================================

export const VERSION = '1.0.0';
