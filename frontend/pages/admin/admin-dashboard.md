# Admin Dashboard

## Overview

The Admin Dashboard is the command center for Super Admins to manage the entire electoral system. It provides comprehensive oversight of all operations including Returning Officer (RO) management, county administration, candidate management, election configuration, and real-time analytics.

---

## 1. Dashboard Layout

### 1.1 Main Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADMIN DASHBOARD LAYOUT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐ ┌─────────────────────────────────────────────────────────┐ │
│  │          │ │                    TOP HEADER                            │ │
│  │          │ │  [Logo]  [Elections ▼] [Notifications] [Profile]       │ │
│  │  SIDEBAR │ ├─────────────────────────────────────────────────────────┤ │
│  │          │ │                                                          │ │
│  │  • Home  │ │                   MAIN CONTENT AREA                     │ │
│  │  • ROs   │ │                                                          │ │
│  │  • Counties│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│  │  • Candidates│ │  │ Voters| │  Votes  │ │ Counties│ │ Active  │    │ │
│  │  • Elections│ │  │  2.1M  │ │  1.5M   │ │   47    │ │   23    │    │ │
│  │  • Reports │ │  │   ▲5%   │ │  75%    │ │  Active │ │  ROs    │    │ │
│  │  • Settings│ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│  │          │ │                                                          │ │
│  │          │ │  ┌────────────────────────────────────────────────────┐ │ │
│  │          │ │  │           RECENT ACTIVITY FEED                    │ │ │
│  │          │ │  │  • RO application approved - Nairobi              │ │ │
│  │          │ │  │  • New candidate submitted - Mombasa             │ │ │
│  │          │ │  │  • Election status changed to Voting              │ │ │
│  │          │ │  │  • Batch processing completed - 1,500 votes        │ │ │
│  │          │ │  └────────────────────────────────────────────────────┘ │ │
│  └──────────┘ └─────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Sidebar Navigation

```typescript
// Sidebar navigation items
const adminNavItems = [
  {
    label: 'Dashboard',
    icon: 'HomeIcon',
    path: '/admin',
    badge: null
  },
  {
    label: 'Returning Officers',
    icon: 'UsersIcon',
    path: '/admin/returning-officers',
    badge: pendingRoCount
  },
  {
    label: 'Counties',
    icon: 'MapIcon',
    path: '/admin/counties',
    badge: null
  },
  {
    label: 'Candidates',
    icon: 'CandidateIcon',
    path: '/admin/candidates',
    badge: pendingCandidateCount
  },
  {
    label: 'Elections',
    icon: 'BallotIcon',
    path: '/admin/elections',
    badge: activeElection ? 'Active' : null
  },
  {
    label: 'Reports',
    icon: 'ChartIcon',
    path: '/admin/reports',
    badge: null
  },
  {
    label: 'Audit Logs',
    icon: 'LogIcon',
    path: '/admin/audit-logs',
    badge: null
  },
  {
    label: 'Settings',
    icon: 'SettingsIcon',
    path: '/admin/settings',
    badge: null
  }
];
```

---

## 2. Key Features

### 2.1 Statistics Cards

```typescript
interface StatCard {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
}

const statCards: StatCard[] = [
  {
    title: 'Registered Voters',
    value: '2,150,432',
    change: 5.2,
    changeLabel: 'vs last week',
    icon: 'UsersIcon',
    color: 'blue'
  },
  {
    title: 'Votes Cast',
    value: '1,523,891',
    change: 75.2,
    changeLabel: 'turnout',
    icon: 'BallotIcon',
    color: 'green'
  },
  {
    title: 'Active Counties',
    value: '47',
    change: 0,
    changeLabel: 'all operational',
    icon: 'MapIcon',
    color: 'purple'
  },
  {
    title: 'Returning Officers',
    value: '23',
    change: 2,
    changeLabel: 'new this week',
    icon: 'UsersIcon',
    color: 'orange'
  }
];
```

### 2.2 Recent Activity Feed

```typescript
interface ActivityItem {
  id: string;
  type: 'ro_application' | 'candidate' | 'election' | 'vote' | 'system';
  action: string;
  details: string;
  timestamp: Date;
  user?: string;
  status: 'success' | 'warning' | 'error';
}

const activityFeed: ActivityItem[] = [
  {
    id: '1',
    type: 'ro_application',
    action: 'RO Application Approved',
    details: 'John Doe approved for Nairobi County',
    timestamp: new Date('2024-01-20T10:30:00'),
    user: 'Super Admin',
    status: 'success'
  },
  {
    id: '2',
    type: 'candidate',
    action: 'New Candidate Submitted',
    details: 'Jane Smith - Governor Candidate, Mombasa',
    timestamp: new Date('2024-01-20T10:15:00'),
    user: 'RO Mombasa',
    status: 'warning'
  },
  {
    id: '3',
    type: 'election',
    action: 'Election Status Changed',
    details: '2024 General Election → Voting Active',
    timestamp: new Date('2024-01-20T09:00:00'),
    user: 'System',
    status: 'success'
  },
  {
    id: '4',
    type: 'vote',
    action: 'Batch Processing Complete',
    details: '1,500 votes submitted to blockchain',
    timestamp: new Date('2024-01-20T08:45:00'),
    user: 'Batch System',
    status: 'success'
  }
];
```

---

## 3. Component Implementation

### 3.1 StatCard Component

```tsx
// components/admin/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<IconProps>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {changeLabel && (
          <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
```

### 3.2 ActivityFeed Component

```tsx
// components/admin/ActivityFeed.tsx
interface ActivityFeedProps {
  activities: ActivityItem[];
  onLoadMore?: () => void;
}

export function ActivityFeed({ activities, onLoadMore }: ActivityFeedProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ro_application': return UsersIcon;
      case 'candidate': return CandidateIcon;
      case 'election': return BallotIcon;
      case 'vote': return CheckIcon;
      case 'system': return CogIcon;
    }
  };

  const getStatusColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="divide-y">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type);
          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{activity.timestamp.toLocaleString()}</span>
                    {activity.user && <span>• {activity.user}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {onLoadMore && (
        <div className="p-4 border-t">
          <button onClick={onLoadMore} className="w-full text-sm text-blue-600 hover:text-blue-700">
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Page Routes

### 4.1 Route Configuration

```typescript
// app/admin/layout.tsx (Next.js App Router)
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Route definitions
const adminRoutes = [
  {
    path: '/admin',
    component: AdminDashboard,
    title: 'Dashboard'
  },
  {
    path: '/admin/returning-officers',
    component: ReturningOfficersPage,
    title: 'Returning Officers'
  },
  {
    path: '/admin/returning-officers/[id]',
    component: ReturningOfficerDetailPage,
    title: 'RO Detail'
  },
  {
    path: '/admin/counties',
    component: CountiesPage,
    title: 'Counties'
  },
  {
    path: '/admin/counties/[code]',
    component: CountyDetailPage,
    title: 'County Detail'
  },
  {
    path: '/admin/candidates',
    component: CandidatesPage,
    title: 'Candidates'
  },
  {
    path: '/admin/candidates/[id]',
    component: CandidateDetailPage,
    title: 'Candidate Detail'
  },
  {
    path: '/admin/elections',
    component: ElectionsPage,
    title: 'Elections'
  },
  {
    path: '/admin/elections/[id]',
    component: ElectionDetailPage,
    title: 'Election Detail'
  },
  {
    path: '/admin/reports',
    component: ReportsPage,
    title: 'Reports'
  },
  {
    path: '/admin/audit-logs',
    component: AuditLogsPage,
    title: 'Audit Logs'
  },
  {
    path: '/admin/settings',
    component: SettingsPage,
    title: 'Settings'
  }
];
```

---

## 5. Data Fetching

### 5.1 Dashboard Data Hook

```typescript
// hooks/useAdminDashboard.ts
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  voters: {
    total: number;
    registered: number;
    verified: number;
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
    pendingROs: number;
  };
  ro: {
    total: number;
    approved: number;
    pending: number;
  };
}

export function useAdminDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
```

### 5.2 Activity Feed Hook

```typescript
// hooks/useActivityFeed.ts
export function useActivityFeed(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'activity', limit],
    queryFn: async () => {
      const response = await fetch(`/api/admin/activity?limit=${limit}`);
      return response.json();
    },
    refetchInterval: 15000 // Refresh every 15 seconds
  });
}
```

---

## 6. State Management

### 6.1 Admin Store (Zustand)

```typescript
// stores/admin.store.ts
import { create } from 'zustand';

interface AdminState {
  // UI State
  sidebarOpen: boolean;
  selectedCounty: string | null;
  selectedElection: string | null;
  
  // Data
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  toggleSidebar: () => void;
  setSelectedCounty: (county: string | null) => void;
  setSelectedElection: (election: string | null) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  sidebarOpen: true,
  selectedCounty: null,
  selectedElection: null,
  notifications: [],
  unreadCount: 0,
  
  // Actions
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  setSelectedCounty: (county) => set({ 
    selectedCounty: county 
  }),
  
  setSelectedElection: (election) => set({ 
    selectedElection: election 
  }),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  
  clearNotifications: () => set({ 
    notifications: [], 
    unreadCount: 0 
  })
}));
```

---

## 7. Responsive Design

### 7.1 Mobile Sidebar

```tsx
// components/admin/AdminSidebar.tsx
export function AdminSidebar() {
  const { sidebarOpen, toggleSidebar } = useAdminStore();
  
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-900 text-white
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">IEBC Admin</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
```

---

## 8. Permissions

### 8.1 Role-Based Access

```typescript
// Permission checks
const adminPermissions = {
  super_admin: [
    'dashboard:view',
    'ro:approve', 'ro:reject', 'ro:assign',
    'county:create', 'county:edit', 'county:delete',
    'candidate:approve', 'candidate:reject', 'candidate:create',
    'election:create', 'election:edit', 'election:delete',
    'reports:view', 'reports:export',
    'audit:view',
    'settings:view', 'settings:edit'
  ],
  admin: [
    'dashboard:view',
    'ro:approve', 'ro:reject',
    'candidate:approve', 'candidate:reject',
    'reports:view',
    'audit:view'
  ],
  auditor: [
    'dashboard:view',
    'reports:view',
    'audit:view'
  ]
};

// Permission guard
function usePermission(permission: string) {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ?? false;
}
```

---

## 9. Error Handling

### 9.1 Error States

```tsx
// components/admin/ErrorState.tsx
export function AdminErrorState({ 
  title, 
  message, 
  onRetry 
}: { 
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

---

## 10. Loading States

### 10.1 Skeleton Loaders

```tsx
// components/admin/Skeletons.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```
