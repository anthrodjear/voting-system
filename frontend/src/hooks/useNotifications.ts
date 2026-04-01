// ===========================================
// USE NOTIFICATIONS HOOK
// Location: src/hooks/useNotifications.ts
// ===========================================

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useNotificationStore, AppNotification } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';

export function useNotifications() {
  const { notifications, isOpen, addNotifications, toggleOpen, setOpen, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Generate role-specific notifications on mount
  useEffect(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();

    const generated: Omit<AppNotification, 'id' | 'read' | 'createdAt'>[] = [];

    // Determine which portal we're in
    const isAdmin = pathname.startsWith('/admin');
    const isVoter = pathname.startsWith('/voter');
    const isRO = pathname.startsWith('/ro');
    
    console.log('[Notifications] Portal:', { isAdmin, isVoter, isRO });

    // ─── Shared notifications (all portals) ───
    generated.push({
      type: 'success',
      title: 'System Online',
      message: `All IEBC voting services are operational. Last health check: ${timeStr}.`,
      icon: 'check',
    });

    generated.push({
      type: 'info',
      title: 'Database Backup Complete',
      message: `Automated daily backup completed successfully at 03:00 AM on ${dateStr}.`,
      icon: 'check',
    });

    // ─── Admin-specific notifications ───
    if (isAdmin) {
      generated.push({
        type: 'warning',
        title: 'Pending RO Applications',
        message: '3 Returning Officer applications are awaiting your review and approval.',
        actionUrl: '/admin/returning-officers',
        icon: 'user-plus',
      });

      generated.push({
        type: 'info',
        title: 'Voter Registration Active',
        message: '2,847 voters have registered across 47 counties. Registration closes in 14 days.',
        actionUrl: '/admin/counties',
        icon: 'chart',
      });

      generated.push({
        type: 'success',
        title: 'Blockchain Synced',
        message: 'Hyperledger Besu node is fully synced. Last block: #14,287. Ready for vote recording.',
        actionUrl: '/admin/dashboard',
        icon: 'check',
      });

      generated.push({
        type: 'warning',
        title: 'Election Preparation Reminder',
        message: 'Review candidate registrations and verify county assignments before the election date.',
        actionUrl: '/admin/candidates',
        icon: 'calendar',
      });

      generated.push({
        type: 'error',
        title: 'Security Alert',
        message: '5 failed login attempts detected from IP 192.168.1.105 in the last hour.',
        actionUrl: '/admin/settings',
        icon: 'alert',
      });
    }

    // ─── Voter-specific notifications ───
    if (isVoter) {
      generated.push({
        type: 'info',
        title: 'Registration Status',
        message: user?.firstName
          ? `Welcome back, ${user.firstName}! Your voter registration is verified and active.`
          : 'Your voter registration is verified and active.',
        actionUrl: '/voter/register',
        icon: 'clipboard',
      });

      generated.push({
        type: 'warning',
        title: 'Upcoming Election',
        message: 'The general election is scheduled for next month. Make sure your registration is up to date.',
        actionUrl: '/voter/dashboard',
        icon: 'calendar',
      });

      generated.push({
        type: 'success',
        title: 'Identity Verified',
        message: 'Your national ID and biometric data have been successfully verified.',
        icon: 'shield',
      });

      generated.push({
        type: 'info',
        title: 'Voting Instructions',
        message: 'Review the voting process and candidate information before election day.',
        actionUrl: '/voter/vote',
        icon: 'clipboard',
      });
    }

    // ─── RO-specific notifications ───
    if (isRO) {
      generated.push({
        type: 'warning',
        title: 'Pending Voter Verifications',
        message: '12 voter applications are awaiting your review and verification.',
        actionUrl: '/ro/voters',
        icon: 'user-plus',
      });

      generated.push({
        type: 'info',
        title: 'Candidate Approvals',
        message: '3 new candidate registrations require your approval for your county.',
        actionUrl: '/ro/candidates',
        icon: 'users',
      });

      generated.push({
        type: 'success',
        title: 'County Assignment Active',
        message: 'You are assigned as Returning Officer for your county. All systems operational.',
        icon: 'check',
      });

      generated.push({
        type: 'warning',
        title: 'Training Reminder',
        message: 'Complete the mandatory election officer training module before the election date.',
        actionUrl: '/ro/dashboard',
        icon: 'calendar',
      });
    }

    console.log('[Notifications] Generated:', generated.length, 'notifications');
    addNotifications(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
