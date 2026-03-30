# Backend Tests

## Overview

The backend testing strategy for the Blockchain Voting System follows a multi-layered approach to ensure reliability, security, and correctness of all server-side operations. The NestJS backend uses Jest as its testing framework with TypeORM mocking for database operations.

---

## Test Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (for integration tests)
- Redis (for caching)

### Environment Configuration

Create a `.env.test` file for test environment:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_NAME=voting_system_test

# JWT
JWT_SECRET=test-secret-key-for-testing
JWT_EXPIRATION=1h

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Dependencies

The backend uses the following testing dependencies:

```json
{
  "devDependencies": {
    "@nestjs/testing": "^10.4.22",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1"
  }
}
```

### Jest Configuration

The `jest.config.js` file configures test behavior:

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.(t|j)s',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- vote.service.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="castVote"

# Run tests and generate JUnit XML report
npm test -- --reporters=default --reporters=jest-junit
```

### Coverage Goals

The project targets the following code coverage thresholds:

| Type | Target Coverage |
|------|----------------|
| **Services** | 90%+ |
| **Controllers** | 85%+ |
| **Guards** | 90%+ |
| **DTOs/Validations** | 85%+ |
| **Overall** | 80%+ |

To view detailed coverage reports:

```bash
# Generate HTML coverage report
npm run test:cov

# Coverage report location
# backend/coverage/lcov-report/index.html
```

---

## Test Patterns

### 1. Unit Tests with Repository Mocks

The backend uses Jest's mocking capabilities to isolate services from database operations:

```typescript
describe('VoteService', () => {
  let service: VoteService;

  // Mock repositories
  const mockVoteRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
  };

  const mockTrackingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        { provide: getRepositoryToken(Vote), useValue: mockVoteRepository },
        { provide: getRepositoryToken(VoteTracking), useValue: mockTrackingRepository },
        // ... other providers
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
    jest.clearAllMocks(); // Reset mocks between tests
  });
});
```

### 2. Service Test Examples

#### Example: VoteService - getBallot

```typescript
describe('getBallot', () => {
  const mockElection = {
    id: 'election-1',
    name: 'General Election 2024',
    status: 'voting',
  };

  const mockCandidates = [
    {
      id: 'candidate-1',
      firstName: 'John',
      lastName: 'Doe',
      position: 'president',
      status: 'approved',
      electionId: 'election-1',
      photo: 'photo-url',
      county: { countyName: 'Nairobi' },
    },
  ];

  it('should return ballot with candidates grouped by position', async () => {
    mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockCandidateRepository.find.mockResolvedValue(mockCandidates);

    const result = await service.getBallot('voter-1');

    expect(result.ballotId).toBe('ballot_election-1');
    expect(result.electionId).toBe('election-1');
    expect(result.positions).toBeDefined();
  });

  it('should throw NotFoundException when voter not found', async () => {
    mockVoterRepository.findOne.mockResolvedValue(null);

    await expect(service.getBallot('nonexistent-voter')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when no active election', async () => {
    mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
    mockElectionRepository.findOne.mockResolvedValue(null);

    await expect(service.getBallot('voter-1')).rejects.toThrow(BadRequestException);
  });

  it('should only include approved candidates', async () => {
    // Test that only approved candidates are returned
    mockVoterRepository.findOne.mockResolvedValue({ id: 'voter-1' });
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockCandidateRepository.find.mockResolvedValue(mockCandidates);

    const result = await service.getBallot('voter-1');

    const allApproved = result.positions.every((p: any) =>
      p.candidates.every((c: any) => c.candidateId),
    );
    expect(allApproved).toBe(true);
  });
});
```

#### Example: VoteService - castVote

```typescript
describe('castVote', () => {
  const voteDto = {
    ballotId: 'ballot_election-1',
    encryptedVote: 'encrypted-vote-data',
    zkProof: 'zk-proof-data',
    batchId: 'batch-1',
  };

  it('should cast vote successfully for new voter', async () => {
    mockVoterRepository.findOne.mockResolvedValue(mockVoter);
    mockTrackingRepository.findOne.mockResolvedValue(null);
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockVoteRepository.save.mockImplementation((v) =>
      Promise.resolve({ id: 'vote-1', ...v }),
    );
    mockTrackingRepository.save.mockResolvedValue({ id: 'tracking-1' });
    mockElectionRepository.increment.mockResolvedValue({ affected: 1 });
    mockAuditLogRepository.save.mockResolvedValue({});

    const result = await service.castVote('voter-1', voteDto);

    expect(result.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
    expect(result.voteHash).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.message).toBe('Vote recorded successfully');
  });

  it('should throw ForbiddenException if voter already voted', async () => {
    mockVoterRepository.findOne.mockResolvedValue(mockVoter);
    mockTrackingRepository.findOne.mockResolvedValue({
      id: 'tracking-1',
      hasVoted: true,
      votedAt: new Date(),
    });

    await expect(service.castVote('voter-1', voteDto)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should generate unique confirmation number', async () => {
    // Test confirmation number format
    mockVoterRepository.findOne.mockResolvedValue(mockVoter);
    mockTrackingRepository.findOne.mockResolvedValue(null);
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockVoteRepository.save.mockImplementation((v) =>
      Promise.resolve({ id: 'vote-1', ...v }),
    );

    const result = await service.castVote('voter-1', voteDto);

    expect(result.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
  });

  it('should create vote hash from encrypted vote', async () => {
    mockVoterRepository.findOne.mockResolvedValue(mockVoter);
    mockTrackingRepository.findOne.mockResolvedValue(null);
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockVoteRepository.save.mockImplementation((v) =>
      Promise.resolve({ id: 'vote-1', ...v }),
    );

    const result = await service.castVote('voter-1', voteDto);

    expect(result.voteHash).toBeDefined();
    expect(typeof result.voteHash).toBe('string');
  });

  it('should create audit log entry for vote', async () => {
    mockVoterRepository.findOne.mockResolvedValue(mockVoter);
    mockTrackingRepository.findOne.mockResolvedValue(null);
    mockElectionRepository.findOne.mockResolvedValue(mockElection);
    mockVoteRepository.save.mockImplementation((v) =>
      Promise.resolve({ id: 'vote-1', ...v }),
    );

    await service.castVote('voter-1', voteDto);

    expect(mockAuditLogRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'voter-1',
        userRole: 'voter',
        action: 'vote_cast',
        resource: 'vote',
      }),
    );
  });
});
```

### 3. Testing DTO Validation

```typescript
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterVoterDto } from './register-voter.dto';

describe('RegisterVoterDto', () => {
  let dto: RegisterVoterDto;

  beforeEach(() => {
    dto = new RegisterVoterDto();
  });

  it('should validate National ID format', async () => {
    dto.nationalId = 'invalid';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john@example.com';
    dto.phoneNumber = '+254700000000';

    const errors = await validate(plainToInstance(RegisterVoterDto, dto));

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('nationalId');
  });

  it('should validate valid National ID', async () => {
    dto.nationalId = '12345678';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john@example.com';
    dto.phoneNumber = '+254700000000';

    const errors = await validate(plainToInstance(RegisterVoterDto, dto));

    expect(errors.length).toBe(0);
  });

  it('should validate email format', async () => {
    dto.nationalId = '12345678';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'invalid-email';
    dto.phoneNumber = '+254700000000';

    const errors = await validate(plainToInstance(RegisterVoterDto, dto));

    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
```

### 4. Testing Guards and Interceptors

```typescript
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should allow access with valid token', async () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer valid-token',
          },
        }),
      }),
    };

    const result = await guard.canActivate(mockExecutionContext as any);
    expect(result).toBe(true);
  });

  it('should deny access without token', async () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    };

    await expect(guard.canActivate(mockExecutionContext as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```

---

## Integration Test Setup

### Test Database Configuration

Integration tests require a test database. Configure TypeORM for testing:

```typescript
// test/jest-e2e.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
```

### Database Setup Script

```bash
# Create test database
psql -U test_user -c "CREATE DATABASE voting_system_test;"

# Run migrations
npm run typeorm migration:run

# Seed test data
npm run seed
```

### Integration Test Example

```typescript
// test/voting.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('VotingController (e2e)', () => {
  let app: INestApplication;
  let voterToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/votes/ballot', () => {
    it('should return ballot for authenticated voter', async () => {
      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          nationalId: '12345678',
          password: 'password123',
        })
        .expect(201);

      voterToken = loginResponse.body.access_token;

      // Get ballot
      const ballotResponse = await request(app.getHttpServer())
        .get('/api/votes/ballot')
        .set('Authorization', `Bearer ${voterToken}`)
        .expect(200);

      expect(ballotResponse.body).toHaveProperty('ballotId');
      expect(ballotResponse.body).toHaveProperty('positions');
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/api/votes/ballot')
        .expect(401);
    });
  });

  describe('POST /api/votes', () => {
    it('should cast vote successfully', async () => {
      const voteResponse = await request(app.getHttpServer())
        .post('/api/votes')
        .set('Authorization', `Bearer ${voterToken}`)
        .send({
          ballotId: 'ballot_election-1',
          encryptedVote: 'encrypted-vote-data',
          zkProof: 'zk-proof-data',
        })
        .expect(201);

      expect(voteResponse.body).toHaveProperty('confirmationId');
      expect(voteResponse.body.confirmationId).toMatch(/^VN[A-Z0-9]{12}$/);
    });

    it('should prevent double voting', async () => {
      await request(app.getHttpServer())
        .post('/api/votes')
        .set('Authorization', `Bearer ${voterToken}`)
        .send({
          ballotId: 'ballot_election-1',
          encryptedVote: 'encrypted-vote-data',
          zkProof: 'zk-proof-data',
        })
        .expect(403);
    });
  });
});
```

### Running Integration Tests

```bash
# Run e2e tests
npm run test:e2e

# Run specific e2e test file
npm run test:e2e -- voting.e2e-spec.ts
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/backend-tests.yml
name: Backend Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
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
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

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
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run linter
        run: |
          cd backend
          npm run lint

      - name: Run tests
        run: |
          cd backend
          npm test -- --coverage
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          JWT_SECRET: test-secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage
          flags: backend
```

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - coverage

variables:
  NODE_VERSION: "20"

test:
  stage: test
  image: node:${NODE_VERSION}
  services:
    - postgres:15
    - redis:7
  before_script:
    - cd backend
    - npm ci
    - npm run typeorm migration:run
  script:
    - npm test -- --coverage
  coverage: /All files[^|]*\|[^|]*\s+([\d\.]+)/
  artifacts:
    reports:
      junit: coverage/junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

---

## Test Coverage Reports

### Viewing Coverage Reports

After running tests with coverage:

```bash
# Open HTML report
open backend/coverage/lcov-report/index.html

# View in terminal
npm run test:cov -- --coverageReporters=text-summary
```

### Coverage Thresholds in CI

```javascript
// jest.config.js
module.exports = {
  // ... other config
  coverageThreshold: {
    'src/modules/**/*.service.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/modules/**/*.controller.ts': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## Best Practices

### 1. Test Naming Convention

Use descriptive test names that explain what is being tested:

```typescript
// Good
it('should throw NotFoundException when voter not found')

// Avoid
it('test1')
```

### 2. Arrange-Act-Assert Pattern

Structure tests consistently:

```typescript
it('should cast vote successfully', async () => {
  // Arrange
  const voteDto = { ... };
  mockVoterRepository.findOne.mockResolvedValue(voter);

  // Act
  const result = await service.castVote('voter-1', voteDto);

  // Assert
  expect(result.confirmationId).toBeDefined();
});
```

### 3. Mock External Dependencies

Always mock external services:

```typescript
// Mock blockchain service
const mockBlockchainService = {
  submitTransaction: jest.fn().mockResolvedValue({
    txHash: '0xabc123',
    blockNumber: 123456,
  }),
};
```

### 4. Test Edge Cases

Include tests for error conditions and edge cases:

```typescript
it('should handle database connection failure', async () => {
  mockVoteRepository.save.mockRejectedValue(new Error('DB connection failed'));

  await expect(service.castVote('voter-1', voteDto)).rejects.toThrow();
});
```

---

## Troubleshooting

### Common Issues

1. **Mocks not resetting**: Always call `jest.clearAllMocks()` in `beforeEach`
2. **Async test timeouts**: Increase timeout for complex async operations
3. **Database connection**: Ensure test database is running before tests
4. **Environment variables**: Set required env vars in test configuration

### Debugging Tests

```bash
# Run tests in debug mode
npm test -- --detectOpenHandles

# Run only failed tests
npm test -- --onlyFailures

# Show test output even on success
npm test -- --verbose
```
