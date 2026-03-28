# Backend Architecture

## Overview

The backend is built on **NestJS** with a microservices-inspired architecture. It handles voter registration, authentication, candidate management, voting operations, and blockchain integration.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BACKEND ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      API GATEWAY                             │   │
│   │         (Kong / AWS API Gateway)                             │   │
│   │   Rate Limiting │ Auth │ Routing │ Logging                   │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                   NESTJS APPLICATION                         │   │
│   │                                                              │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │  │  Voter   │  │   Auth   │  │Candidate │  │   Vote   │  │   │
│   │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   │                                                              │   │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│   │  │Biometric │  │  Batch   │  │   Admin  │  │  Report  │  │   │
│   │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │   │
│   │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │   │
│   │                                                              │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                      DATA LAYER                              │   │
│   │   PostgreSQL │ Redis │ RabbitMQ │ Blockchain                 │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | NestJS | 10.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 15.x |
| Cache | Redis | 7.x |
| Message Queue | RabbitMQ | 3.12.x |
| ORM | Prisma / TypeORM | Latest |
| Validation | class-validator | Latest |
| Documentation | Swagger/OpenAPI | Latest |

---

## 3. Service Architecture

### 3.1 Core Services

#### Voter Service

**Responsibilities:**
- Voter registration
- Voter profile management
- Voter status tracking
- Voter verification

**Key Operations:**
```typescript
// Voter registration flow
interface VoterService {
  register(data: VoterRegistrationData): Promise<Voter>;
  verify(id: string): Promise<VerificationResult>;
  getStatus(id: string): Promise<VoterStatus>;
  updateProfile(id: string, data: Partial<Voter>): Promise<Voter>;
}
```

#### Authentication Service

**Responsibilities:**
- User authentication
- Session management
- Token issuance
- MFA management

**Key Operations:**
```typescript
interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthToken>;
  verifyMFA(userId: string, mfaCode: string): Promise<boolean>;
  refreshToken(token: string): Promise<AuthToken>;
  logout(userId: string): Promise<void>;
}
```

#### Candidate Service

**Responsibilities:**
- Candidate registration
- Candidate verification
- Candidate profile management
- Position/race management

**Key Operations:**
```typescript
interface CandidateService {
  createCandidate(data: CandidateData): Promise<Candidate>;
  approveCandidate(id: string): Promise<Candidate>;
  getCandidates(filters: CandidateFilters): Promise<Candidate[]>;
  getByPosition(position: string, county?: string): Promise<Candidate[]>;
}
```

#### Vote Service

**Responsibilities:**
- Ballot presentation
- Vote casting
- Vote validation
- Vote encryption
- Confirmation generation

**Key Operations:**
```typescript
interface VoteService {
  getBallot(voterId: string): Promise<Ballot>;
  castVote(voterId: string, encryptedVote: EncryptedVote): Promise<VoteConfirmation>;
  verifyVote(voterId: string): Promise<VoteStatus>;
  getConfirmation(confirmationId: string): Promise<VoteDetails>;
}
```

#### Biometric Service

**Responsibilities:**
- Biometric template storage
- Face matching
- Fingerprint matching
- Liveness detection

**Key Operations:**
```typescript
interface BiometricService {
  enrollFace(voterId: string, faceData: FaceTemplate): Promise<EnrollmentResult>;
  enrollFingerprint(voterId: string, fingerprintData: FingerprintTemplate): Promise<EnrollmentResult>;
  verifyFace(voterId: string, faceData: FaceTemplate): Promise<VerificationResult>;
  verifyFingerprint(voterId: string, fingerprintData: FingerprintTemplate): Promise<VerificationResult>;
  checkLiveness(imageData: ImageData): Promise<LivenessResult>;
}
```

#### Batch Service (Smart Group-Based Voting)

**Responsibilities:**
- Batch creation and management
- Voter assignment to batches
- Idle voter detection
- Vote pool aggregation

**Key Operations:**
```typescript
interface BatchService {
  assignToBatch(voterId: string): Promise<BatchAssignment>;
  submitVote(voterId: string, encryptedVote: EncryptedVote): Promise<SubmitResult>;
  getBatchStatus(batchId: string): Promise<BatchStatus>;
  heartbeat(voterId: string): Promise<void>;
}
```

#### Admin Service

**Responsibilities:**
- RO application review
- County management
- Presidential candidate management
- System configuration

#### Reporting Service

**Responsibilities:**
- Vote tallying
- Statistics generation
- Audit reports
- Election results

---

## 4. API Structure

### 4.1 REST Endpoints

```
POST   /api/v1/voters/register          # Voter registration
GET    /api/v1/voters/:id               # Get voter info
PUT    /api/v1/voters/:id               # Update voter
POST   /api/v1/voters/:id/verify        # Verify voter

POST   /api/v1/auth/login               # User login
POST   /api/v1/auth/logout              # Logout
POST   /api/v1/auth/refresh             # Refresh token
POST   /api/v1/auth/mfa/setup           # Setup MFA
POST   /api/v1/auth/mfa/verify          # Verify MFA

GET    /api/v1/candidates               # List candidates
POST   /api/v1/candidates                # Create candidate (RO/Admin)
PUT    /api/v1/candidates/:id/approve   # Approve candidate

GET    /api/v1/votes/ballot             # Get ballot
POST   /api/v1/votes/cast                # Cast vote
GET    /api/v1/votes/confirmation/:id   # Get confirmation

POST   /api/v1/batches/join             # Join batch
POST   /api/v1/batches/:id/vote         # Submit vote to batch
GET    /api/v1/batches/:id/status       # Get batch status
POST   /api/v1/batches/heartbeat        # Voter heartbeat

POST   /api/v1/admin/ro/applications    # Submit RO application
GET    /api/v1/admin/ro/applications    # List RO applications
PUT    /api/v1/admin/ro/applications/:id # Review RO application

POST   /api/v1/admin/counties           # Add county
GET    /api/v1/admin/counties           # List counties

POST   /api/v1/admin/presidential       # Add presidential candidate
GET    /api/v1/reports/results          # Get election results
GET    /api/v1/reports/audit            # Get audit report
```

### 4.2 WebSocket Events

```typescript
// Real-time events for batch management
interface WebSocketEvents {
  // Client → Server
  'batch:join'       // Join a voting batch
  'batch:leave'      // Leave batch
  'vote:submit'      // Submit vote
  'batch:heartbeat'  // Send heartbeat

  // Server → Client
  'batch:assigned'   // Assigned to batch
  'batch:vote_ready' // Ballot ready
  'batch:completed'  // Batch finished
  'vote:confirmed'   // Vote confirmed
  'notification'     // General notifications
}
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. CREDENTIALS                                                   │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Voter: National ID + Password                              │   │
│   │  RO: Email + Password                                      │   │
│   │  Admin: Email + Password                                    │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   2. MFA CHALLENGE                                                  │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Voter: Face + Fingerprint                                  │   │
│   │  RO/Admin: TOTP + Password                                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   3. TOKEN ISSUANCE                                                │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │  Access Token: 15 minutes                                   │   │
│   │  Refresh Token: 7 days (encrypted)                         │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Role-Based Access Control (RBAC)

| Permission | Super Admin | RO | Voter |
|------------|------------|-----|-------|
| Approve RO Applications | ✓ | ✗ | ✗ |
| Add Counties  | ✓ | ✗ | ✗ |
| Confirm candidates from RO | ✓ | ✗ | ✗ |
| Add Presidential Candidates | ✓ | ✗ | ✗ |
| Manage County subcounties and wards Candidates | ✗ | ✓ | ✗ |
| Add subcounties and wards in their assigned county | ✗ | ✓ | ✗ |
| Apply for RO Position | ✗ | ✓ | ✗ |
| Register to Vote | ✗ | ✗ | ✓ |
| Cast Vote | ✗ | ✗ | ✓ |
| View Own Records | ✓ | ✓ | ✓ |
| View County Statistics | ✗ | ✓ | ✗ |
| View National Results | ✓ | ✗ | ✗ |
| Approve County Candidates| ✓ | ✗ | ✗ | 
---

## 6. Data Flow

### 6.1 Voter Registration Flow

```
Voter                    Backend                       Database
  │                         │                             │
  │ 1. POST /voters/register                         │
  │ ──────────────────────>│                             │
  │                         │                             │
  │                    Validate input                   │
  │                    Check ID uniqueness               │
  │                         │                             │
  │                    Create pending record             │
  │                         │ ──────────────────────────>│
  │                         │                             │
  │ 2. Biometric Enrollment│                             │
  │ ──────────────────────>│                             │
  │                         │                             │
  │                    Extract templates                │
  │                    Encrypt templates                 │
  │                    Store securely                    │
  │                         │ ──────────────────────────>│
  │                         │                             │
  │                    Generate voter ID                 │
  │                         │ ──────────────────────────>│
  │                         │                             │
  │ 3. Registration Complete│                             │
  │ <──────────────────────│                             │
  │                         │                             │
```

### 6.2 Voting Flow

```
Voter              Batch Service      Vote Service        Blockchain
  │                    │                   │                   │
  │ 1. Login + MFA   │                   │                   │
  │─────────────────>│                   │                   │
  │                  │                   │                   │
  │              Assign Batch           │                   │
  │<────────────────│                   │                   │
  │                  │                   │                   │
  │ 2. Get Ballot   │                   │                   │
  │─────────────────>│                   │                   │
  │              Return ballot          │                   │
  │<────────────────│                   │                   │
  │                  │                   │                   │
  │ 3. Submit Vote  │                   │                   │
  │(encrypted)─────>│                   │                   │
  │                  │                   │                   │
  │              Store in batch         │                   │
  │                  │                   │                   │
  │              Batch full/timeout     │                   │
  │                  │ ─────────────────>│                   │
  │                  │                   │                   │
  │                  │           Aggregate votes            │
  │                  │                   │ ────────────────> │
  │                  │                   │                   │
  │                  │         Verify & submit              │
  │                  │<───────────────────                  │
  │                  │                   │                   │
  │ 4. Confirmation │                   │                   │
  │<────────────────│                   │                   │
  │                  │                   │                   │
```

---

## 7. Error Handling

### 7.1 Error Codes

| Code | Category | Description |
|------|----------|-------------|
| 1000-1999 | Authentication | Login failures, MFA errors |
| 2000-2999 | Voter | Registration, verification errors |
| 3000-3999 | Candidate | Candidate management errors |
| 4000-4999 | Voting | Vote casting, validation errors |
| 5000-5999 | Batch | Batch management errors |
| 6000-6999 | Blockchain | Blockchain integration errors |
| 9000-9999 | System | Internal errors |

### 7.2 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": 4001,
    "message": "Voter already registered",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 8. Performance Optimization

### 8.1 Caching Strategy

| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Voter profile | Redis | 1 hour |
| Ballot data | Memory | Per session |
| Candidate list | Redis | 5 minutes |
| Batch status | Memory | Real-time |
| Election config | Redis | 24 hours |

### 8.2 Database Optimization

- Read replicas for queries
- Connection pooling (PgBouncer)
- Indexing on frequently queried fields
- Query optimization with EXPLAIN
- Batch inserts for bulk operations

### 8.3 Async Processing

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ASYNC PROCESSING                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SYNCHRONOUS:              ASYNC (RabbitMQ):                        │
│  ├── User login            ├── Vote aggregation                     │
│  ├── Ballot retrieval      ├── Blockchain submission                │
│  ├── Batch assignment     ├── Notification delivery                 │
│  └── Vote confirmation    ├── Report generation                    │
│                            └── Audit logging                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Logging & Monitoring

### 9.1 Log Levels

| Level | Usage |
|-------|-------|
| ERROR | System errors requiring attention |
| WARN | Potential issues, degraded performance |
| INFO | Normal operations, key events |
| DEBUG | Detailed debugging information |
| TRACE | Verbose tracing (development only) |

### 9.2 Logged Events

- Authentication attempts (success/failure)
- Voter registration
- Vote casting
- Admin actions
- System errors
- Performance metrics

---

## 10. File Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry
│   ├── app.module.ts              # Root module
│   │
│   ├── common/                    # Shared utilities
│   │   ├── decorators/           # Custom decorators
│   │   ├── filters/              # Exception filters
│   │   ├── guards/               # Auth guards
│   │   ├── interceptors/        # HTTP interceptors
│   │   └── pipes/                # Validation pipes
│   │
│   ├── config/                   # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── blockchain.config.ts
│   │
│   ├── modules/
│   │   ├── auth/                # Authentication
│   │   ├── voter/               # Voter management
│   │   ├── candidate/           # Candidate management
│   │   ├── vote/                # Voting operations
│   │   ├── biometric/           # Biometric handling
│   │   ├── batch/               # Batch processing
│   │   ├── admin/               # Admin operations
│   │   └── reporting/          # Reports & analytics
│   │
│   ├── services/                # Business logic
│   │   ├── blockchain.service.ts
│   │   ├── cryptography.service.ts
│   │   └── notification.service.ts
│   │
│   ├── entities/                # Database entities
│   │   ├── voter.entity.ts
│   │   ├── candidate.entity.ts
│   │   ├── ro.entity.ts
│   │   └── vote.entity.ts
│   │
│   └── repositories/            # Data access
│       ├── voter.repository.ts
│       └── candidate.repository.ts
│
├── test/                        # Test files
├── docker-compose.yml           # Local development
├── Dockerfile                   # Container build
├── package.json
└── tsconfig.json
```

---

## 11. Dependencies

### 11.1 Internal Modules

- **auth**: Authentication & authorization
- **voter**: Voter registration & management
- **candidate**: Candidate management
- **vote**: Voting operations
- **biometric**: Biometric verification
- **batch**: Smart batch processing
- **admin**: Admin operations
- **reporting**: Reports & analytics

### 11.2 External Dependencies

- `@nestjs/core`: Framework
- `@nestjs/typeorm`: Database ORM
- `@nestjs/passport`: Authentication
- `@nestjs/swagger`: API documentation
- `@nestjs/config`: Configuration
- `typeorm`: Database ORM
- `pg`: PostgreSQL driver
- `ioredis`: Redis client
- `amqplib`: RabbitMQ client

---

## 12. Security Considerations

### 12.1 Input Validation

- All inputs validated using `class-validator`
- Strict type checking
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)

### 12.2 Rate Limiting

- Global: 1000 requests/minute
- Authentication: 10 attempts/minute
- Voting: 1 vote/minute
- Batch operations: 100 requests/minute

### 12.3 Encryption

- Passwords: Argon2 hashing
- Tokens: AES-256-GCM
- Database fields: Encrypted at rest
- Keys: Stored in HSM

---

## 13. Scalability

### 13.1 Horizontal Scaling

The backend is designed for horizontal scaling:

- Stateless services
- Session data in Redis
- Load balancer distribution
- Database read replicas

### 13.2 Performance Targets

| Operation | Target |
|-----------|--------|
| API response (p95) | < 500ms |
| Vote submission | < 2s |
| Voter verification | < 3s |
| Batch assignment | < 100ms |

---

## 14. Summary

The backend architecture provides:

1. **Modular design** with clear service boundaries
2. **Scalability** through stateless services and async processing
3. **Security** through multi-layer authentication and encryption
4. **Reliability** through error handling and logging
5. **Performance** through caching and optimization

The Smart Group-Based Voting is implemented in the **Batch Service**, handling voter assignment, vote aggregation, and blockchain submission.
