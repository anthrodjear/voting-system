# RO Dashboard

## Overview

The Returning Officer (RO) Dashboard provides county-level administrators with comprehensive tools to manage their assigned county's voting operations, including voter management, candidate nomination, election monitoring, and reporting.

---

## 1. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RO DASHBOARD LAYOUT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Welcome, John Doe | Nairobi County | [Notifications] [Profile]     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  COUNTY QUICK STATS                                                │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │   │
│  │  │ Voters    │ │ Candidates │ │  Votes    │ │ Turnout   │       │   │
│  │  │ 450,000   │ │    25     │ │ 125,000   │ │  72%      │       │   │
│  │  │ +500 today│ │ 8 pending │ │ 1,250/h   │ │ ▲ 5%      │       │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  QUICK ACTIONS          │  │  PENDING APPROVALS                    │  │
│  │  ───────────────────── │  │  ─────────────────────────────────── │  │
│  │  [+ Add Candidate]     │  │  • 3 Candidates awaiting approval   │  │
│  │  [View Voters]         │  │  • 2 Sub-ROs awaiting approval     │  │
│  │  [Election Status]     │  │  • 1 Document verification          │  │
│  │  [Reports]             │  │                                      │  │
│  │  [Settings]            │  │  [Review All]                       │  │
│  └──────────────────────────┘  └──────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  REAL-TIME VOTING PROGRESS                                          │   │
│  │  ════════════════════════════════════════════════════════════════════  │   │
│  │  [████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 72% Complete          │   │
│  │                                                                      │   │
│  │  Nairobi County - 125,000 / 175,000 votes                         │   │
│  │  Last updated: 2 minutes ago                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Features

### 2.1 Quick Stats Cards

```typescript
// RO Dashboard stats
interface ROStats {
  county: {
    code: string;
    name: string;
    region: string;
  };
  voters: {
    total: number;
    verified: number;
    registeredToday: number;
  };
  candidates: {
    total: number;
    pending: number;
    approved: number;
  };
  voting: {
    votesCast: number;
    turnout: number;
    votesPerHour: number;
    lastUpdated: Date;
  };
  ro: {
    name: string;
    status: string;
    assignedAt: Date;
  };
}

export function ROQuickStats({ stats }: { stats: ROStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Voters"
        value={formatNumber(stats.voters.total)}
        subtitle={`${stats.voters.verified} verified`}
        change={stats.voters.registeredToday}
        changeLabel="registered today"
        icon={UsersIcon}
        color="blue"
      />
      <StatCard
        title="Candidates"
        value={stats.candidates.total}
        subtitle={`${stats.candidates.pending} pending approval`}
        icon={CandidateIcon}
        color="purple"
      />
      <StatCard
        title="Votes Cast"
        value={formatNumber(stats.voting.votesCast)}
        subtitle={`${stats.voting.turnout}% turnout`}
        change={stats.voting.votesPerHour}
        changeLabel="votes/hour"
        icon={BallotIcon}
        color="green"
      />
      <StatCard
        title="Turnout"
        value={`${stats.voting.turnout}%`}
        subtitle="of registered voters"
        icon={ChartIcon}
        color="orange"
      />
    </div>
  );
}
```

---

## 3. Navigation Sidebar

```typescript
// RO Sidebar navigation
const roNavItems = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/ro',
    description: 'Overview'
  },
  {
    label: 'Voters',
    icon: UsersIcon,
    path: '/ro/voters',
    description: 'Manage county voters'
  },
  {
    label: 'Candidates',
    icon: CandidateIcon,
    path: '/ro/candidates',
    description: 'Add & manage candidates'
  },
  {
    label: 'Sub-ROs',
    icon: UserGroupIcon,
    path: '/ro/sub-officers',
    description: 'Manage subordinate ROs'
  },
  {
    label: 'Elections',
    icon: BallotIcon,
    path: '/ro/elections',
    description: 'Election status'
  },
  {
    label: 'Reports',
    icon: ChartIcon,
    path: '/ro/reports',
    description: 'View reports'
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    path: '/ro/settings',
    description: 'Account settings'
  }
];
```

---

## 4. Quick Actions

### 4.1 Action Buttons

```typescript
// Quick actions component
export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'Add Candidate',
      icon: PlusIcon,
      onClick: () => router.push('/ro/candidates/new'),
      color: 'primary'
    },
    {
      label: 'View Voters',
      icon: UsersIcon,
      onClick: () => router.push('/ro/voters'),
      color: 'secondary'
    },
    {
      label: 'Election Status',
      icon: BallotIcon,
      onClick: () => router.push('/ro/elections/current'),
      color: 'secondary'
    },
    {
      label: 'Reports',
      icon: ChartIcon,
      onClick: () => router.push('/ro/reports'),
      color: 'secondary'
    }
  ];

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.color}
            className="justify-start"
            onClick={action.onClick}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
```

---

## 5. Pending Approvals

### 5.1 Approval Queue

```typescript
// Pending approvals component
interface ApprovalItem {
  id: string;
  type: 'candidate' | 'sub_ro' | 'document';
  title: string;
  description: string;
  submittedAt: Date;
  submittedBy: string;
}

export function PendingApprovals() {
  const { data: approvals } = useQuery({
    queryKey: ['ro', 'pending-approvals'],
    queryFn: () => fetch('/api/ro/pending-approvals').then(r => r.json())
  });

  const getIcon = (type: ApprovalItem['type']) => {
    switch (type) {
      case 'candidate': return CandidateIcon;
      case 'sub_ro': return UserIcon;
      case 'document': return DocumentIcon;
    }
  };

  return (
    <Card 
      title="Pending Approvals" 
      action={
        <Button variant="ghost" size="sm">
          Review All
        </Button>
      }
    >
      <div className="space-y-3">
        {approvals?.items.map((item: ApprovalItem) => {
          const Icon = getIcon(item.type);
          return (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.submittedBy} • {formatRelativeTime(item.submittedAt)}
                </p>
              </div>
              <Badge variant="warning">{item.type}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

---

## 6. Real-Time Voting Progress

### 6.1 Progress Bar

```typescript
// Voting progress component
export function VotingProgress() {
  const { data: progress, refetch } = useQuery({
    queryKey: ['ro', 'voting-progress'],
    queryFn: () => fetch('/api/ro/voting-progress').then(r => r.json()),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  return (
    <Card title="Real-Time Voting Progress">
      <div className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{progress?.countyName}</span>
            <span className="text-gray-500">
              {formatNumber(progress?.votesCast)} / {formatNumber(progress?.totalVoters)} votes
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress?.percentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-500">{progress?.percentage}% Complete</span>
            <span className="text-gray-400">
              Last updated: {formatRelativeTime(progress?.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(progress?.votesToday || 0)}
            </p>
            <p className="text-xs text-gray-500">Votes Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(progress?.votesPerHour || 0)}
            </p>
            <p className="text-xs text-gray-500">Votes/Hour</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(progress?.remaining || 0)}
            </p>
            <p className="text-xs text-gray-500">Remaining</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

## 7. Data Fetching

### 7.1 RO Dashboard Hook

```typescript
// useRODashboard hook
export function useRODashboard() {
  return useQuery<ROStats>({
    queryKey: ['ro', 'dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/ro/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });
}

// Use in component
export function RODashboard() {
  const { data: stats, isLoading, error } = useRODashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message="Failed to load dashboard" />;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <WelcomeHeader 
        name={stats.ro.name} 
        county={stats.county.name} 
      />
      
      {/* Stats */}
      <ROQuickStats stats={stats} />
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VotingProgress />
        </div>
        <div>
          <QuickActions />
          <PendingApprovals />
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Notifications

### 8.1 Real-Time Alerts

```typescript
// Notification types for RO
const roNotificationTypes = {
  'candidate_submitted': {
    title: 'New Candidate',
    message: 'A new candidate has been submitted for your county',
    icon: CandidateIcon,
    color: 'blue'
  },
  'sub_ro_application': {
    title: 'Sub-RO Application',
    message: 'A new Sub-Returning Officer application requires review',
    icon: UserIcon,
    color: 'yellow'
  },
  'vote_milestone': {
    title: 'Vote Milestone',
    message: 'Your county has reached a voting milestone',
    icon: BallotIcon,
    color: 'green'
  },
  'election_update': {
    title: 'Election Update',
    message: 'Important election status update',
    icon: AlertIcon,
    color: 'red'
  },
  'system_alert': {
    title: 'System Alert',
    message: 'System requires your attention',
    icon: AlertTriangleIcon,
    color: 'red'
  }
};
```

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ro/dashboard/stats` | Dashboard statistics |
| GET | `/api/ro/pending-approvals` | Items needing approval |
| GET | `/api/ro/voting-progress` | Real-time voting progress |
| GET | `/api/ro/voters` | List county voters |
| GET | `/api/ro/candidates` | List county candidates |
| POST | `/api/ro/candidates` | Add candidate |
| GET | `/api/ro/reports` | Generate reports |
| GET | `/api/ro/settings` | RO settings |

---

## 10. Permissions

| Action | County RO | Sub-RO |
|--------|-----------|--------|
| View dashboard | ✓ | ✓ |
| View county voters | ✓ | ✓ (ward level) |
| Add candidates | ✓ | ✗ |
| Approve MCA candidates | ✓ | ✓ |
| Approve MP candidates | ✓ | ✗ |
| Manage Sub-ROs | ✓ | ✗ |
| View reports | ✓ | ✓ |
| Export data | ✓ | ✗ |
