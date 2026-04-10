# System Design Document

## Blockchain Voting System

**Version:** 1.0  
**Date:** April 2026  
**Status:** Final  
**Document Owner:** System Architecture Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
   2.1 [System Context](#21-system-context)
   2.2 [System Actors](#22-system-actors)
   2.3 [System Boundaries](#23-system-boundaries)
3. [Architecture Design](#3-architecture-design)
4. [Component Design](#4-component-design)
5. [Data Flow Design](#5-data-flow-design)
6. [API Design](#6-api-design)
7. [Database Design](#7-database-design)
8. [Security Design](#8-security-design)
9. [Infrastructure Design](#9-infrastructure-design)
10. [Blockchain Design](#10-blockchain-design)
11. [Integration Design](#11-integration-design)
12. [Monitoring & Observability](#12-monitoring--observability)
13. [Disaster Recovery](#13-disaster-recovery)
14. [Technology Stack](#14-technology-stack)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

This document provides a comprehensive system design for the Blockchain Voting System, an enterprise-grade electronic voting platform inspired by the Kenya Independent Electoral and Boundaries Commission (IEBC) specifications. The system is designed to support national elections with 20 million+ registered voters while maintaining security, transparency, and verifiability.

### 1.2 Scope

The system encompasses:
- **Voter Registration**: Identity verification, biometric enrollment, multi-factor authentication
- **Vote Casting**: Secure ballot delivery, encrypted vote submission, confirmation generation
- **Election Management**: Election creation, candidate management, ballot configuration
- **Results Processing**: Vote tallying, result publication, verification mechanisms
- **Blockchain Integration**: Vote anchoring, result immutability, transparency layer

### 1.3 Key Requirements

| Requirement | Specification |
|--------------|---------------|
| **Total Voters** | 20,000,000+ |
| **Throughput** | 5,000 votes/second |
| **Availability** | 99.9% uptime |
| **Vote Latency** | < 2 seconds |
| **Security** | Multi-factor, encryption, audit logging |
| **Transparency** | Verifiable results, public blockchain |

### 1.4 Design Principles

1. **Security First**: Every component prioritizes security and integrity
2. **Privacy by Design**: Voter choice remains confidential through cryptography
3. **Transparency**: Anyone can verify results without compromising voter privacy
4. **Scalability**: Handle 20M+ voters with 5,000 votes/second throughput
5. **Resilience**: Graceful degradation under load, offline support

---

## 2. System Overview

### 2.1 System Context

The Blockchain Voting System operates within a broader electoral ecosystem:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ELECTORAL ECOSYSTEM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌─────────────┐  │
│  │   National ID System  │   │   Biometric Registry │    |   Blockchain│  │
│  │        (NIMC)         │    │                     │    │   Network   │  │
│  └──────────┬───────────┘    └──────────┬───────────┘    └──────┬──────┘  │
│             │                          │                      │          │
│             └──────────────────────────┼──────────────────────┘          │
│                                         │                                    │
│                                         ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BLOCKCHAIN VOTING SYSTEM                          │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │   Frontend   │  │    Backend   │  │   Database   │  │  Message │ │   │
│  │  │   (Next.js)  │◄─┤    (NestJS)  │◄─┤  (PostgreSQL) │  │   Queue   │ │   │
│  │  └──────────────┘  └──────┬───────┘  └──────────────┘  └──────────┘ │   │
│  │                           │                                       │   │
│  │                    ┌──────┴───────┐                                 │   │
│  │                    │   Blockchain │                                 │   │
│  │                    │   (Hyperledger Besu)                          │   │
│  │                    └──────────────┘                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Voters   │  │ Returning   │  │    Admin    │  │   Public    │         │
│  │             │  │   Officers  │  │   Users    │  │  Observers  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 System Actors

The system has 5 primary actors with distinct roles, responsibilities, and access levels:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ACTORS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         VOTER (20M+)                                  │   │
│  │  - Register and verify identity                                       │   │
│  │  - Cast encrypted votes                                              │   │
│  │  - Verify vote confirmation                                          │   │
│  │  - View election results                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    RETURNING OFFICER (~290)                         │   │
│  │  - Manage county candidates                                          │   │
│  │  - Oversee county voting operations                                  │   │
│  │  - Verify county voters                                              │   │
│  │  - Monitor county results                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       ADMIN (< 5 )                                   │   │
│  │  - System configuration                                             │   │
│  │  - Manage elections                                                  │   │
│  │  - Approve ROs                                                       │   │
│  │  - View all reports                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  BLOCKCHAIN VALIDATOR (4-50)                         │   │
│  │  - Validate transactions                                            │   │
│  │  - Participate in consensus                                          │   │
│  │  - Store vote hashes                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PUBLIC OBSERVER (∞)                              │   │
│  │  - View election results                                             │   │
│  │  - Verify vote hashes on-chain                                      │   │
│  │  - Download result data                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2.2.1 Voter Actor

**Description:** A registered citizen eligible to vote in elections.

**Characteristics:**
- **Quantity:** 20M+ registered voters
- **Authentication:** Multi-factor (National ID + Password + Face + Fingerprint)
- **Device:** Web browser, mobile PWA, or dedicated voting kiosk
- **Technical Proficiency:** Variable (from tech-savvy to non-technical)

**Use Cases:**

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-V001 | Register as a voter with identity and biometrics | Critical |
| UC-V002 | Login with multi-factor authentication | Critical |
| UC-V003 | View available elections and ballot | Critical |
| UC-V004 | Cast encrypted vote with ZK proof | Critical |
| UC-V005 | Receive and store vote confirmation | Critical |
| UC-V006 | Verify vote using confirmation number | High |
| UC-V007 | View election results after close | High |
| UC-V008 | Update profile information | Medium |
| UC-V009 | Reset password with identity verification | High |

**Permissions:**
- Read: own profile, available elections, results
- Write: own vote, own profile
- Deny: other voters' data, system configuration

**User Flow - Vote Casting:**
```
1. Login → MFA (ID + Password + Face + Fingerprint)
2. View ballot → Select candidates for each position
3. Confirm selection → Client-side encryption + ZK proof
4. Submit → Encrypted vote + proof to backend
5. Receive → Confirmation number (VN[A-Z0-9]{12})
6. Verify → Optional verification using confirmation
```

#### 2.2.2 Returning Officer (RO) Actor

**Description:** County-level election official responsible for managing voting operations within a specific county.

**Characteristics:**
- **Quantity:** ~290 (one per constituency, with senior ROs per county)
- **Authentication:** JWT + MFA
- **Device:** Desktop browser (admin dashboard)
- **Technical Proficiency:** Moderate (election administration training)

**Sub-Roles:**
| Sub-Role | Description |
|----------|-------------|
| **County RO** | Senior officer managing entire county |
| **Constituency RO** | Officer managing constituency-level operations |
| **Sub-RO** | Assistant to primary RO |

**Use Cases:**

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-RO001 | View county dashboard with statistics | Critical |
| UC-RO002 | Manage county candidates (CRUD) | Critical |
| UC-RO003 | Approve/reject candidate applications | High |
| UC-RO004 | View and verify county voters | High |
| UC-RO005 | Monitor real-time county voting | Critical |
| UC-RO006 | Generate county reports | High |
| UC-RO007 | Manage election configuration for county | High |
| UC-RO008 | View audit logs for county operations | Medium |

**Permissions:**
- Read: county voters, county candidates, county elections, county reports
- Write: county candidates, voter verification status
- Deny: other counties' data, system configuration

**User Flow - Candidate Management:**
```
1. Login → JWT + MFA
2. View pending candidate applications
3. Review candidate details (photo, bio, documents)
4. Approve or reject with reason
5. Update candidate list for county
6. System generates audit log
```

#### 2.2.3 Admin Actor

**Description:** System administrator with full access to platform configuration and management.

**Characteristics:**
- **Quantity:** < 5  (Super Admin + Regional Admins)
- **Authentication:** JWT + MFA + HSM key access
- **Device:** Desktop browser (admin panel)
- **Technical Proficiency:** High (technical training required)

**Sub-Roles:**
| Sub-Role | Description |
|----------|-------------|
| **Super Admin** | Full system access, can manage other admins |
| **Admin** | Limited to assigned regions/functions |

**Use Cases:**

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-AD001 | Manage elections (create, configure, activate, close) | Critical |
| UC-AD002 | Manage counties, constituencies, wards | Critical |
| UC-AD003 | Add/manage presidential candidates | Critical |
| UC-AD004 | Approve/reject RO applications | Critical |
| UC-AD005 | Manage RO assignments | High |
| UC-AD006 | Configure system parameters | High |
| UC-AD007 | View system-wide analytics and reports | Critical |
| UC-AD008 | Manage other admin users | High |
| UC-AD009 | Export data (CSV, JSON, PDF) | High |
| UC-AD010 | View comprehensive audit logs | High |
| UC-AD011 | Configure blockchain parameters | Medium |
| UC-AD012 | Manage notification templates | Medium |

**Permissions:**
- Read: all data across all counties
- Write: all configuration, all users, all elections
- Deny: none (full access with audit logging)

#### 2.2.4 Blockchain Validator Actor

**Description:** Node operator participating in the Hyperledger Besu consensus network.

**Characteristics:**
- **Quantity:** 4-50 validator nodes
- **Authentication:** X.509 certificates + network permissions
- **Device:** Server infrastructure
- **Technical Proficiency:** Expert (blockchain operations)

**Use Cases:**

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-BV001 | Validate incoming vote transactions | Critical |
| UC-BV002 | Participate in IBFT 2.0 consensus | Critical |
| UC-BV003 | Store vote hashes in blocks | Critical |
| UC-BV004 | Verify vote proofs on-chain | High |
| UC-BV005 | Generate final election results | Critical |
| UC-BV006 | Sync blockchain state | Critical |
| UC-BV007 | Monitor network health | High |

**Permissions:**
- Read: blockchain state, pending transactions
- Write: block creation, consensus participation
- Deny: arbitrary state modification

#### 2.2.5 Public Observer Actor

**Description:** Any person or organization wanting to verify election transparency.

**Characteristics:**
- **Quantity:** Unlimited (anonymous access)
- **Authentication:** None required
- **Device:** Any web browser
- **Technical Proficiency:** Variable

**Use Cases:**

| Use Case | Description | Priority |
|----------|-------------|----------|
| UC-PO001 | View final election results | Critical |
| UC-PO002 | Verify vote hash on blockchain | High |
| UC-PO003 | Download result data exports | High |
| UC-PO004 | View candidate information | Medium |
| UC-PO005 | View election statistics | Medium |

**Permissions:**
- Read: election results, candidate info, public blockchain data
- Write: none
- Deny: any authenticated operations

### 2.3 System Boundaries

**In Scope:**
- Voter registration and authentication
- Vote casting and confirmation
- Election management
- Results processing
- Blockchain integration
- Admin dashboard

**Out of Scope:**
- Physical voting equipment manufacturing
- Voter education campaigns
- Legal dispute resolution
- External system integrations (unless specified)

---

## 3. Architecture Design

### 3.1 Architectural Patterns

The system follows a **Layered Architecture** with **Microservices** principles:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE LAYERS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     PRESENTATION LAYER                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │   Web App   │  │Mobile PWA   │  │ Admin Panel │  │   REST    │  │    │
│  │  │  (Next.js)  │  │  (React)    │  │  (Next.js)  │  │   APIs    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       API GATEWAY LAYER                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │  Rate Limit │  │    Auth     │  │    Valid.   │  │    CORS    │  │    │
│  │  │   (Throttler)│  │   (JWT)    │  │  (Zod DTOs)  │  │  (Headers) │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      BUSINESS LAYER                                │    │
│  │                                                                       │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │   Auth     │  │   Voter    │  │   Vote     │  │  Candidate │   │    │
│  │   │  Module    │  │  Module    │  │  Module    │  │   Module   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                       │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │   Batch    │  │   Admin    │  │   Reporting│  │   Health   │   │    │
│  │   │  Module    │  │  Module    │  │  Module    │  │   Module   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        DATA LAYER                                   │    │
│  │                                                                       │    │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │    │
│  │   │ PostgreSQL │  │    Redis   │  │  RabbitMQ  │  │ Blockchain │   │    │
│  │   │  (Primary) │  │   (Cache)  │  │   (Queue)  │  │   (Besu)   │   │    │
│  │   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │    │
│  │                                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Design Patterns Used

| Pattern | Application | Purpose |
|---------|-------------|---------|
| **Layered Architecture** | Presentation → API → Business → Data | Clear separation of concerns |
| **Repository Pattern** | TypeORM Entities | Database abstraction |
| **Service Layer** | NestJS Modules | Business logic encapsulation |
| **Factory Pattern** | DTO Validators | Object creation validation |
| **Observer Pattern** | Event Emitters | Decoupled event handling |
| **Strategy Pattern** | Authentication | Pluggable auth methods |
| **Circuit Breaker** | External APIs | Failure isolation |

### 3.3 Component Interaction

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT INTERACTION DIAGRAM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   VOTER                                                                    │
│     │                                                                      │
│     ├──[1]──► Frontend (Next.js)                                            │
│     │        │                                                               │
│     │        ├──[2]──► Auth Service (JWT + MFA)                             │
│     │        │        │                                                      │
│     │        │        ├──[3]──► Redis (Session Cache)                       │
│     │        │        │                                                      │
│     │        │        └──[4]──► PostgreSQL (User Data)                      │
│     │        │                                                               │
│     │        └──[5]──► Vote Service                                         │
│     │                 │                                                      │
│     │                 ├──[6]──► Batch Service (Queue)                       │
│     │                 │        │                                             │
│     │                 │        └──[7]──► RabbitMQ (Message Queue)          │
│     │                 │                                                       │
│     │                 └──[8]──► Blockchain Service                           │
│     │                          │                                             │
│     │                          └──[9]──► Hyperledger Besu                   │
│     │                                    │                                   │
│     │                          ┌────────┴────────┐                            │
│     │                          │ Smart Contracts │                            │
│     │                          │  (Solidity)     │                            │
│     │                          └─────────────────┘                            │
│     │                                                                      │
│   ADMIN                                                                    │
│     │                                                                      │
│     └──[10]──► Admin Module                                                 │
│                │                                                            │
│                ├──[11]──► County/Constituency Management                     │
│                ├──[12]──► Candidate Management                              │
│                ├──[13]──► Election Configuration                           │
│                └──[14]──► Reporting & Analytics                            │
│                                                                         │
│   RETURNING OFFICER                                                         │
│     │                                                                      │
│     └──[15]──► RO Module                                                    │
│                │                                                            │
│                ├──[16]──► County Voter Management                           │
│                ├──[17]──► County Candidate Management                       │
│                └──[18]──► Election Monitoring                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Design

### 4.1 Frontend Components

#### 4.1.1 Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **API**: Axios + React Query
- **Forms**: React Hook Form + Zod

#### 4.1.2 Page Structure

```
frontend/src/app/
├── page.tsx                    # Landing Page
├── auth/
│   ├── login/page.tsx          # Login (Multi-role)
│   ├── register/page.tsx       # Voter Registration
│   └── forgot-password/        # Password Reset
├── voter/
│   ├── dashboard/page.tsx      # Voter Dashboard
│   ├── register/page.tsx       # Registration Form
│   └── vote/
│       ├── page.tsx            # Vote Casting
│       └── confirmation/       # Vote Confirmation
├── admin/
│   ├── dashboard/page.tsx      # Admin Overview
│   ├── elections/              # Election Management
│   ├── counties/               # County Management
│   ├── candidates/             # Candidate Management
│   ├── ro-management/          # RO Management
│   └── settings/               # System Settings
└── ro/                         # Returning Officer
    ├── dashboard/page.tsx      # RO Overview
    ├── candidates/             # County Candidates
    └── voters/                # County Voters
```

#### 4.1.3 Reusable UI Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `Button` | Primary action trigger | variant, size, disabled, loading |
| `Input` | Text entry | type, label, error, placeholder |
| `Card` | Content container | padding, shadow, border |
| `Modal` | Overlay dialog | open, onClose, title, children |
| `Select` | Dropdown selection | options, value, onChange, label |
| `DataTable` | Tabular data display | columns, data, pagination |
| `Alert` | Notification display | type, title, message |
| `Badge` | Status indicator | variant, label |
| `Avatar` | User representation | src, alt, fallback |
| `Toast` | Temporary notification | message, type, duration |
| `StatCard` | Metric display | title, value, change, icon |
| `Progress` | Progress indication | value, max, label |

#### 4.1.4 State Management (Zustand)

```typescript
// Stores structure
stores/
├── auth.store.ts       // User authentication state
├── voting.store.ts    // Vote casting state
├── notification.store.ts  // Notifications
└── theme.store.ts     // Theme preferences
```

**Auth Store Interface:**
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### 4.2 Backend Components

#### 4.2.1 Technology Stack
- **Framework**: NestJS 11
- **Language**: Node.js 20 LTS (TypeScript)
- **Database**: PostgreSQL 15 (TypeORM)
- **Cache**: Redis 7
- **Queue**: RabbitMQ
- **Auth**: Passport JWT + Argon2

#### 4.2.2 Module Structure

```
backend/src/
├── modules/
│   ├── auth/               # Authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── mfa.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── refresh.dto.ts
│   │
│   ├── voter/              # Voter Management
│   │   ├── voter.controller.ts
│   │   ├── voter.service.ts
│   │   ├── voter.module.ts
│   │   └── dto/
│   │
│   ├── vote/               # Vote Casting
│   │   ├── vote.controller.ts
│   │   ├── vote.service.ts
│   │   ├── vote.module.ts
│   │   └── dto/
│   │
│   ├── candidate/          # Candidate Management
│   │   ├── candidate.controller.ts
│   │   ├── candidate.service.ts
│   │   ├── candidate.module.ts
│   │   └── dto/
│   │
│   ├── admin/              # Admin Functions
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   └── admin.module.ts
│   │
│   ├── ro/                 # Returning Officer
│   │   ├── ro.controller.ts
│   │   ├── ro.service.ts
│   │   └── ro.module.ts
│   │
│   ├── batch/              # Batch Processing
│   │   ├── batch.controller.ts
│   │   ├── batch.service.ts
│   │   └── batch.module.ts
│   │
│   ├── reporting/          # Analytics & Reporting
│   │   ├── reporting.controller.ts
│   │   ├── reporting.service.ts
│   │   └── reporting.module.ts
│   │
│   ├── blockchain/         # Blockchain Integration
│   │   ├── blockchain.service.ts
│   │   └── blockchain.module.ts
│   │
│   └── health/             # Health Checks
│       ├── health.controller.ts
│       └── health.module.ts
│
├── entities/               # TypeORM Entities
│   ├── voter.entity.ts
│   ├── voter-biometric.entity.ts
│   ├── election.entity.ts
│   ├── vote.entity.ts
│   ├── candidate.entity.ts
│   ├── presidential-candidate.entity.ts
│   ├── super-admin.entity.ts
│   ├── returning-officer.entity.ts
│   ├── session.entity.ts
│   ├── county.entity.ts
│   ├── constituency.entity.ts
│   ├── ward.entity.ts
│   ├── ro-application.entity.ts
│   ├── audit-log.entity.ts
│   ├── login-history.entity.ts
│   └── batch.entity.ts
│
├── dto/                    # Shared DTOs
├── common/                 # Shared utilities
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── validators/
├── config/                 # Configuration
└── services/               # External services
```

#### 4.2.3 Service Patterns

**Authentication Service Flow:**
```
Login Request
    │
    ▼
Validate Credentials (National ID + Password)
    │
    ├──[FAIL]──► Return 401 Unauthorized
    │
    └──[PASS]──► Verify MFA
                      │
                      ├──[FAIL]──► Return 401 MFA Required
                      │
                      └──[PASS]──► Generate JWT Tokens
                                        │
                                        ├── Access Token (15 min)
                                        │
                                        └── Refresh Token (session)
                                              │
                                              ▼
                                    Create Session (Redis)
                                          │
                                          ▼
                                    Return Auth Response
```

**Vote Casting Service Flow:**
```
Vote Request (Encrypted Ballot)
    │
    ▼
Validate Voter Eligibility
    │
    ├──[INELIGIBLE]──► Return 403 Forbidden
    │
    └──[ELIGIBLE]──► Check Not Yet Voted
                         │
                         ├──[ALREADY VOTED]──► Return 409 Conflict
                         │
                         └──[NOT VOTED]──► Store Vote (Encrypted)
                                              │
                                              ▼
                                       Generate Confirmation
                                       (VN[A-Z0-9]{12})
                                              │
                                              ▼
                                       Add to Batch Queue
                                              │
                                              ▼
                                       Return Confirmation
```

### 4.3 Database Components

#### 4.3.1 Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE ENTITY RELATIONSHIPS                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐      │
│  │    County    │1       *│Constituency   │1       *│    Ward      │      │
│  └──────────────┘──────── └──────────────┘──────── └──────────────┘      │
│        │                                                   │                  │
│        │ 1                                               │ 1                 │
│        ▼                                                 ▼                  │
│  ┌──────────────┐                                 ┌──────────────┐          │
│  │ Returning   │                                 │    Voter     │          │
│  │  Officer    │◄─────────────────────────────────│              │          │
│  └──────────────┘          *                    └──────┬───────┘          │
│        │                                              │                    │
│        │ 1                                           │ 1                  │
│        ▼                                             ▼                    │
│  ┌──────────────┐                           ┌──────────────┐               │
│  │   Election   │◄─────────────────────────│     Vote     │               │
│  └──────────────┘            *            └──────────────┘               │
│        │                                              │                    │
│        │ 1                                           │ *                  │
│        ▼                                             ▼                    │
│  ┌──────────────┐                           ┌──────────────┐               │
│  │  Candidate   │◄─────────────────────────│     Vote     │               │
│  └──────────────┘            *            └──────────────┘               │
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐      │
│  │  SuperAdmin  │         │ Session      │         │  AuditLog    │      │
│  └──────────────┘         └──────────────┘         └──────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.3.2 Key Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `voters` | Registered voters | id, national_id, first_name, last_name, email, phone, county_id, status, password_hash |
| `voter_biometrics` | Biometric data | id, voter_id, face_template, fingerprint_template, status |
| `elections` | Election configuration | id, name, type, start_date, end_date, status |
| `votes` | Cast votes | id, voter_id, election_id, encrypted_ballot, confirmation_number, created_at |
| `candidates` | County candidates | id, election_id, name, party, position, constituency_id, status |
| `presidential_candidates` | Presidential candidates | id, election_id, name, party, symbol |
| `counties` | Geographic regions | id, code, name, code_number |
| `constituencies` | Sub-regions | id, county_id, code, name |
| `wards` | Lower regions | id, constituency_id, code, name |
| `returning_officers` | RO accounts | id, user_id, county_id, status |
| `super_admins` | Admin accounts | id, user_id, role, created_at |
| `batches` | Vote batches | id, election_id, size, status, submitted_at |
| `audit_logs` | System audit trail | id, user_id, action, entity_type, entity_id, metadata |

### 4.4 Queue Components

#### 4.4.1 RabbitMQ Exchanges

| Exchange | Type | Purpose |
|----------|------|---------|
| `vote.submitted` | Direct | New vote submissions |
| `batch.processing` | Topic | Batch processing triggers |
| `blockchain.submit` | Direct | Blockchain transaction submission |
| `notification.send` | Fanout | Email/SMS notifications |

#### 4.4.2 Message Queues

```
Vote Flow Queues:
1. vote.submitted → [vote_processor]
   - Stores encrypted vote
   - Generates confirmation

2. vote_processor → [batch_aggregator]
   - Aggregates votes into batches

3. batch_aggregator → [blockchain_submitter]
   - Submits batch to blockchain
   - Confirms on-chain transaction
```

---

## 5. Data Flow Design

### 5.1 Voter Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VOTER REGISTRATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  START                                                                    END│
│   │                                                                       │  │
│   ▼                                                                       │  │
│ ┌─────────────┐                                                          │  │
│ │  Start     │                                                          │  │
│ │ Registration│                                                          │  │
│ └──────┬──────┘                                                          │  │
│        │                                                                 │  │
│        ▼                                                                 │  │
│ ┌─────────────────────────────────────────────────────────────────────┐  │  │
│ │  Step 1: Identity Verification                                     │  │  │
│ │  - Enter National ID                                              │  │  │
│ │  - System validates against IEBC registry                         │  │  │
│ │  - Check eligibility (age, citizenship)                           │◄─┘  │
│ └──────┬───────────────────────────────────────────────────────────────┘  │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Step 2: Personal Information                                     │   │
│ │  - Full name, date of birth                                       │   │
│ │  - Gender, phone, email                                           │   │
│ │  - County, constituency, ward (auto-detect or select)            │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Step 3: Biometric Enrollment                                     │   │
│ │  - Capture facial photo (liveness detection)                     │   │
│ │  - Capture fingerprint (multiple fingers)                         │   │
│ │  - Quality validation                                             │   │
│ │  - Store encrypted templates                                      │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Step 4: Create Password                                          │   │
│ │  - Minimum 8 characters                                           │   │
│ │  - Complexity requirements                                         │   │
│ │  - Argon2 hashing                                                 │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Step 5: MFA Setup                                                │   │
│ │  - Select MFA method (biometrics mandatory)                       │   │
│ │  - Test biometric verification                                    │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Step 6: Review & Submit                                          │   │
│ │  - Summary of all information                                     │   │
│ │  - Terms acceptance                                                │   │
│ │  - Submit registration                                             │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Verification (Background Process)                                │   │
│ │  - Admin/RO review (if required)                                  │   │
│ │  - Auto-activate (if eligible)                                    │   │
│ │  - Send confirmation notification                                 │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Vote Casting Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VOTE CASTING FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  START                                                                    END│
│   │                                                                       │  │
│   ▼                                                                       │  │
│ ┌─────────────┐                                                          │  │
│ │  Login      │                                                          │  │
│ │ (MFA)       │                                                          │  │
│ └──────┬──────┘                                                          │  │
│        │                                                                 │  │
│        ▼                                                                 │  │
│ ┌─────────────────────────────────────────────────────────────────────┐  │  │
│ │  Batch Assignment                                                   │  │  │
│ │  - System assigns to batch (1000 voters max)                      │  │  │
│ │  - Batch timer starts (120s idle timeout)                          │  │  │
│ └──────┬───────────────────────────────────────────────────────────────┘  │  │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Ballot Retrieval                                                   │   │
│ │  - Fetch active elections for voter                                │   │
│ │  - Get candidates by position/county                              │   │
│ │  - Return ballot structure                                         │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Make Selections                                                   │   │
│ │  - Select candidates for each position                            │   │
│ │  - Review selections                                               │   │
│ │  - Proceed to submit                                               │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Client-Side Encryption                                            │   │
│ │  - Encrypt ballot with election public key                         │   │
│ │  - Generate ZK proof (valid vote)                                  │   │
│ │  - Prepare encrypted payload                                       │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Submit Vote                                                       │   │
│ │  - POST to /api/votes/cast                                        │   │
│ │  - Include encrypted ballot + ZK proof                            │   │
│ │  - JWT authentication                                             │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Server Processing                                                 │   │
│ │  - Validate ZK proof                                              │   │
│ │  - Store encrypted vote                                           │   │
│ │  - Mark voter as voted                                            │   │
│ │  - Generate confirmation number (VN[A-Z0-9]{12})                  │   │
│ │  - Add to batch queue                                             │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Batch Aggregation                                                 │   │
│ │  - Votes accumulate in batch                                       │   │
│ │  - Batch closes at 1000 votes OR 5 seconds                         │   │
│ │  - Batch submitted to blockchain                                   │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Blockchain Submission                                             │   │
│ │  - Votes submitted to smart contract                               │   │
│ │  - Transaction confirmed (2-15 seconds)                            │   │
│ │  - Vote hash stored on-chain                                      │   │
│ └──────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                │
│        ▼                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │  Confirmation Display                                              │   │
│ │  - Display confirmation number                                     │   │
│ │  - Option to verify later                                         │   │
│ │  - Vote marked as complete                                         │◄─┘  │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Data Encryption Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA ENCRYPTION FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER 1: TRANSPORT (TLS 1.3)                                               │
│  ───────────────────────────                                                │
│                                                                              │
│  Client ───[HTTPS]──► API Gateway ───[HTTPS]──► Services                   │
│                                                                              │
│  - TLS 1.3 with strong cipher suites                                        │
│  - Certificate pinning for mobile                                           │
│  - HSTS header                                                              │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  LAYER 2: APPLICATION (AES-256-GCM)                                         │
│  ─────────────────────────────────                                          │
│                                                                              │
│  Data at Rest:                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   Plain    │───►│  Encrypt    │───►│  Encrypted │                      │
│  │   Data     │    │ (AES-256)   │    │   Data     │                      │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘                      │
│                            │                   │                            │
│                     ┌──────┴──────┐      ┌──────┴──────┐                    │
│                     │    Key      │      │   Database  │                    │
│                     │   (HSM)    │      │   (Storage) │                    │
│                     └─────────────┘      └─────────────┘                    │
│                                                                              │
│  Key Management:                                                             │
│  - Master key in HSM                                                        │
│  - Data encryption keys (DEK) encrypted with KEK                             │
│  - KEK rotation annually                                                    │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  LAYER 3: VOTING (Homomorphic Encryption)                                   │
│  ─────────────────────────────────────                                      │
│                                                                              │
│  Vote Encryption:                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   Vote      │───►│    HE       │───►│  Encrypted  │                     │
│  │  (Plain)    │    │  Encrypt    │    │   Ballot    │                     │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘                      │
│                            │                   │                            │
│                     ┌──────┴──────┐      ┌──────┴──────┐                    │
│                     │ Election    │      │  Blockchain │                    │
│                     │ Public Key  │      │   Storage   │                    │
│                     └─────────────┘      └─────────────┘                    │
│                                                                              │
│  Vote Tallying:                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │ Encrypted1 │    │ Encrypted2  │    │  HE Sum    │                      │
│  │ Encrypted2 │ +  │ Encrypted3  │ =  │ (Tally)     │                     │
│  └─────────────┘    └─────────────┘    └──────┬──────┘                     │
│                                               │                            │
│                            ┌──────────────────┴──────────────────┐        │
│                            │  Decrypt with Election Private Key   │        │
│                            └──────────────────┬──────────────────┘        │
│                                               ▼                            │
│                                        ┌─────────────┐                     │
│                                        │  Results    │                     │
│                                        └─────────────┘                     │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  LAYER 4: PROOFS (Zero-Knowledge)                                           │
│  ───────────────────────────────────                                        │
│                                                                              │
│  ZK Proof Generation:                                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   Vote      │───►│   ZK-SNARK  │───►│   Proof     │                      │
│  │ (Private)   │    │   Prove     │    │ (Public)    │                      │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘                      │
│                            │                   │                            │
│                     ┌──────┴──────┐      ┌──────┴──────┐                    │
│                     │ Circuit     │      │  Submitted  │                    │
│                     │ (Voting)    │      │   with Vote │                    │
│                     └─────────────┘      └─────────────┘                    │
│                                                                              │
│  ZK Proof Verification:                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                      │
│  │   Proof     │───►│    Verify   │───►│   Valid/     │                     │
│  │             │    │   (On-chain)│    │   Invalid   │                     │
│  └─────────────┘    └─────────────┘    └─────────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. API Design

### 6.1 API Architecture

**Base URL**: `https://api.voting-system.iebc.go.ke/v1`

**Protocol**: REST over HTTPS (TLS 1.3)

**Content Type**: `application/json`

### 6.2 Authentication

All protected endpoints require JWT Bearer token:

```http
Authorization: Bearer <access_token>
```

**Token Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/mfa/verify` | Verify MFA code |
| POST | `/auth/logout` | Logout and invalidate tokens |
| GET | `/auth/me` | Get current user |

### 6.3 API Endpoints Summary

#### 6.3.1 Auth Controller

```typescript
// POST /auth/login
interface LoginRequest {
  nationalId: string;      // National ID or passport
  password: string;       // Voter password
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  requiresMfa: boolean;
  mfaToken?: string;
}

// POST /auth/mfa/verify
interface MfaVerifyRequest {
  mfaToken: string;
  code: string;           // Biometric or TOTP
}

// POST /auth/refresh
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
```

#### 6.3.2 Voter Controller

```typescript
// POST /voters/register
interface RegisterRequest {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  countyId: number;
  constituencyId: number;
  wardId: number;
  password: string;
  faceTemplate: string;    // Encrypted biometric
  fingerprintTemplate: string;
}

// GET /voters/profile
interface VoterProfileResponse {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'verified' | 'activated';
  county: string;
  constituency: string;
  ward: string;
  registeredAt: string;
  votedInElections: string[];
}

// GET /voters/stats
interface VoterStatsResponse {
  total: number;
  verified: number;
  pending: number;
  activated: number;
  voted: number;
}
```

#### 6.3.3 Vote Controller

```typescript
// GET /votes/ballot
interface BallotRequest {
  electionId: string;
}

interface BallotResponse {
  election: {
    id: string;
    name: string;
    type: string;
    positions: PositionBallot[];
  };
}

// POST /votes/cast
interface CastVoteRequest {
  electionId: string;
  encryptedBallot: string;    // HE encrypted
  zkProof: string;            // ZK proof of validity
  batchId: string;
}

interface CastVoteResponse {
  confirmationNumber: string;  // VN[A-Z0-9]{12}
  voteId: string;
  timestamp: string;
}

// GET /votes/confirmation/:id
interface ConfirmationResponse {
  confirmationNumber: string;
  electionId: string;
  electionName: string;
  status: 'submitted' | 'confirmed' | 'anchored';
  submittedAt: string;
  anchoredAt?: string;
}
```

#### 6.3.4 Admin Controller

```typescript
// Counties
GET    /admin/counties
POST   /admin/counties
GET    /admin/counties/:id
PUT    /admin/counties/:id
DELETE /admin/counties/:id

// Elections
GET    /admin/elections
POST   /admin/elections
GET    /admin/elections/:id
PUT    /admin/elections/:id
POST   /admin/elections/:id/activate
POST   /admin/elections/:id/close

// Candidates
GET    /admin/candidates
POST   /admin/candidates
GET    /admin/candidates/:id
PUT    /admin/candidates/:id
DELETE /admin/candidates/:id

// RO Management
GET    /admin/ro-applications
POST   /admin/ro-applications/:id/approve
POST   /admin/ro-applications/:id/reject
GET    /admin/returning-officers

// Presidential Candidates
GET    /admin/presidential-candidates
POST   /admin/presidential-candidates

// Dashboard
GET    /admin/dashboard/stats
GET    /admin/audit-logs
```

#### 6.3.5 Reporting Controller

```typescript
// GET /reports/results
interface ResultsRequest {
  electionId: string;
  level: 'national' | 'county' | 'constituency';
}

interface ResultsResponse {
  electionId: string;
  level: string;
  totalVotes: number;
  results: CandidateResult[];
}

// GET /reports/turnout
interface TurnoutRequest {
  electionId: string;
  region?: string;
}

interface TurnoutResponse {
  electionId: string;
  totalRegistered: number;
  totalVoted: number;
  turnoutPercentage: number;
  byCounty: CountyTurnout[];
}

// GET /reports/blockchain/status
interface BlockchainStatusResponse {
  networkStatus: 'connected' | 'disconnected';
  latestBlock: number;
  latestHash: string;
  pendingTransactions: number;
  validatorCount: number;
}
```

### 6.4 Error Responses

```typescript
// Standard Error Response
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  validationErrors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Common HTTP Status Codes
// 400 - Bad Request (validation error)
// 401 - Unauthorized (invalid/missing token)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found (resource doesn't exist)
// 409 - Conflict (duplicate resource)
// 422 - Unprocessable Entity (business logic error)
// 429 - Too Many Requests (rate limit)
// 500 - Internal Server Error
```

---

## 7. Database Design

### 7.1 Schema Overview

```
voting-system database (PostgreSQL 15)
│
├── public schema (main application data)
│   ├── counties (47 records)
│   ├── constituencies (~290 records)
│   ├── wards (~1,450 records)
│   ├── voters (millions)
│   ├── voter_biometrics
│   ├── elections
│   ├── candidates
│   ├── presidential_candidates
│   ├── votes
│   ├── batches
│   ├── returning_officers
│   ├── super_admins
│   ├── sessions
│   ├── audit_logs
│   └── login_history
│
├── migrations schema (version control)
│   └── (migration tracking table)
│
└── extensions
    ├── uuid-ossp (UUID generation)
    ├── pgcrypto (encryption functions)
    └── citext (case-insensitive text)
```

### 7.2 Entity Definitions

#### 7.2.1 Voter Entity

```sql
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    county_id INTEGER NOT NULL REFERENCES counties(id),
    constituency_id INTEGER NOT NULL REFERENCES constituencies(id),
    ward_id INTEGER NOT NULL REFERENCES wards(id),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'verified', 'activated', 'suspended')),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    last_voted_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voters_national_id ON voters(national_id);
CREATE INDEX idx_voters_status ON voters(status);
CREATE INDEX idx_voters_county ON voters(county_id);
CREATE INDEX idx_voters_constituency ON voters(constituency_id);
```

#### 7.2.2 Vote Entity

```sql
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL REFERENCES voters(id),
    election_id UUID NOT NULL REFERENCES elections(id),
    batch_id UUID REFERENCES batches(id),
    encrypted_ballot BYTEA NOT NULL,
    zk_proof BYTEA NOT NULL,
    confirmation_number VARCHAR(14) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted'
        CHECK (status IN ('submitted', 'confirmed', 'anchored', 'rejected')),
    blockchain_tx_hash VARCHAR(100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    anchored_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_votes_voter_election ON votes(voter_id, election_id) UNIQUE;
CREATE INDEX idx_votes_confirmation ON votes(confirmation_number);
CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_status ON votes(status);
```

#### 7.2.3 Election Entity

```sql
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('general', 'by-election', 'referendum')),
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'scheduled', 'active', 'closed', 'archived')),
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES super_admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_dates ON elections(start_date, end_date);
```

### 7.3 Migrations Strategy

```typescript
// Migration naming convention: TIMESTAMP_description.ts
// Example: 20240403120000_create_voters_table.ts

// Migration structure
migrations/
├── 20240403120000_create_counties_table.ts
├── 20240403120001_create_constituencies_table.ts
├── 20240403120002_create_wards_table.ts
├── 20240403120003_create_voters_table.ts
├── 20240403120004_create_elections_table.ts
├── 20240403120005_create_candidates_table.ts
├── 20240403120006_create_votes_table.ts
├── 20240403120007_create_batches_table.ts
├── 20240403120008_add_foreign_keys.ts
├── 20240403120009_add_indexes.ts
└── 20240403120010_seed_initial_data.ts
```

---

## 8. Security Design

### 8.1 Authentication Security

#### Multi-Factor Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MFA AUTHENTICATION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Level 1: ID Verification                                                   │
│  ─────────────────────────                                                  │
│  Input: National ID → Validate against registry                            │
│  Failure: Block access                                                       │
│  Success: Proceed to Level 2                                                 │
│                                                                              │
│  Level 2: Password                                                          │
│  ───────────────                                                           │
│  Input: Password → Argon2 verify                                            │
│  Failure: Increment counter → Lock after 5 attempts                         │
│  Success: Proceed to Level 3                                                │
│                                                                              │
│  Level 3: Face Biometric                                                    │
│  ─────────────────────                                                      │
│  Input: Face scan → Liveness check → Template match                         │
│  Failure: Block access                                                       │
│  Success: Proceed to Level 4                                                 │
│                                                                              │
│  Level 4: Fingerprint Biometric                                             │
│  ──────────────────────────                                                │
│  Input: Fingerprint scan → Template match                                   │
│  Failure: Block access                                                       │
│  Success: Issue tokens                                                       │
│                                                                              │
│  Token Issuance                                                             │
│  ─────────────                                                             │
│  Access Token: 15 minutes validity                                         │
│  Refresh Token: Session-based, rotating                                    │
│  Both: RS256 signed, stored in HTTP-only cookies                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Authorization Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROLE-BASED ACCESS CONTROL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                │
│  │ Super Admin │       │   Returning │       │    Voter    │                │
│  │             │       │   Officer   │       │             │                │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        PERMISSIONS MATRIX                            │    │
│  ├──────────────┬──────────────┬──────────────┬─────────────────────────┤    │
│  │ Permission   │ Super Admin │      RO     │        Voter            │    │
│  ├──────────────┼──────────────┼──────────────┼─────────────────────────┤    │
│  │ VIEW_ELECTION│      ✓      │    County   │   Own Eligibility       │    │
│  │ CREATE_ELECTION│     ✓      │      ✗      │          ✗              │    │
│  │ EDIT_ELECTION│      ✓      │      ✗      │          ✗              │    │
│  │ VIEW_CANDIDATE│     ✓      │    County   │   Ballot Only           │    │
│  │ CREATE_CANDIDATE│    ✓     │   County    │          ✗              │    │
│  │ VIEW_VOTER    │      ✓     │   County    │      Own Profile        │    │
│  │ VERIFY_VOTER  │      ✓     │   County    │          ✗              │    │
│  │ CAST_VOTE     │      ✗     │      ✗      │          ✓              │    │
│  │ VIEW_RESULTS  │      ✓     │   County    │    Public Results       │    │
│  │ SYSTEM_CONFIG │      ✓     │      ✗      │          ✗              │    │
│  │ VIEW_AUDIT    │      ✓     │   County    │          ✗              │    │
│  └──────────────┴──────────────┴──────────────┴─────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Encryption at Rest

```typescript
// Key hierarchy
interface KeyHierarchy {
  rootKey: {
    storage: 'HSM',
    algorithm: 'RSA-4096',
    rotation: '20 years'
  },
  keyEncryptionKeys: [
    {
      id: 'kek-user-data',
      algorithm: 'AES-256-GCM',
      rotation: '1 year',
      usedFor: ['user personal data', 'biometrics']
    },
    {
      id: 'kek-votes',
      algorithm: 'AES-256-GCM',
      rotation: 'per election',
      usedFor: ['encrypted ballots']
    },
    {
      id: 'kek-tokens',
      algorithm: 'AES-256-GCM',
      rotation: '1 month',
      usedFor: ['session tokens', 'refresh tokens']
    }
  ],
  dataEncryptionKeys: {
    generation: 'per record or per batch',
    storage: 'encrypted with KEK'
  }
}
```

### 8.4 Network Security

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NETWORK SECURITY ZONES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        PUBLIC ZONE (DMZ)                              │   │
│  │   CDN -> WAF -> Load Balancer -> API Gateway                        │   │
│  │   Ports: 443 (HTTPS), 80 (redirect to HTTPS)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      APPLICATION ZONE                                │   │
│  │   Frontend Servers (K8s pods)                                      │   │
│  │   Backend API Servers (K8s pods)                                    │   │
│  │   Ports: Internal only                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA ZONE                                    │   │
│  │   PostgreSQL (primary + replica)                                   │   │
│  │   Redis (cache + sessions)                                         │   │
│  │   RabbitMQ (message queue)                                          │   │
│  │   Ports: Internal only                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    BLOCKCHAIN ZONE                                  │   │
│  │   Hyperledger Besu Nodes                                            │   │
│  │   (Private network, permissioned)                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Security Groups / Firewall Rules:                                          │
│  ─────────────────────────────────────                                     │
│  - Public → DMZ: HTTPS only (443)                                          │
│  - DMZ → App: Internal ports only                                           │
│  - App → Data: Database ports only (5432, 6379, 5672)                      │
│  - App → Blockchain: Besu RPC (8545)                                        │
│  - All → WAF: Rate limiting enabled                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Infrastructure Design

### 9.1 Cloud Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLOUD INFRASTRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        AWS / GCP / AZURE                             │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    VPC (10.0.0.0/16)                           │ │   │
│  │  │                                                                  │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │ │   │
│  │  │  │   Public    │  │  Application │  │    Data     │          │ │   │
│  │  │  │   Subnet    │  │    Subnet    │  │    Subnet   │          │ │   │
│  │  │  │ 10.0.1.0/24 │  │ 10.0.2.0/24  │  │ 10.0.3.0/24 │          │ │   │
│  │  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │ │   │
│  │  │         │                 │                 │                   │ │   │
│  │  │         ▼                 ▼                 ▼                   │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────────┐│ │   │
│  │  │  │              KUBERNETES CLUSTER (EKS/GKE/AKS)              ││ │   │
│  │  │  │                                                              ││ │   │
│  │  │  │  Frontend (3 replicas)  │  Backend (5 replicas)           ││ │   │
│  │  │  │  - Auto-scaling         │  - Auto-scaling                  ││ │   │
│  │  │  │  - HPA configured       │  - HPA configured                ││ │   │
│  │  │  │                          │                                  ││ │   │
│  │  │  │  Ingress (nginx)        │  API Gateway (middleware)       ││ │   │
│  │  │  │  - TLS termination      │  - Rate limiting                ││ │   │
│  │  │  │  - Path routing         │  - Authentication               ││ │   │
│  │  │  │                          │                                  ││ │   │
│  │  │  └─────────────────────────────────────────────────────────────┘│ │   │
│  │  │                                                                  │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────────┐│ │   │
│  │  │  │              MANAGED SERVICES                              ││ │   │
│  │  │  │                                                              ││ │   │
│  │  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ││ │   │
│  │  │  │  │PostgreSQL│  │  Redis   │  │ RabbitMQ │  │ CloudWatch │  ││ │   │
│  │  │  │  │ (Primary)│  │ Cluster  │  │ Cluster │  │  /Stackdriver│ ││ │   │
│  │  │  │  │  + Replica│  │          │  │          │  │ Prometheus │  ││ │   │
│  │  │  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  ││ │   │
│  │  │  │                                                              ││ │   │
│  │  │  │  ┌─────────────┐  ┌─────────────────────────────────────┐   ││ │   │
│  │  │  │  │    HSM     │  │       Object Storage (S3/GCS)      │   ││ │   │
│  │  │  │  │ (Key Vault)│  │   (Backups, logs, static assets)  │   ││ │   │
│  │  │  │  └─────────────┘  └─────────────────────────────────────┘   ││ │   │
│  │  │  │                                                              ││ │   │
│  │  │  └─────────────────────────────────────────────────────────────┘│ │   │
│  │  │                                                                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    BLOCKCHAIN NETWORK                          │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │   │
│  │  │  │  Besu 1  │  │  Besu 2  │  │  Besu 3  │  │  Besu 4  │        │ │   │
│  │  │  │(Validator)│  │(Validator)│  │(Validator)│  │(Observer)│        │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Kubernetes Configuration

#### 9.2.1 Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voting-backend
  namespace: voting-system
spec:
  replicas: 5
  selector:
    matchLabels:
      app: voting-backend
  template:
    metadata:
      labels:
        app: voting-backend
    spec:
      containers:
        - name: backend
          image: voting-backend:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: voting-secrets
                  key: database-url
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
```

#### 9.2.2 Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: voting-backend-hpa
  namespace: voting-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: voting-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

### 9.3 Docker Compose (Development)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: voting_system
      POSTGRES_USER: voting_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U voting_user"]
      interval: 10s
      timeout: 5s

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    ports:
      - "5672:5672"
      - "15672:15672"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://voting_user:${DB_PASSWORD}@postgres:5432/voting_system
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@rabbitmq:5672
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3000
    depends_on:
      - backend
```

---

## 10. Blockchain Design

### 10.1 Hyperledger Besu Network

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HYPERLEDGER BESU NETWORK                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  NETWORK CONFIGURATION:                                                     │
│  ───────────────────────                                                     │
│  - Consensus: IBFT 2.0 (Proof of Authority)                                 │
│  - Block Time: 2 seconds                                                    │
│  - Finality: Immediate (no forks)                                           │
│  - Validator Count: 4+ nodes                                                │
│                                                                              │
│  NODE DISTRIBUTION:                                                         │
│  ─────────────────                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │  IEBC HQ     │    │   Nairobi    │    │   Mombasa    │                 │
│  │  Validator   │    │   Validator  │    │   Validator  │                 │
│  └──────────────┘    └──────────────┘    └──────────────┘                 │
│         │                   │                   │                          │
│         │                   │                   │                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │   Kisumu     │    │   Nakuru     │    │    Public    │                 │
│  │  Validator   │    │   Validator  │    │  Observer    │                 │
│  └──────────────┘    └──────────────┘    └──────────────┘                 │
│                                                                              │
│  SMART CONTRACTS:                                                           │
│  ───────────────                                                           │
│  1. VoteContract.sol - Vote anchoring                                       │
│  2. ElectionKeyManager.sol - Key management                                │
│                                                                              │
│  TRANSACTION FLOW:                                                          │
│  ───────────────                                                           │
│  Vote Submit → Batch Aggregate → On-Chain Submit → Confirmation            │
│  Estimated Time: 2-15 seconds                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Smart Contract Design

#### 10.2.1 VoteContract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract VoteContract is AccessControl, ReentrancyGuard, Pausable {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    
    // State
    mapping(bytes32 => bool) public voteHashes;      // Track submitted vote hashes
    mapping(bytes32 => uint256) public voteCounts;   // Encrypted vote counts
    mapping(address => bool) public validators;       // Validator addresses
    
    event VoteSubmitted(
        bytes32 indexed voteHash,
        bytes32 indexed electionId,
        uint256 timestamp,
        bytes proof
    );
    
    event BatchSubmitted(
        bytes32 indexed batchId,
        bytes32 indexed electionId,
        uint256 voteCount,
        uint256 timestamp
    );
    
    // Submit individual vote
    function submitVote(
        bytes32 electionId,
        bytes32 voteHash,
        bytes calldata zkProof
    ) external whenNotPaused nonReentrant {
        require(!voteHashes[voteHash], "Vote already submitted");
        
        // Verify ZK proof (simplified)
        require(_verifyProof(zkProof), "Invalid proof");
        
        voteHashes[voteHash] = true;
        voteCounts[electionId]++;
        
        emit VoteSubmitted(voteHash, electionId, block.timestamp, zkProof);
    }
    
    // Submit batch of votes
    function submitBatch(
        bytes32 batchId,
        bytes32 electionId,
        bytes32[] calldata voteHashes,
        bytes calldata aggregatedProof
    ) external whenNotPaused nonReentrant {
        require(voteHashes.length > 0, "Empty batch");
        
        for (uint i = 0; i < voteHashes.length; i++) {
            if (!voteHashes[voteHashes[i]]) {
                voteHashes[voteHashes[i]] = true;
                voteCounts[electionId]++;
            }
        }
        
        emit BatchSubmitted(batchId, electionId, voteHashes.length, block.timestamp);
    }
    
    // Verify vote on-chain
    function verifyVote(bytes32 voteHash) external view returns (bool) {
        return voteHashes[voteHash];
    }
    
    // Get election vote count
    function getVoteCount(bytes32 electionId) external view returns (uint256) {
        return voteCounts[electionId];
    }
}
```

---

## 11. Integration Design

### 11.1 External System Integrations

| System | Integration Type | Purpose | Status |
|--------|-----------------|---------|--------|
| **National ID Registry** | Real-time API | Voter identity verification | Required |
| **Biometric Registry** | Real-time API | Biometric template matching | Required |
| **Blockchain Network** | Web3 RPC | Vote anchoring, result verification | Required |
| **Notification Service** | Async (RabbitMQ) | Email/SMS notifications | Optional |
| **Public Results Portal** | API + WebSocket | Real-time result display | Required |

### 11.2 API Integrations

#### 11.2.1 National ID Registry Integration

```typescript
interface NIMCIntegration {
  // Verify National ID
  verifyNationalId(nationalId: string): Promise<{
    valid: boolean;
    details: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: string;
    };
  }>;
}
```

#### 11.2.2 Blockchain Integration

```typescript
interface BlockchainService {
  // Connect to Besu network
  connect(): Promise<void>;
  
  // Submit vote to blockchain
  submitVote(encryptedVote: string, proof: string): Promise<TransactionReceipt>;
  
  // Verify vote on-chain
  verifyVote(voteHash: string): Promise<boolean>;
  
  // Get election results
  getResults(electionId: string): Promise<Results>;
}
```

---

## 12. Monitoring & Observability

### 12.1 Metrics Collection

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         METRICS ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  METRICS SOURCES:                                                            │
│  ───────────────                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Backend   │  │  Frontend   │  │  Database   │  │   System    │       │
│  │  (Prometheus│  │ (Prometheus│  │  (Exporter) │  │  (Node)     │       │
│  │   Client)   │  │   Client)   │  │             │  │             │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     PROMETHEUS SERVER                                │   │
│  │   - Metrics collection                                              │   │
│  │   - Time-series storage                                             │   │
│  │   - 15-day retention                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                          │
│                                  ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     GRAFANA DASHBOARDS                               │   │
│  │   - Application Dashboard                                           │   │
│  │   - Database Dashboard                                              │   │
│  │   - Blockchain Dashboard                                            │   │
│  │   - Business Metrics Dashboard                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  KEY METRICS:                                                                │
│  ───────────                                                                │
│  - Request rate (rpm)                    - Error rate (%)                  │
│  - Response time (p50, p95, p99)        - CPU/Memory utilization          │
│  - Vote submission throughput            - Active users                   │
│  - Blockchain transaction latency        - Database query time              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 12.2 Logging Architecture

```typescript
// Structured Logging Format
interface LogEntry {
  timestamp: string;           // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;             // e.g., 'voting-backend'
  transactionId: string;       // Correlation ID
  userId?: string;
  action: string;
  message: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Log Levels by Environment
const LOG_LEVELS = {
  development: 'debug',
  staging: 'info',
  production: 'warn'
};
```

### 12.3 Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | > 5% errors in 5 min | Critical | PagerDuty |
| High Response Time | p95 > 2s for 5 min | Warning | Slack |
| Low Vote Throughput | < 1000 votes/sec | Warning | Email |
| Database Connection | > 80% max connections | Critical | PagerDuty |
| Disk Space | > 85% used | Warning | Email |
| Blockchain Sync | Behind by > 5 blocks | Critical | PagerDuty |

---

## 13. Disaster Recovery

### 13.1 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKUP ARCHITECTURE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  BACKUP TYPES:                                                              │
│  ───────────                                                               │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                        │
│  │   Full      │  │  Incremental│  │   Config    │                        │
│  │   Daily     │  │  Every 4hr  │  │  Every 1hr  │                        │
│  │  (2:00 AM)  │  │             │  │             │                        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                        │
│         │                │                │                                │
│         └────────────────┼────────────────┘                                │
│                          ▼                                                 │
│              ┌───────────────────────┐                                     │
│              │   Backup Storage      │                                     │
│              │   (S3 / GCS / Blob)    │                                     │
│              └───────────────────────┘                                     │
│                          │                                                 │
│                          ▼                                                 │
│              ┌───────────────────────┐                                     │
│              │   Cross-Region        │                                     │
│              │   Replication         │                                     │
│              └───────────────────────┘                                     │
│                                                                              │
│  RETENTION POLICY:                                                          │
│  ───────────────                                                           │
│  - Full backups: 30 days                                                    │
│  - Incremental: 7 days                                                      │
│  - Config backups: 90 days                                                  │
│  - Blockchain snapshots: 1 year                                            │
│                                                                              │
│  RECOVERY OBJECTIVES:                                                       │
│  ───────────────────                                                       │
│  - RTO (Recovery Time Objective): 4 hours                                   │
│  - RPO (Recovery Point Objective): 1 hour                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 13.2 Failover Strategy

| Component | Failover Method | Recovery Time |
|-----------|----------------|---------------|
| **Database** | Auto-failover to replica | < 30 seconds |
| **Redis** | Sentinel auto-failover | < 10 seconds |
| **Application** | K8s pod restart + load balancer | < 60 seconds |
| **Load Balancer** | Health check + remove unhealthy | < 30 seconds |
| **Blockchain** | Switch to backup node | Manual (5 min) |

---

## 14. Technology Stack

### 14.1 Technology Summary

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js | 14.x |
| | React | 18.x |
| | TypeScript | 5.x |
| | Tailwind CSS | 3.x |
| | Zustand | 4.x |
| **Backend** | Node.js | 20 LTS |
| | NestJS | 11.x |
| | TypeScript | 5.x |
| **Database** | PostgreSQL | 15.x |
| | Redis | 7.x |
| **Queue** | RabbitMQ | 3.x |
| **Blockchain** | Hyperledger Besu | 24.x |
| | Solidity | 0.8.x |
| **Infrastructure** | Kubernetes | 1.28+ |
| | Docker | 24.x |
| | AWS/GCP/Azure | - |

### 14.2 Package Dependencies

#### Backend (package.json highlights)
```json
{
  "dependencies": {
    "@nestjs/core": "^11.0.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/typeorm": "^11.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^8.0.0",
    "@nestjs/throttler": "^6.0.0",
    "typeorm": "^0.3.19",
    "pg": "^8.11.0",
    "ioredis": "^5.3.0",
    "amqplib": "^0.10.0",
    "passport-jwt": "^4.0.1",
    "argon2": "^0.40.0",
    "web3": "^4.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

#### Frontend (package.json highlights)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.294.0"
  }
}
```

---

## 15. Appendices

### Appendix A: API Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource missing |
| 409 | Conflict - Duplicate resource |
| 422 | Unprocessable - Business logic |
| 429 | Too Many - Rate limit |
| 500 | Server Error - Internal error |

### Appendix B: Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### Appendix C: Database Connection Pool

```typescript
// Recommended PostgreSQL pool settings
const poolConfig = {
  max: 50,              // Maximum connections
  min: 10,              // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 10000,  // 10 second query timeout
};
```

### Appendix D: Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| API Response (p95) | < 500ms | > 2s |
| Vote Submission | < 2s | > 5s |
| Page Load | < 3s | > 5s |
| Throughput | 5,000/sec | < 2,000/sec |
| Uptime | 99.9% | < 99% |

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | April 2026 | Architecture Team | Initial version |

---

*End of Document*