# County Voter Management

## Overview

RO interface for managing county voters and candidates. This page is accessible to Returning Officers (County and Constituency level) for viewing and managing voter data within their assigned jurisdiction.

---

## 1. Page Purpose

- View all registered voters in assigned county/constituency
- Search and filter voter records
- Verify voter registration details
- Manage voter status (activate, deactivate, flag)
- Export voter lists for physical polling stations
- Handle voter disputes and corrections

---

## 2. User Roles & Access

| Role | Can View | Can Edit | Can Export |
|------|----------|----------|------------|
| County RO | All 47 counties | All counties | All counties |
| Constituency RO | Assigned constituency | Assigned constituency | Assigned constituency |
| Deputy RO | Read-only | None | None |

---

## 3. Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  COUNTY VOTER MANAGEMENT                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ FILTERS: [County ▼] [Constituency ▼] [Status ▼] [Search 🔍 ]│ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  SUMMARY STATS                                                  │ │
│  │  Total: 245,678  |  Active: 243,120  |  Pending: 2,558       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  VOTER TABLE                                                   │ │
│  │  ┌─────┬──────────┬──────────┬──────────┬────────┬─────────┐  │ │
│  │  │ ID  │ Name     │ NationalID│ Location │ Status │ Actions│  │ │
│  │  ├─────┼──────────┼──────────┼──────────┼────────┼─────────┤  │ │
│  │  │ 001 │ J. Doe   │ 12345678 │ Nairobi  │ Active │ 👁 ✏️ 🏳 │  │ │
│  │  │ 002 │ A. Smith │ 87654321 │ Mombasa  │ Active │ 👁 ✏️ 🏳 │  │ │
│  │  └─────┴──────────┴──────────┴──────────┴────────┴─────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  PAGINATION: [< Prev] Page 1 of 2457 [Next >] [Export CSV]  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Filter Components

### 4.1 County Filter
- Dropdown with all 47 Kenyan counties
- Multi-select option
- Default: Assigned county (for Constituency RO)

### 4.2 Constituency Filter
- Dynamically populated based on selected county
- Shows 290 constituencies
- Multi-select supported

### 4.3 Status Filter
- **All**: Show all voters
- **Active**: Successfully registered and verified
- **Pending**: Registration under review
- **Flagged**: Needs attention/dispute
- **Deactivated**: Previously active, now disabled

### 4.4 Search
- Search by: National ID, Name, Phone, Email
- Real-time search (debounced 300ms)
- Advanced search toggle for additional fields

---

## 5. Voter Table Columns

| Column | Description | Sortable |
|--------|-------------|----------|
| ID | Internal voter ID | Yes |
| Full Name | First + Last name | Yes |
| National ID | 8-digit and 14 digits ID number | Yes |
| Gender | M/F | Yes |
| County | Registered county | Yes |
| Constituency | Registered constituency | Yes |
| Ward | Registered ward | Yes |
| Registration Date | Date registered | Yes |
| Status | Active/Pending/Flagged | Yes |
| Last Updated | Last modification date | Yes |
| Actions | View/Edit/Flag buttons | No |

---

## 6. Action Buttons

### 6.1 View Details (👁)
- Opens modal with full voter profile
- Shows all registration data
- Shows biometric enrollment status
- Shows vote history (if any)

### 6.2 Edit (✏️)
- Opens edit form for voter details
- Only for: County RO and above
- Requires reason for edit
- Logs all changes

### 6.3 Flag (🏳️)
- Opens flag dialog
- Select flag reason:
  - Duplicate registration
  - Invalid documents
  - Biometric mismatch
  - Deceased voter
  - Underage
- Requires supporting evidence upload
- Triggers review workflow

---

## 7. Bulk Actions

- **Export CSV**: Download filtered voter list
- **Export PDF**: Print-ready voter register
- **Bulk Flag**: Flag multiple voters
- **Send Notifications**: Email/SMS to selected voters

---

## 8. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/ro/voters` | GET | List voters with filters |
| `/api/v1/ro/voters/:id` | GET | Get voter details |
| `/api/v1/ro/voters/:id` | PATCH | Update voter |
| `/api/v1/ro/voters/:id/flag` | POST | Flag voter |
| `/api/v1/ro/voters/export` | POST | Export voter list |
| `/api/v1/ro/voters/bulk-flag` | POST | Bulk flag voters |
| `/api/v1/ro/voters/search` | POST | Advanced search |

---

## 9. Security Considerations

- **Access Control**: Strict role-based access
- **Audit Log**: All view/edit/flag actions logged
- **Data Privacy**: National IDs masked by default
- **Export Controls**: Export logged with IP and user
- **Rate Limiting**: 100 requests/minute max

---

## 10. Dispute Handling

When a voter dispute is flagged:
1. RO reviews the flag reason
2. RO requests supporting documents
3. Decision: Uphold / Dismiss / Escalate
4. Voter notified of outcome
5. All decisions logged for audit
