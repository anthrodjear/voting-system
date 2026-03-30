# Voting System Backend

NestJS backend for the blockchain voting system.

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 15.x
- Redis 7.x

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Configure `.env` file with your database and Redis credentials

4. Run the application:
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Documentation

Once running, visit `http://localhost:3000/api/docs` for Swagger documentation.

## Project Structure

```
src/
├── main.ts                    # Application entry
├── app.module.ts              # Root module
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── guards/               # Auth guards
│   ├── interceptors/         # HTTP interceptors
│   └── pipes/                # Validation pipes
├── modules/
│   ├── auth/                  # Authentication
│   ├── voter/                # Voter management
│   ├── candidate/            # Candidate management
│   ├── vote/                 # Voting operations
│   ├── batch/                # Batch processing
│   ├── admin/                # Admin operations
│   └── reporting/            # Reports & analytics
├── entities/                 # TypeORM entities
└── dto/                      # Data Transfer Objects
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/mfa/verify` - Verify MFA
- `POST /api/auth/logout` - Logout

### Voters
- `POST /api/voters/register` - Register voter
- `GET /api/voters/:id` - Get voter info
- `PUT /api/voters/:id` - Update voter
- `POST /api/voters/:id/biometrics/enroll` - Enroll biometrics
- `GET /api/voters/:id/status` - Get voter status

### Candidates
- `GET /api/candidates` - List candidates
- `GET /api/candidates/:id` - Get candidate
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/:id/approve` - Approve candidate

### Votes
- `GET /api/votes/ballot` - Get ballot
- `POST /api/votes/cast` - Cast vote
- `GET /api/votes/confirmation/:id` - Get confirmation
- `GET /api/votes/status/:voterId` - Check vote status

### Batches
- `POST /api/batches/join` - Join batch
- `POST /api/batches/:id/vote` - Submit vote to batch
- `GET /api/batches/:id/status` - Get batch status
- `POST /api/batches/heartbeat` - Send heartbeat
- `POST /api/batches/:id/leave` - Leave batch

### Admin
- `POST /api/admin/counties` - Add county
- `GET /api/admin/counties` - List counties
- `POST /api/admin/ro/applications` - Submit RO application
- `GET /api/admin/ro/applications` - List RO applications
- `PUT /api/admin/ro/applications/:id` - Review RO application
- `POST /api/admin/presidential` - Add presidential candidate

### Reports
- `GET /api/reports/results` - Get election results
- `GET /api/reports/turnout` - Get turnout statistics
- `GET /api/reports/audit` - Get audit report
- `GET /api/reports/blockchain/status` - Get blockchain status

## Security Features

- JWT authentication with refresh tokens
- Role-based access control (voter, ro, admin)
- MFA support (biometric/TOTP)
- Rate limiting per endpoint
- Input validation with class-validator
- Argon2 password hashing
