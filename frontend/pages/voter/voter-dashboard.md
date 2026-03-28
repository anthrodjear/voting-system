# Voter Dashboard

## Overview

The voter dashboard provides registration, voting, and status tracking. This is the main interface voters see after logging in, providing access to all voting-related features, registration status, and election information.

---

## 1. Dashboard Features

- Registration progress tracker
- Biometric enrollment status
- Vote casting interface
- Vote confirmation & receipt
- Election information & schedules
- Notification center
- Profile settings

---

## 2. Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  VOTER DASHBOARD                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  HEADER: Logo | Elections | Notifications (🔔) | Profile 👤  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐  │
│  │                      │  │                                  │  │
│  │   REGISTRATION       │  │   UPCOMING ELECTIONS             │  │
│  │   STATUS CARD        │  │   - General Election 2027        │  │
│  │                      │  │   - Registration: Open            │  │
│  │   ● Verified ✅       │  │   - Voting Date: Aug 2027        │  │
│  │                      │  │                                  │  │
│  └──────────────────────┘  └──────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  QUICK ACTIONS                                                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │ │
│  │  │  Cast   │ │ View     │ │ Update   │ │ Election │        │ │
│  │  │  Vote   │ │ Receipt  │ │ Profile  │ │ Info     │        │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  ELECTION COUNTDOWN                                            │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░ 45 days remaining      │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Components

### 3.1 Header Navigation
- **Logo**: IEBC branding (left)
- **ElectionsMenu**: Dropdown of upcoming elections
- **NotificationBell**: Unread notification count badge
- **ProfileMenu**: Account dropdown (settings, logout)

### 3.2 Registration Status Card
- **StatusIndicator**: Visual indicator (verified/pending/rejected)
- **StatusDetails**: Registration date, verification date
- **BiometricStatus**: Face ✅ | Fingerprints ✅ | Complete
- **ActionButton**: "Complete Registration" if incomplete

### 3.3 Upcoming Elections Section
- **ElectionCard**: 
  - Election name and type
  - Registration deadline
  - Voting dates
  - Status badge (Open/Closed/Upcoming)

### 3.4 Quick Actions Grid
- **CastVoteButton**: Primary CTA (enabled during election)
- **ViewReceiptButton**: View past vote receipts
- **UpdateProfileButton**: Edit personal information
- **ElectionInfoButton**: Detailed election information

### 3.5 Election Countdown
- **ProgressBar**: Visual countdown to election day
- **DaysRemaining**: Numeric countdown
- **MilestoneMarkers**: Registration deadline, early voting, election day

### 3.6 Notification Center
- **NotificationList**: Recent notifications (max 10)
- **NotificationTypes**:
  - Registration updates
  - Election announcements
  - Voting reminders
  - Results publication
- **MarkAsRead**: Bulk action for notifications

---

## 4. User States & Views

### 4.1 Not Registered
```
┌─────────────────────────────────────────┐
│  Welcome to IEBC Online Voting          │
│  ─────────────────────────────────────  │
│  Register to vote and participate in    │
│  Kenya's democratic process.             │
│                                          │
│  [ Register to Vote ]                   │
└─────────────────────────────────────────┘
```

### 4.2 Registration Pending
```
┌─────────────────────────────────────────┐
│  Registration Under Review              │
│  ─────────────────────────────────────  │
│  Your registration is being verified.  │
│  This usually takes 24-48 hours.        │
│                                          │
│  [ Check Status ] [ Upload Documents ]  │
└─────────────────────────────────────────┘
```

### 4.3 Registration Rejected
```
┌─────────────────────────────────────────┐
│  Registration Needs Attention           │
│  ─────────────────────────────────────  │
│  Reason: Document verification failed    │
│                                          │
│  [ View Details ] [ Submit Appeal ]      │
└─────────────────────────────────────────┘
```

### 4.4 Fully Registered (Default View)
- Full dashboard with all features
- "Cast Vote" button enabled during elections
- Receipt viewing enabled

---

## 5. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/voters/me` | GET | Get voter profile & status |
| `/api/v1/voters/status` | GET | Get registration status |
| `/api/v1/voters/notifications` | GET | Get voter notifications |
| `/api/v1/voters/notifications/:id/read` | POST | Mark notification read |
| `/api/v1/elections/current` | GET | Get current/upcoming elections |
| `/api/v1/elections/:id/countdown` | GET | Get election countdown |

---

## 6. State Management

```typescript
// Voter Dashboard State
interface VoterDashboardState {
  voter: VoterProfile | null;
  registrationStatus: 'not_registered' | 'pending' | 'verified' | 'rejected';
  biometricsStatus: {
    faceEnrolled: boolean;
    fingerprintsEnrolled: boolean;
  };
  elections: Election[];
  currentElection: Election | null;
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}
```

---

## 7. Security & Privacy

- **Data Minimization**: Only show necessary information
- **Session Timeout**: 30 minutes idle, 2 hours active
- **Biometric Privacy**: Templates never displayed, only status
- **Vote Privacy**: No indication of who/what voted in UI
- **Audit Trail**: All dashboard actions logged
