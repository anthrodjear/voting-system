# Candidate Management

## Overview

The Candidate Management module provides comprehensive functionality for managing all election candidates, including presidential candidates (added only by Super Admin), county-level candidates submitted by Returning Officers, and the approval workflow.

---

## 1. Candidate Types

| Type | Level | Who Can Add | Who Can Approve |
|------|-------|-------------|-----------------|
| President | National | Super Admin only | Auto-approved |
| Governor | County | RO | Super Admin |
| Senator | County | RO | Super Admin |
| MP | Constituency | RO | Super Admin |
| MCA | Ward | RO | RO |

---

## 2. Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CANDIDATE MANAGEMENT PAGE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Filters: [Position ▼] [County ▼] [Status ▼] [Search...]  [+Add]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Tabs: [All (150)] [Pending (23)] [Approved (120)] [Rejected (7)] │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  📋 CANDIDATE TABLE                                                  │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  Photo │ Name      │ Position   │ County      │ Party   │ Status   │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  [img] │ John Doe  │ President  │ -           │ Party A │ Approved │  │
│  │  [img] │ Jane Smith│ Governor   │ Nairobi     │ Party B │ Pending  │  │
│  │  [img] │ Mike Ross │ Senator    │ Mombasa     │ Party C │ Pending  │  │
│  │  [img] │ Sarah Lee │ MP         │ Kasarani    │ Party D │ Rejected │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  Pagination: [‹] [1] [2] [3] ... [8] [›]    Showing 1-20 of 150   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Features

### 3.1 Filters & Search

```typescript
// Filter state
interface CandidateFilters {
  position: Position | null;      // president | governor | senator | mp | mca
  county: string | null;          // County code
  status: CandidateStatus | null;  // pending | approved | rejected | draft
  search: string;                  // Search by name
  election: string | null;         // Election ID
  party: string | null;           // Party name
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// Filter component
export function CandidateFilters() {
  const [filters, setFilters] = useState<CandidateFilters>({
    position: null,
    county: null,
    status: null,
    search: '',
    election: null,
    party: null,
    dateRange: { start: null, end: null }
  });

  const handleFilterChange = (key: keyof CandidateFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Select
          label="Position"
          value={filters.position}
          onChange={(v) => handleFilterChange('position', v)}
          options={positionOptions}
        />
        <Select
          label="County"
          value={filters.county}
          onChange={(v) => handleFilterChange('county', v)}
          options={countyOptions}
        />
        <Select
          label="Status"
          value={filters.status}
          onChange={(v) => handleFilterChange('status', v)}
          options={statusOptions}
        />
        <Input
          label="Search"
          value={filters.search}
          onChange={(v) => handleFilterChange('search', v)}
          placeholder="Search by name..."
        />
        <Select
          label="Party"
          value={filters.party}
          onChange={(v) => handleFilterChange('party', v)}
          options={partyOptions}
        />
        <Button variant="secondary" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
```

### 3.2 Candidate Table

```typescript
// Candidate table columns
const columns = [
  {
    key: 'photo',
    label: '',
    render: (candidate: Candidate) => (
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img 
          src={candidate.photo || '/placeholder-avatar.png'} 
          alt={candidate.fullName}
          className="w-full h-full object-cover"
        />
      </div>
    )
  },
  {
    key: 'fullName',
    label: 'Name',
    sortable: true,
    render: (candidate: Candidate) => (
      <div>
        <p className="font-medium">{candidate.fullName}</p>
        <p className="text-sm text-gray-500">{candidate.candidateNumber}</p>
      </div>
    )
  },
  {
    key: 'position',
    label: 'Position',
    sortable: true,
    render: (candidate: Candidate) => (
      <Badge variant={getPositionBadgeVariant(candidate.position)}>
        {candidate.position}
      </Badge>
    )
  },
  {
    key: 'county',
    label: 'County',
    sortable: true,
    render: (candidate: Candidate) => candidate.countyName || '-'
  },
  {
    key: 'party',
    label: 'Party',
    render: (candidate: Candidate) => (
      <div className="flex items-center gap-2">
        {candidate.partySymbol && (
          <span>{candidate.partySymbol}</span>
        )}
        <span>{candidate.partyName || 'Independent'}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (candidate: Candidate) => (
      <Badge variant={getStatusBadgeVariant(candidate.status)}>
        {candidate.status}
      </Badge>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (candidate: Candidate) => (
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
        >
          View
        </Button>
        {candidate.status === 'pending' && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleApprove(candidate.id)}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleReject(candidate.id)}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    )
  }
];
```

---

## 4. Add Candidate (Super Admin Only)

### 4.1 Presidential Candidate Form

```typescript
// Presidential candidate form
interface PresidentialCandidateForm {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  
  // Photo
  photo: File | null;
  
  // Party Information
  partyName: string;
  partyAbbreviation: string;
  partySymbol: string;
  
  // Deputy
  deputyFullName: string;
  deputyDateOfBirth: Date;
  deputyPhoto: File | null;
  
  // Manifesto
  manifesto: string;
  manifestoHighlights: string[];
  
  // Nomination Details
  nominationCounty: string;
  nominatorCount: number;
  
  // Campaign
  campaignSlogan: string;
  ballotSymbol: string;
}

export function AddPresidentialCandidate() {
  const form = useForm<PresidentialCandidateForm>({
    resolver: zodResolver(presidentialCandidateSchema)
  });

  const onSubmit = async (data: PresidentialCandidateForm) => {
    const formData = new FormData();
    
    // Append all fields
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await fetch('/api/admin/presidential', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      toast.success('Presidential candidate added successfully');
      router.push('/admin/candidates');
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card title="Personal Information">
          <FormField name="firstName" label="First Name" required />
          <FormField name="lastName" label="Last Name" required />
          <FormField 
            name="dateOfBirth" 
            label="Date of Birth" 
            type="date" 
            required 
          />
          <FormField 
            name="gender" 
            label="Gender" 
            type="select" 
            options={genderOptions} 
            required 
          />
          <FormField 
            name="photo" 
            label="Passport Photo" 
            type="file" 
            accept="image/*"
            required 
          />
        </Card>

        {/* Party Information */}
        <Card title="Party Information">
          <FormField 
            name="partyName" 
            label="Party Name" 
            required 
          />
          <FormField 
            name="partyAbbreviation" 
            label="Party Abbreviation" 
            required 
          />
          <FormField 
            name="partySymbol" 
            label="Party Symbol" 
            type="file"
          />
          <FormField 
            name="campaignSlogan" 
            label="Campaign Slogan" 
          />
          <FormField 
            name="ballotSymbol" 
            label="Ballot Symbol (for visually impaired)" 
            required 
          />
        </Card>

        {/* Deputy Candidate */}
        <Card title="Deputy Presidential Candidate">
          <FormField 
            name="deputyFullName" 
            label="Full Name" 
            required 
          />
          <FormField 
            name="deputyDateOfBirth" 
            label="Date of Birth" 
            type="date" 
            required 
          />
          <FormField 
            name="deputyPhoto" 
            label="Passport Photo" 
            type="file" 
          />
        </Card>

        {/* Manifesto */}
        <Card title="Manifesto">
          <FormField 
            name="manifesto" 
            label="Full Manifesto" 
            type="textarea"
            rows={6}
          />
          <FormField 
            name="manifestoHighlights" 
            label="Key Highlights (one per line)" 
            type="textarea"
            rows={4}
          />
        </Card>

        {/* Nomination Details */}
        <Card title="Nomination Details">
          <FormField 
            name="nominationCounty" 
            label="Nomination County" 
            type="select"
            options={countyOptions}
            required 
          />
          <FormField 
            name="nominatorCount" 
            label="Number of Nominators" 
            type="number"
            required 
          />
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add Candidate
        </Button>
      </div>
    </Form>
  );
}
```

---

## 5. Candidate Detail Page

### 5.1 View Candidate

```typescript
// Candidate detail page
export function CandidateDetailPage({ candidateId }: { candidateId: string }) {
  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => fetch(`/api/admin/candidates/${candidateId}`).then(r => r.json())
  });

  if (isLoading) return <Skeleton />;
  if (!candidate) return <NotFound />;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            <img src={candidate.photo} alt={candidate.fullName} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{candidate.fullName}</h1>
            <p className="text-gray-500">{candidate.candidateNumber}</p>
            <Badge variant={getStatusBadgeVariant(candidate.status)}>
              {candidate.status}
            </Badge>
          </div>
        </div>
        
        {candidate.status === 'pending' && (
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => handleReject(candidate.id)}>
              Reject
            </Button>
            <Button variant="primary" onClick={() => handleApprove(candidate.id)}>
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Personal Details">
          <DetailRow label="Full Name" value={candidate.fullName} />
          <DetailRow label="Date of Birth" value={formatDate(candidate.dateOfBirth)} />
          <DetailRow label="Gender" value={candidate.gender} />
          <DetailRow label="Position" value={candidate.position} />
          {candidate.countyName && (
            <DetailRow label="County" value={candidate.countyName} />
          )}
        </Card>

        <Card title="Party Information">
          <DetailRow label="Party" value={candidate.partyName || 'Independent'} />
          <DetailRow label="Abbreviation" value={candidate.partyAbbreviation} />
          <DetailRow label="Symbol" value={candidate.partySymbol} />
          <DetailRow label="Slogan" value={candidate.campaignSlogan} />
        </Card>

        <Card title="Manifesto">
          <div className="prose max-w-none">
            <p>{candidate.manifesto}</p>
          </div>
          {candidate.manifestoHighlights && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Highlights:</h4>
              <ul className="list-disc pl-5">
                {candidate.manifestoHighlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Submission Details">
          <DetailRow label="Submitted By" value={candidate.submittedBy} />
          <DetailRow label="Submitted At" value={formatDateTime(candidate.submittedAt)} />
          {candidate.approvedBy && (
            <>
              <DetailRow label="Approved By" value={candidate.approvedBy} />
              <DetailRow label="Approved At" value={formatDateTime(candidate.approvedAt)} />
            </>
          )}
          {candidate.rejectionReason && (
            <DetailRow label="Rejection Reason" value={candidate.rejectionReason} />
          )}
        </Card>
      </div>

      {/* Audit Trail */}
      <Card title="Audit Trail" className="mt-6">
        <Timeline items={candidate.auditTrail} />
      </Card>
    </div>
  );
}
```

---

## 6. Bulk Actions

### 6.1 Bulk Approve/Reject

```typescript
// Bulk operations
interface BulkAction {
  candidateIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
}

export function useBulkCandidateActions() {
  const queryClient = useQueryClient();

  const bulkApprove = useMutation({
    mutationFn: async (data: BulkAction) => {
      const response = await fetch('/api/admin/candidates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidates approved successfully');
    }
  });

  const bulkReject = useMutation({
    mutationFn: async (data: BulkAction) => {
      const response = await fetch('/api/admin/candidates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidates rejected');
    }
  });

  return { bulkApprove, bulkReject };
}
```

---

## 7. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/candidates` | List all candidates |
| GET | `/api/admin/candidates/:id` | Get candidate details |
| POST | `/api/admin/candidates` | Create candidate |
| PUT | `/api/admin/candidates/:id` | Update candidate |
| PUT | `/api/admin/candidates/:id/approve` | Approve candidate |
| PUT | `/api/admin/candidates/:id/reject` | Reject candidate |
| POST | `/api/admin/candidates/bulk` | Bulk approve/reject |
| POST | `/api/admin/presidential` | Add presidential candidate |

---

## 8. Permissions

| Action | Super Admin | RO |
|-------|-------------|------|
| View all candidates | ✓ | County only |
| Add presidential candidate | ✓ | ✗ |
| Add county candidates | ✓ | ✓ |
| Approve candidates | ✓ | MCA only |
| Reject candidates | ✓ | ✗ |
| Edit candidates | ✓ | ✗ |
| Delete candidates | ✓ | ✗ |
