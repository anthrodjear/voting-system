# Integration Tests

## Overview

Integration tests verify that the Blockchain Voting System components work correctly together, including backend APIs, database operations, external services (blockchain), and frontend interactions. These tests simulate real-world scenarios across the entire application stack.

---

## Test Scenarios

### 1. Voter Registration Flow

The voter registration flow tests the complete journey from form submission to voter verification.

#### Test Steps

1. **Navigate to Registration Page**
   - User visits `/register`

2. **Fill Registration Form**
   - National ID: Valid 8-digit format (e.g., `12345678`)
   - First Name: Valid name (e.g., `John`)
   - Last Name: Valid name (e.g., `Doe`)
   - Email: Valid email format (e.g., `john@example.com`)
   - Phone Number: Valid Kenyan format (e.g., `+254700000000`)
   - Date of Birth: Valid date (e.g., `1990-01-01`)
   - County: Select from dropdown (e.g., `Nairobi`)
   - Constituency: Auto-populated based on county
   - Ward: Auto-populated based on constituency
   - Password: Secure password (min 8 characters)

3. **Form Validation**
   - Client-side validation runs on blur and submit
   - Error messages display for invalid fields

4. **Submit Registration**
   - User clicks "Register" button
   - API request sent to `POST /api/voters/register`

5. **Backend Processing**
   - Validate DTO
   - Check for duplicate National ID
   - Hash password using Argon2
   - Create voter record in database
   - Create default vote tracking record
   - Create audit log entry

6. **Response Handling**
   - Success: Redirect to success page or login
   - Error: Display error message

#### Expected Results

| Scenario | Expected Outcome |
|----------|-----------------|
| Valid registration data | HTTP 201, success message, voter created |
| Duplicate National ID | HTTP 409, "Voter already exists" error |
| Invalid email format | HTTP 400, validation error |
| Missing required fields | HTTP 400, validation errors |
| Database error | HTTP 500, generic error message |

#### Test Data Setup

```typescript
const validVoterData = {
  nationalId: '12345678',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '+254700000000',
  dateOfBirth: '1990-01-01',
  county: 'Nairobi',
  constituency: 'Westlands',
  ward: 'Kitisuru',
  password: 'SecurePassword123!',
};

const duplicateVoterData = {
  ...validVoterData,
  nationalId: '87654321', // Already registered
};
```

---

### 2. Voter Login Flow

#### Test Steps

1. **Navigate to Login Page**
   - User visits `/login`

2. **Enter Credentials**
   - National ID: Registered voter ID
   - Password: Valid password

3. **Submit Login**
   - User clicks "Login" button
   - API request sent to `POST /api/auth/login`

4. **Backend Processing**
   - Validate credentials
   - Verify voter exists and is verified
   - Generate JWT token

5. **Response Handling**
   - Success: Store JWT, redirect to dashboard
   - Error: Display error message

#### Expected Results

| Scenario | Expected Outcome |
|----------|-----------------|
| Valid credentials | HTTP 200, JWT token returned |
| Invalid National ID | HTTP 401, "Invalid credentials" |
| Invalid password | HTTP 401, "Invalid credentials" |
| Unverified voter | HTTP 403, "Account pending verification" |
| Voter not approved by admin | HTTP 403, "Account not approved" |

---

### 3. Voting Flow

The complete voting flow tests the core functionality of the system.

#### Test Steps

1. **Authenticate Voter**
   - Login with valid credentials (verified voter)
   - Obtain JWT token

2. **Request Ballot**
   - API request: `GET /api/votes/ballot`
   - Include JWT in Authorization header

3. **Backend Processing**
   - Verify voter identity from token
   - Check for active election
   - Retrieve approved candidates grouped by position
   - Return ballot data

4. **Display Ballot**
   - Render positions with candidates
   - Show candidate details (photo, name, party, symbol)

5. **Cast Vote**
   - Select one candidate per position
   - Submit ballot
   - API request: `POST /api/votes`

6. **Backend Processing**
   - Validate voter hasn't already voted
   - Check election is active
   - Encrypt vote (mock in development)
   - Generate vote hash
   - Create vote record
   - Update vote tracking
   - Increment election vote count
   - Create audit log

7. **Confirmation**
   - Generate unique confirmation number (format: `VN[A-Z0-9]{12}`)
   - Return confirmation details
   - Display confirmation screen

#### Expected Results

| Scenario | Expected Outcome |
|----------|-----------------|
| Valid ballot submission | HTTP 201, confirmation number generated |
| Already voted | HTTP 403, "You have already cast your vote" |
| No active election | HTTP 400, "No active election" |
| Incomplete selections | HTTP 400, validation error |
| Election expired | HTTP 400, "Election has ended" |

#### Test Data Setup

```typescript
const mockBallot = {
  ballotId: 'ballot_election-1',
  electionId: 'election-1',
  electionName: 'General Election 2024',
  positions: [
    {
      position: 'president',
      title: 'President',
      candidates: [
        {
          id: 'candidate-1',
          firstName: 'John',
          lastName: 'Doe',
          party: 'Party A',
          symbol: 'A',
          photo: '/images/candidates/1.jpg',
        },
        {
          id: 'candidate-2',
          firstName: 'Jane',
          lastName: 'Smith',
          party: 'Party B',
          symbol: 'B',
          photo: '/images/candidates/2.jpg',
        },
      ],
    },
    {
      position: 'governor',
      title: 'Governor',
      candidates: [...],
    },
  ],
};

const voteSubmission = {
  ballotId: 'ballot_election-1',
  encryptedVote: 'encrypted-vote-data',
  zkProof: 'zk-proof-data',
  batchId: 'batch-123',
};
```

---

### 4. Admin Approval Flow

#### Test Steps

1. **Admin Login**
   - Login with admin credentials
   - Obtain admin JWT token

2. **View Pending Voters**
   - API request: `GET /api/admin/voters?status=pending`
   - Returns list of unapproved voters

3. **Approve Voter**
   - API request: `PATCH /api/admin/voters/{id}/approve`
   - Update voter status to "verified"

4. **Backend Processing**
   - Verify admin authorization
   - Update voter record
   - Create audit log

5. **Response**
   - Success: Voter status updated
   - Error: Appropriate error message

#### Expected Results

| Scenario | Expected Outcome |
|----------|-----------------|
| Admin approves voter | HTTP 200, voter status = 'verified' |
| Non-admin tries to approve | HTTP 403, unauthorized error |
| Approve non-existent voter | HTTP 404, not found error |
| Already approved voter | HTTP 400, already approved error |

---

### 5. Batch Processing

Tests the batch voting mechanism for high-volume scenarios.

#### Test Steps

1. **Create Batch**
   - Admin creates voting batch
   - API request: `POST /api/batches`

2. **Batch Assignment**
   - Voters assigned to batch
   - Batch info stored with voter session

3. **Batch Voting**
   - Voters vote within batch context
   - Batch ID stored with vote

4. **Batch Processing**
   - Process votes in batch
   - Submit to blockchain

5. **Batch Completion**
   - Update batch status to completed
   - Generate final results

#### Expected Results

| Scenario | Expected Outcome |
|----------|-----------------|
| Create batch | HTTP 201, batch created with ID |
| Add voters to batch | Voters linked to batch |
| Process batch | Votes processed successfully |
| Batch timeout | Expired status, votes invalidated |

---

## Test Data Setup

### Database Seeding

Use the provided seed scripts to populate test data:

```bash
# Seed all data
npm run seed:all

# Seed specific entities
npm run seed:county
npm run seed:constituency
npm run seed:ward
npm run seed:election
npm run seed:voter
npm run seed:candidate
```

### Test Fixtures

Create reusable test fixtures for consistent test data:

```typescript
// tests/fixtures/voter.fixture.ts
export const createVoterFixture = (overrides = {}) => ({
  nationalId: '12345678',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phoneNumber: '+254700000000',
  dateOfBirth: '1990-01-01',
  county: 'Nairobi',
  constituency: 'Westlands',
  ward: 'Kitisuru',
  password: 'SecurePass123!',
  status: 'pending',
  ...overrides,
});

// tests/fixtures/election.fixture.ts
export const createElectionFixture = (overrides = {}) => ({
  id: 'election-1',
  name: 'General Election 2024',
  description: 'National elections',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  status: 'draft',
  totalVotesCast: 0,
  ...overrides,
});
```

### Mock Data for Integration Tests

```typescript
// Mock external services
const mockBlockchainService = {
  submitTransaction: jest.fn().mockResolvedValue({
    txHash: '0xabc123def456',
    blockNumber: 12345678,
    status: 'confirmed',
  }),
  getTransactionReceipt: jest.fn().mockResolvedValue({
    status: '0x1',
    blockNumber: 12345678,
  }),
};

const mockEmailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendVoteConfirmation: jest.fn().mockResolvedValue(true),
};
```

---

## Running Tests

### Command Reference

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test suite
npm run test:integration -- --testPathPattern="voting"

# Run with coverage
npm run test:integration -- --coverage

# Run in watch mode (development)
npm run test:integration -- --watch

# Run specific test
npm run test:integration -- --testNamePattern="Voter Registration"
```

### Test Environment Setup

```bash
# 1. Start required services
docker-compose up -d postgres redis

# 2. Run database migrations
npm run typeorm migration:run

# 3. Seed test data
npm run seed:all

# 4. Start backend in test mode
npm run start:test

# 5. Start frontend
cd ../frontend && npm run dev

# 6. Run integration tests
npm run test:integration
```

---

## Expected Results

### Voter Registration Flow Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Voter registered successfully",
  "data": {
    "voterId": "voter-uuid",
    "nationalId": "12345678",
    "status": "pending"
  }
}
```

### Vote Casting Results

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "confirmationId": "VNABC123DEF456",
    "voteHash": "0xhash1234567890abcdef",
    "timestamp": "2024-01-15T10:30:00Z",
    "message": "Vote recorded successfully"
  }
}
```

### Vote Status Check Results

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "hasVoted": true,
    "confirmationId": "VNABC123DEF456",
    "votedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Handling Tests

### API Error Responses

Test various error scenarios:

```typescript
describe('Error Handling', () => {
  it('should return 401 for unauthorized access', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/votes/ballot')
      .expect(401);
  });

  it('should return 400 for invalid input', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/votes')
      .set('Authorization', `Bearer ${voterToken}`)
      .send({
        ballotId: '',
        encryptedVote: '',
      })
      .expect(400);
  });

  it('should return 500 for internal server errors', async () => {
    // Mock database error
    mockVoteRepository.save.mockRejectedValue(new Error('Database error'));
    
    const response = await request(app.getHttpServer())
      .post('/api/votes')
      .set('Authorization', `Bearer ${voterToken}`)
      .send(validVoteData)
      .expect(500);
  });
});
```

---

## Performance Testing

### Load Test Scenarios

Test system performance under load:

```typescript
describe('Performance Tests', () => {
  it('should handle 100 concurrent vote submissions', async () => {
    const promises = Array(100).fill(null).map(() =>
      request(app.getHttpServer())
        .post('/api/votes')
        .set('Authorization', `Bearer ${voterToken}`)
        .send(voteData)
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    expect(successful.length).toBeGreaterThan(95); // 95%+ success rate
  });

  it('should respond within 2 seconds for ballot request', async () => {
    const start = Date.now();
    
    await request(app.getHttpServer())
      .get('/api/votes/ballot')
      .set('Authorization', `Bearer ${voterToken}`);
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

---

## CI/CD Integration

### Integration Test Pipeline

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: voting_system_test
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run typeorm migration:run
        
      - name: Seed data
        run: npm run seed:all
      
      - name: Run integration tests
        run: npm run test:integration -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Troubleshooting

### Common Integration Test Issues

1. **Database connection failures**: Ensure PostgreSQL is running
2. **Port conflicts**: Check no other services use ports 3000, 5432, 6379
3. **Token expiration**: Use fresh tokens for each test
4. **Race conditions**: Use proper test isolation and cleanup

### Debugging Tips

```bash
# Enable verbose logging
npm run test:integration -- --verbose

# Run single test with debugging
npm run test:integration -- --testNamePattern="test name" --verbose

# Check test output
cat test-output.log
```

---

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Clean up data after each test
- Use transactions for database operations

### 2. Realistic Test Data

- Use data that mirrors production
- Test edge cases and boundary conditions

### 3. Clear Assertions

```typescript
// Good: Specific, meaningful assertions
expect(result.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
expect(result.voteHash).toBeDefined();
expect(result.timestamp).toBeInstanceOf(Date);

// Avoid: Vague assertions
expect(result).toBeDefined();
```

### 4. Error Scenario Coverage

- Test happy path
- Test validation errors
- Test authentication failures
- Test authorization violations
- Test edge cases
