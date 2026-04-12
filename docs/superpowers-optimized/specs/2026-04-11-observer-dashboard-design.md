# Live Election Observer Dashboard - Design

## 1. Overview

This design specifies a separate observer dashboard for live election monitoring. Observers are independent parties who can watch the voting process in real-time, see vote counts, verify blockchain records, and generate reports.

## 2. Scope

### Included
- Live vote tally display with real-time updates
- Candidate result tracking with progress bars
- Blockchain verification panel
- Reports generation (export to CSV/JSON)
- Voter turnout statistics
- Responsive design for desktop and mobile

### Non-Goals
- Admin functionality (managing elections, candidates, etc.)
- Voting/registration capabilities
- Push notifications

## 3. User Type

**Live Election Observer**
- Independent organization/individual monitoring elections
- Read-only access to election data
- Cannot modify any election data

## 4. Architecture

### Route
- `/observer` - Main observer dashboard
- `/observer/candidates` - Candidate results
- `/observer/blockchain` - Blockchain verification
- `/observer/reports` - Report export

### Data Flow
```
Observer Dashboard → Backend API (observer service) → Blockchain
                                    ↓
                              PostgreSQL (votes data)
```

## 5. UI Components

### 5.1 Main Dashboard (/observer/page.tsx)

**Header:**
- Election name + status badge
- Last updated timestamp
- Auto-refresh toggle (30s interval)

**Stats Cards Row:**
- Total Registered Voters
- Total Votes Cast
- Turnout Percentage
- Remaining Time (if election ongoing)

**Live Results Section:**
- Candidate cards with:
  - Candidate name + party
  - Vote count (live number)
  - Percentage bar
  - Trend indicator (up/down/stable)
- Progress bar visualization
- "Last updated: X seconds ago"

**Quick Actions:**
- Refresh button
- View Details → candidate detail page

### 5.2 Candidate Results (/observer/candidates/page.tsx)

- Table view with columns: Candidate, Votes, %, Change
- Sort by vote count or percentage
- Search/filter
- Export button

### 5.3 Blockchain Verification (/observer/blockchain/page.tsx)

- Search by transaction hash or voter ID
- Display vote record verification status
- Show block number, timestamp, proof
- "Verified" / "Pending" / "Not Found" status

### 5.4 Reports (/observer/reports/page.tsx)

- Date range selector
- Report type: Summary / Detailed / By Candidate
- Export format: CSV, JSON
- Download button

## 6. Technical Design

### API Endpoints
```
GET /api/observer/election-stats
GET /api/observer/candidates
GET /api/observer/voter-turnout
GET /api/observer/vote/:transactionHash
GET /api/observer/reports?type=...&format=...
```

### Services
- `observerService.getElectionStats()`
- `observerService.getCandidateResults()`
- `observerService.verifyVote(transactionHash)`
- `observerService.generateReport(type, format)`

## 7. UI Design

### Color Scheme
- Primary: Blue (#3B82F6)
- Background: White / Dark mode
- Accent: Green (#10B981) for verified
- Warning: Yellow (#F59E0B) for pending
- Error: Red (#EF4444) for failed

### Responsive Breakpoints
- Mobile: < 640px (single column, stacked cards)
- Tablet: 640px-1024px (2 columns)
- Desktop: > 1024px (full dashboard)

## 8. Security

- Observer role has read-only access
- JWT authentication required
- Rate limiting on API calls
- No data modification capability

## 9. Implementation Notes

- Use React Query for real-time data fetching with auto-refresh
- WebSocket connection for live updates (future enhancement)
- Web3.js for blockchain queries
- Shadcn/ui components for consistent design