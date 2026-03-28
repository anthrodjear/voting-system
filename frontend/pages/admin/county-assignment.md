# County Assignment

## Overview

The County Assignment module enables Super Admins to manage the 47 Kenyan counties, assign Returning Officers to counties, and configure county-level settings including constituencies and wards.

---

## 1. Page Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COUNTY ASSIGNMENT PAGE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  [+ Add County]  [Import Counties]  [Export]                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  📊 COUNTY TABLE                                                     │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  Code │ County Name    │ RO Assigned    │ Voters    │ Status  │ Actions│  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  001  │ Mombasa        │ John Doe       │ 450,000   │ Active  │ [View] │  │
│  │  002  │ Kwale          │ [Unassigned]   │ 320,000   │ Active  │ [Assign]│ │
│  │  003  │ Kilifi         │ Jane Smith    │ 380,000   │ Active  │ [View] │  │
│  │  ...  │ ...            │ ...           │ ...       │ ...     │ ...    │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │  COUNTY DETAIL MODAL                                                 │  │
│  │  ─────────────────────────────────────────────────────────────────── │  │
│  │  County: Mombasa (001)                                               │  │
│  │  Region: Coast                                                       │  │
│  │  Capital: Mombasa                                                    │  │
│  │  Area: 212 km²                                                      │  │
│  │  Population: 1,208,333                                               │  │
│  │  Registered Voters: 450,000                                          │  │
│  │  Constituencies: 6 | Wards: 30 | Polling Stations: 450              │  │
│  │                                                                      │  │
│  │  Assigned RO: John Doe (Approved)                                     │  │
│  │  Contact: +254 712 345 678 | john@mombasa.go.ke                     │  │
│  │                                                                      │  │
│  │  [Edit County] [Assign RO] [View Voters] [View Candidates]           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Features

### 2.1 County Overview Cards

```typescript
// County card data
interface CountyCard {
  countyCode: string;
  countyName: string;
  region: string;
  population: number;
  registeredVoters: number;
  constituencies: number;
  wards: number;
  pollingStations: number;
  assignedRO: ReturningOfficer | null;
  status: 'active' | 'inactive';
  voterTurnout?: number;
}

// Component
export function CountyCards() {
  const { data: counties, isLoading } = useQuery({
    queryKey: ['counties'],
    queryFn: () => fetch('/api/admin/counties').then(r => r.json())
  });

  if (isLoading) return <CountyCardsSkeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {counties.map((county: CountyCard) => (
        <CountyCard 
          key={county.countyCode}
          county={county}
          onAssign={() => openAssignModal(county)}
          onViewDetails={() => navigate(`/admin/counties/${county.countyCode}`)}
        />
      ))}
    </div>
  );
}

// County card component
function CountyCard({ county, onAssign, onViewDetails }: CountyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{county.countyName}</h3>
          <span className="text-sm text-gray-500">{county.countyCode}</span>
        </div>
        <Badge variant={county.status === 'active' ? 'green' : 'gray'}>
          {county.status}
        </Badge>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Voters</span>
          <span className="font-medium">{formatNumber(county.registeredVoters)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Constituencies</span>
          <span className="font-medium">{county.constituencies}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Wards</span>
          <span className="font-medium">{county.wards}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        {county.assignedRO ? (
          <div className="flex items-center gap-2">
            <Avatar name={county.assignedRO.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {county.assignedRO.fullName}
              </p>
              <p className="text-xs text-gray-500">Assigned RO</p>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={onAssign}>
            Assign RO
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 3. RO Assignment Modal

### 3.1 Assignment Workflow

```typescript
// RO Assignment modal
interface AssignROModalProps {
  county: CountyCard;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignROModal({ county, isOpen, onClose }: AssignROModalProps) {
  const [step, setStep] = useState<'select' | 'review' | 'confirm'>('select');
  const [selectedRO, setSelectedRO] = useState<ReturningOfficer | null>(null);
  
  const { data: availableROs } = useQuery({
    queryKey: ['available-ros', county.countyCode],
    queryFn: () => fetch(`/api/admin/ro/available?county=${county.countyCode}`)
      .then(r => r.json())
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { countyCode: string; roId: string }) => {
      const response = await fetch('/api/admin/counties/assign-ro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success(`RO assigned to ${county.countyName}`);
      queryClient.invalidateQueries({ queryKey: ['counties'] });
      onClose();
    }
  });

  const handleAssign = () => {
    if (selectedRO) {
      assignMutation.mutate({
        countyCode: county.countyCode,
        roId: selectedRO.id
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header>
        <h2 className="text-lg font-semibold">
          Assign Returning Officer - {county.countyName}
        </h2>
      </Modal.Header>
      
      <Modal.Body>
        {step === 'select' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              Select an available Returning Officer to assign to {county.countyName}.
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableROs?.map((ro: ReturningOfficer) => (
                <div
                  key={ro.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedRO?.id === ro.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setSelectedRO(ro)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={ro.fullName} />
                    <div className="flex-1">
                      <p className="font-medium">{ro.fullName}</p>
                      <p className="text-sm text-gray-500">{ro.email}</p>
                    </div>
                    {selectedRO?.id === ro.id && (
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  {ro.preferredCounties.includes(county.countyName) && (
                    <Badge variant="green" className="mt-2">
                      Preferred County
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'review' && selectedRO && (
          <div className="text-center py-8">
            <Avatar name={selectedRO.fullName} size="lg" className="mx-auto" />
            <h3 className="mt-4 text-lg font-semibold">{selectedRO.fullName}</h3>
            <p className="text-gray-500">{selectedRO.email}</p>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium mb-2">Assignment Summary</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">County</dt>
                  <dd className="font-medium">{county.countyName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">RO Name</dt>
                  <dd className="font-medium">{selectedRO.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Contact</dt>
                  <dd className="font-medium">{selectedRO.phoneNumber}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        {step === 'select' && (
          <Button 
            variant="primary" 
            disabled={!selectedRO}
            onClick={() => setStep('review')}
          >
            Continue
          </Button>
        )}
        {step === 'review' && (
          <>
            <Button variant="secondary" onClick={() => setStep('select')}>
              Back
            </Button>
            <Button variant="primary" onClick={handleAssign}>
              Confirm Assignment
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 4. Add/Edit County

### 4.1 County Form

```typescript
// County form
interface CountyForm {
  countyCode: string;
  countyName: string;
  region: string;
  capital: string;
  areaSqKm: number;
  population: number;
  constituencies: number;
  wards: number;
}

export function AddCountyForm() {
  const form = useForm<CountyForm>({
    resolver: zodResolver(countySchema)
  });

  const onSubmit = async (data: CountyForm) => {
    const response = await fetch('/api/admin/counties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      toast.success('County added successfully');
      router.push('/admin/counties');
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField 
          name="countyCode" 
          label="County Code" 
          placeholder="e.g., 001"
          required 
        />
        <FormField 
          name="countyName" 
          label="County Name" 
          placeholder="e.g., Mombasa"
          required 
        />
        <FormField 
          name="region" 
          label="Region" 
          type="select"
          options={regionOptions}
          required 
        />
        <FormField 
          name="capital" 
          label="Capital City" 
          required 
        />
        <FormField 
          name="areaSqKm" 
          label="Area (km²)" 
          type="number"
          required 
        />
        <FormField 
          name="population" 
          label="Population" 
          type="number"
          required 
        />
        <FormField 
          name="constituencies" 
          label="Number of Constituencies" 
          type="number"
          required 
        />
        <FormField 
          name="wards" 
          label="Number of Wards" 
          type="number"
          required 
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Add County
        </Button>
      </div>
    </Form>
  );
}
```

---

## 5. County Detail Page

### 5.1 Detailed View

```typescript
// County detail page
export function CountyDetailPage({ countyCode }: { countyCode: string }) {
  const { data: county, isLoading } = useQuery({
    queryKey: ['county', countyCode],
    queryFn: () => fetch(`/api/admin/counties/${countyCode}`).then(r => r.json())
  });

  if (isLoading) return <Skeleton />;
  if (!county) return <NotFound />;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{county.countyName}</h1>
            <p className="text-gray-500">Code: {county.countyCode}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => openEditModal(county)}>
              Edit
            </Button>
            <Button variant="primary" onClick={() => openAssignModal(county)}>
              {county.assignedRO ? 'Reassign RO' : 'Assign RO'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Population" value={formatNumber(county.population)} />
        <StatCard title="Registered Voters" value={formatNumber(county.registeredVoters)} />
        <StatCard title="Constituencies" value={county.constituencies} />
        <StatCard title="Wards" value={county.wards} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RO Information */}
        <Card title="Returning Officer">
          {county.assignedRO ? (
            <div className="flex items-center gap-4">
              <Avatar name={county.assignedRO.fullName} size="lg" />
              <div>
                <p className="font-medium">{county.assignedRO.fullName}</p>
                <p className="text-sm text-gray-500">{county.assignedRO.email}</p>
                <p className="text-sm text-gray-500">{county.assignedRO.phoneNumber}</p>
                <Badge variant="green" className="mt-2">
                  {county.assignedRO.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <UserAddIcon className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500">No RO assigned</p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-4"
                onClick={() => openAssignModal(county)}
              >
                Assign RO
              </Button>
            </div>
          )}
        </Card>

        {/* Geographic Info */}
        <Card title="Geographic Information">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Region</dt>
              <dd className="font-medium">{county.region}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Capital</dt>
              <dd className="font-medium">{county.capital}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Area</dt>
              <dd className="font-medium">{county.areaSqKm} km²</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Population Density</dt>
              <dd className="font-medium">
                {Math.round(county.population / county.areaSqKm)} / km²
              </dd>
            </div>
          </dl>
        </Card>

        {/* Election Statistics */}
        <Card title="Election Statistics">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Polling Stations</dt>
              <dd className="font-medium">{county.pollingStations}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Election Turnout</dt>
              <dd className="font-medium">{county.lastTurnout}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Votes Cast (Last)</dt>
              <dd className="font-medium">{formatNumber(county.lastVotesCast)}</dd>
            </div>
          </dl>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UsersIcon className="w-4 h-4 mr-2" />
              View Registered Voters
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CandidateIcon className="w-4 h-4 mr-2" />
              View County Candidates
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ChartIcon className="w-4 h-4 mr-2" />
              View Election Results
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapIcon className="w-4 h-4 mr-2" />
              Manage Constituencies
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/counties` | List all counties |
| GET | `/api/admin/counties/:code` | Get county details |
| POST | `/api/admin/counties` | Create county |
| PUT | `/api/admin/counties/:code` | Update county |
| DELETE | `/api/admin/counties/:code` | Delete county |
| POST | `/api/admin/counties/assign-ro` | Assign RO to county |
| GET | `/api/admin/counties/:code/voters` | Get county voters |
| GET | `/api/admin/counties/:code/candidates` | Get county candidates |
| GET | `/api/admin/counties/:code/results` | Get election results |

---

## 7. Bulk Operations

### 7.1 Import Counties

```typescript
// Bulk import from CSV
interface BulkImportResult {
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

export function ImportCountiesModal() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CountyForm[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/counties/import', {
      method: 'POST',
      body: formData
    });

    const result: BulkImportResult = await response.json();
    setIsProcessing(false);
    
    if (result.failed > 0) {
      showImportErrors(result.errors);
    } else {
      toast.success(`Successfully imported ${result.success} counties`);
      queryClient.invalidateQueries({ queryKey: ['counties'] });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>Import Counties</Modal.Header>
      <Modal.Body>
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <CloudUploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="mt-2 text-gray-600">
            Drop CSV file here or click to browse
          </p>
          <input 
            type="file" 
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </div>
        
        {/* Preview table */}
        {preview.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Preview (first 5 rows)</h4>
            <Table columns={countyColumns} data={preview.slice(0, 5)} />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button 
          variant="primary" 
          disabled={!file || isProcessing}
          onClick={processFile}
        >
          {isProcessing ? 'Processing...' : 'Import'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## 8. Permissions

| Action | Super Admin | Admin | RO |
|-------|-------------|-------|-----|
| View all counties | ✓ | ✓ | ✗ |
| Add county | ✓ | ✗ | ✗ |
| Edit county | ✓ | ✗ | ✗ |
| Delete county | ✓ | ✗ | ✗ |
| Assign RO | ✓ | ✗ | ✗ |
| View county voters | ✓ | ✓ | ✓ (own county) |
| View county candidates | ✓ | ✓ | ✓ (own county) |
