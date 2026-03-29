/**
 * IEBC Blockchain Voting System - Layout Components
 * 
 * A comprehensive set of layout components for different user roles
 * and authentication states.
 * 
 * @version 1.0.0
 * @author IEBC Development Team
 */

// Layout Components
export { Header } from './Header';
export { Sidebar, type SidebarItem } from './Sidebar';
export { AdminSidebar } from './AdminSidebar';
export { ROSidebar } from './ROSidebar';
export { VoterLayout } from './VoterLayout';
export { AuthLayout } from './AuthLayout';

// ============================================
// Component Categories
// ============================================

/**
 * Navigation Components
 * - Header: Top navigation bar with user menu and notifications
 * - Sidebar: Collapsible sidebar with navigation items
 * 
 * Role-Specific Layouts
 * - AdminSidebar: Admin dashboard sidebar with admin theming
 * - ROSidebar: Returning Officer sidebar with RO theming
 * - VoterLayout: Voter-facing layout with mobile support
 * 
 * Authentication Layouts
 * - AuthLayout: Centered card layout for login/register pages
 */

// ============================================
// Usage Examples
// ============================================

/**
 * // Header usage
 * <Header 
 *   user={user}
 *   notifications={notifications}
 *   onLogout={handleLogout}
 *   showSearch={true}
 * />
 * 
 * // Sidebar usage
 * <Sidebar 
 *   items={navItems}
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   role="admin"
 * />
 * 
 * // Admin Sidebar
 * <AdminSidebar 
 *   isOpen={true}
 *   notificationCount={5}
 * />
 * 
 * // RO Sidebar
 * <ROSidebar 
 *   isOpen={true}
 *   countyName="Nairobi"
 *   pendingCount={3}
 * />
 * 
 * // Voter Layout
 * <VoterLayout 
 *   user={user}
 *   registrationStatus="verified"
 *   onLogout={handleLogout}
 * >
 *   {children}
 * </VoterLayout>
 * 
 * // Auth Layout
 * <AuthLayout 
 *   title="Create Account"
 *   subtitle="Register to vote"
 * >
 *   {children}
 * </AuthLayout>
 */

// ============================================
// Version
// ============================================

export const VERSION = '1.0.0';
