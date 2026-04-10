# Blockchain Voting System

## Kenya IEBC-Inspired Electronic Voting Platform

---

## Overview

A secure, scalable blockchain-based voting system designed for national elections. The system supports 20M+ voters with a throughput of 5,000 voters per second using smart group-based voting with dynamic batch processing.

## Key Features

- **Smart Group-Based Voting**: Dynamic batch orchestration for handling high concurrency
- **Hybrid Blockchain Architecture**: Private layer for validation, public layer for transparency
- **Multi-Factor Authentication**: ID + Password + Face + Fingerprint verification
- **End-to-End Encryption**: Homomorphic encryption for vote privacy
- **Zero-Knowledge Proofs**: Vote validity without revealing voter choice
- **Real-time Processing**: 5,000 votes/second throughput
- **Comprehensive Audit Logging**: Complete audit trail of all actions

## System Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Approves RO registrations, manages counties, adds presidential candidates |
| **Returning Officer (RO)** | Manages county candidates, oversees county voting operations |
| **Voter** | Registers, verifies identity, casts vote |

## Technology Stack

### Frontend
- **Framework**: React 18 / Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Client**: Axios + TanStack React Query
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + Playwright (E2E)

### Backend
- **Framework**: NestJS 11
- **Language**: Node.js 20 LTS (TypeScript)
- **Database**: PostgreSQL 15 (TypeORM 0.3.19)
- **Cache**: Redis 7 (ioredis)
- **Message Queue**: RabbitMQ (3-management-alpine)
- **Authentication**: Passport JWT + Argon2 (password hashing)
- **API Documentation**: Swagger/NestJS Swagger
- **Rate Limiting**: @nestjs/throttler

### Blockchain
- **Platform**: Hyperledger Besu (Private Blockchain)
- **Smart Contracts**: Solidity 0.8.x
- **Web3 Library**: Web3.js 4.x

### Security
- **PKI / Certificate Authority**
- **Hardware Security Module (HSM)**
- **Homomorphic Encryption (PALISADE/SEAL)**

## Project Structure

```
voting-system/
├── backend/                    # NestJS API server
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Authentication (login, logout, refresh)
│   │   │   ├── voter/          # Voter registration & management
│   │   │   ├── vote/           # Vote casting & tracking
│   │   │   ├── candidate/      # Candidate management
│   │   │   ├── admin/          # Admin dashboard & management
│   │   │   ├── ro/             # Returning Officer module
│   │   │   ├── batch/          # Batch processing
│   │   │   ├── blockchain/     # Blockchain integration
│   │   │   ├── health/         # Health checks
│   │   │   └── reporting/      # Reporting & statistics
│   │   ├── entities/          # TypeORM entities (17 models)
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── common/             # Guards, decorators, interceptors
│   │   ├── config/             # Configuration modules
│   │   ├── database/           # Migrations & seeds
│   │   └── blockchain/         # Smart contract ABIs & configs
│   └── package.json
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   │   ├── auth/          # Login, register, forgot-password
│   │   │   ├── admin/         # Admin dashboard & management pages
│   │   │   ├── ro/            # Returning Officer pages
│   │   │   └── voter/         # Voter pages (register, vote, dashboard)
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Reusable UI components
│   │   │   └── layout/        # Layout components (Sidebar, Header)
│   │   ├── services/          # API client services
│   │   ├── stores/            # Zustand stores
│   │   ├── providers/         # React context providers
│   │   └── types/             # TypeScript types
│   └── package.json
│
├── k8s/                        # Kubernetes deployment configs
├── docs/                       # Documentation
├── scripts/                    # Deployment & utility scripts
├── docker-compose.yml          # Docker services configuration
└── .env.example                # Environment template
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/iebc/voting-system.git
cd voting-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run with Docker
docker-compose up -d

# Or run individually
cd backend && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

## API Endpoints

### Auth Controller (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Token refresh |
| POST | `/auth/mfa/verify` | MFA verification |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### Voter Controller (`/api/voters`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/voters/register` | Register new voter |
| GET | `/voters/stats` | Get voter statistics |
| GET | `/voters/profile` | Get voter profile |
| GET | `/voters/check-id/:nationalId` | Check ID availability |
| GET | `/voters/:id` | Get voter by ID |
| PUT | `/voters/:id` | Update voter |
| POST | `/voters/:id/biometrics/enroll` | Enroll biometrics |

### Vote Controller (`/api/votes`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/votes/ballot` | Get ballot for voter |
| POST | `/votes/cast` | Cast a vote |
| GET | `/votes/confirmation/:id` | Get vote confirmation |
| GET | `/votes/status/:voterId` | Check vote status |

### Admin Controller (`/api/admin`)
Full CRUD for: Counties, Constituencies, Wards, Elections, Candidates, Voters, Returning Officers, RO Applications, Admin Users, Dashboard Stats, Audit Logs

### RO Controller (`/api/ro`)
Dashboard stats, Pending approvals, Voter management, Candidate management

## Database Models

The system uses 17 TypeORM entities:

1. **Voter** - Registered voters with biometric data
2. **VoterBiometric** - Face/fingerprint data (1:1 with Voter)
3. **Election** - Election configuration and dates
4. **Vote** - Individual vote records (encrypted)
5. **VoteTracking** - Vote status tracking
6. **Candidate** - County-level candidates
7. **PresidentialCandidate** - National presidential candidates
8. **SuperAdmin** - System administrators
9. **ReturningOfficer** - County-level officers
10. **Session** - User sessions (JWT)
11. **County** - Geographic region
12. **Constituency** - Sub-region of county
13. **Ward** - Sub-region of constituency
14. **RoApplication** - RO applications
15. **AuditLog** - System audit trail
16. **LoginHistory** - Login attempt tracking
17. **Batch** - Vote batch processing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│   Web App (Voters) │ Admin Dashboard │ RO Dashboard         │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│   Authentication │ Rate Limiting │ Request Validation       │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICES LAYER                            │
│   Voter │ Auth │ Candidate │ Vote │ Biometric │ Batch      │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│   PostgreSQL │ Redis Cache │ Blockchain Network             │
└─────────────────────────────────────────────────────────────┘
```

## Smart Group-Based Voting

The system uses dynamic batch processing to handle high concurrency:

1. Voters are assigned to batches (up to 1,000 voters per batch)
2. Idle voters (>120s) are moved to pending queue
3. Votes are aggregated in a vote pool before blockchain submission
4. This approach reduces blockchain congestion while maintaining throughput

## Security Measures

- **Authentication**: Multi-factor (ID + Password + Biometrics)
- **Encryption**: TLS 1.3 (transport), AES-256-GCM (storage), HE (voting)
- **Blockchain**: Permissioned validators, consensus mechanism
- **Audit**: Complete audit trail, immutable logs

## Documentation

- [Security Details](docs/security.md)
- [Scalability & Throughput](docs/scalability.md)
- [Project Phases](docs/project-phases.md)
- [UI Design System](docs/ui-design-system.md)
- [UX Research Report](docs/ux-research-report.md)

## License

Proprietary - IEBC Internal Use Only
