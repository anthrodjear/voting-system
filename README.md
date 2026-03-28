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

## System Roles

| Role | Description |
|------|-------------|
| **Super Admin** | Approves RO registrations, manages counties, adds presidential candidates |
| **Returning Officer (RO)** | Manages county candidates, oversees county voting operations |
| **Voter** | Registers, verifies identity, casts vote |

## Technology Stack

### Frontend
- React 18 / Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (State Management)

### Backend
- Node.js 20 LTS / NestJS
- PostgreSQL 15
- Redis 7
- RabbitMQ (Message Queue)

### Blockchain
- Hyperledger Besu (Private Blockchain)
- Solidity 0.8.x (Smart Contracts)
- Web3.js / Ethers.js

### Security
- PKI / Certificate Authority
- Hardware Security Module (HSM)
- Homomorphic Encryption (PALISADE/SEAL)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/iebc/voting-system.git
cd voting-system

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│   Web App (Voters) │ Mobile App │ Admin Dashboard           │
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

## Project Structure

```
voting-system/
├── backend/           # NestJS API server
├── frontend/          # React/Next.js applications
├── blockchain/        # Smart contracts & node configuration
├── docs/             # Documentation
├── tests/            # Test suites
└── scripts/          # Deployment & utility scripts
```

## Documentation

- [Design Overview](DESIGN.md)
- [Backend Architecture](backend/backend.md)
- [Frontend Structure](frontend/frontend.md)
- [Security Details](docs/security.md)
- [Scalability & Throughput](docs/scalability.md)
- [Project Phases](docs/project-phases.md)

## License

Proprietary - IEBC Internal Use Only
