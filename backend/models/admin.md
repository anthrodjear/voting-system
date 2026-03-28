# Admin Data Model

## Overview

This document details the Super Admin and Admin data models for system management.

---

## 1. Super Admin Entity

```typescript
// entities/super-admin.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum SuperAdminLevel {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  AUDITOR = 'auditor'
}

@Entity('super_admins')
export class SuperAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: SuperAdminLevel,
    default: SuperAdminLevel.ADMIN
  })
  @Index()
  level: SuperAdminLevel;

  // Security
  @Column()
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  // Access Control
  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  @Column({ default: false })
  canApproveRo: boolean;

  @Column({ default: false })
  canManageCounties: boolean;

  @Column({ default: false })
  canManageCandidates: boolean;

  @Column({ default: false })
  canViewResults: boolean;

  @Column({ default: false })
  canAudit: boolean;

  // Session Management
  @Column({ nullable: true })
  currentSessionId: string;

  @Column({ type: 'simple-array', nullable: true })
  activeSessions: string[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;
}
```

---

## 2. County Entity

```typescript
// entities/county.entity.ts
@Entity('counties')
export class County {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  countyCode: string;

  @Column({ unique: true })
  @Index()
  countyName: string;

  @Column()
  region: string;

  @Column()
  capital: string;

  @Column()
  areaSqKm: number;

  @Column()
  population: number;

  @Column({ nullable: true })
  registeredVoters: number;

  @Column({ default: 0 })
  constituencies: number;

  @Column({ default: 0 })
  wards: number;

  @Column({ default: 0 })
  pollingStations: number;

  // Geographic Data
  @Column({ type: 'jsonb', nullable: true })
  boundaries: {
    type: string;
    coordinates: number[][][];
  };

  // Status
  @Column({ default: true })
  isActive: boolean;

  // Current Election
  @Column({ nullable: true })
  currentElectionId: string;

  // RO Assignment
  @Column({ nullable: true })
  assignedRoId: string;

  @Column({ nullable: true })
  assignedRoName: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 3. Election Entity

```typescript
// entities/election.entity.ts
export enum ElectionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  REGISTRATION = 'registration',
  VOTING = 'voting',
  TALLYING = 'tallying',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('elections')
export class Election {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  electionName: string;

  @Column()
  electionType: string; // general, by-election, referendum

  @Column({ type: 'date' })
  electionDate: Date;

  // Timeline
  @Column({ nullable: true })
  registrationStartDate: Date;

  @Column({ nullable: true })
  registrationEndDate: Date;

  @Column({ nullable: true })
  nominationStartDate: Date;

  @Column({ nullable: true })
  nominationEndDate: Date;

  @Column({ nullable: true })
  campaignStartDate: Date;

  @Column({ nullable: true })
  campaignEndDate: Date;

  @Column({ nullable: true })
  votingStartDate: Date;

  @Column({ nullable: true })
  votingEndDate: Date;

  // Status
  @Column({
    type: 'enum',
    enum: ElectionStatus,
    default: ElectionStatus.DRAFT
  })
  @Index()
  status: ElectionStatus;

  // Configuration
  @Column({ default: true })
  enableOnlineVoting: boolean;

  @Column({ default: true })
  enablePhysicalVoting: boolean;

  @Column({ default: false })
  enableEarlyVoting: boolean;

  // Results
  @Column({ nullable: true })
  resultsAnnouncedAt: Date;

  @Column({ nullable: true })
  totalVotesCast: number;

  @Column({ type: 'float', nullable: true })
  turnoutPercentage: number;

  // Blockchain
  @Column({ nullable: true })
  blockchainContractAddress: string;

  @Column({ nullable: true })
  electionKeyId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;
}
```

---

## 4. Audit Log Entity

```typescript
// entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  userRole: string;

  @Column()
  @Index()
  action: string;

  @Column()
  @Index()
  resource: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 'success' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
```

---

## 5. Database Schema

```sql
-- super_admins table
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    level VARCHAR(20) DEFAULT 'admin' NOT NULL,
    
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50),
    
    permissions TEXT[],
    can_approve_ro BOOLEAN DEFAULT FALSE,
    can_manage_counties BOOLEAN DEFAULT FALSE,
    can_manage_candidates BOOLEAN DEFAULT FALSE,
    can_view_results BOOLEAN DEFAULT FALSE,
    can_audit BOOLEAN DEFAULT FALSE,
    
    current_session_id VARCHAR(100),
    active_sessions TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_admin_email ON super_admins(email);
CREATE INDEX idx_admin_level ON super_admins(level);

-- counties table
CREATE TABLE counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    county_code VARCHAR(10) UNIQUE NOT NULL,
    county_name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    capital VARCHAR(100),
    area_sq_km DECIMAL(10,2),
    population INTEGER,
    registered_voters INTEGER,
    constituencies INTEGER DEFAULT 0,
    wards INTEGER DEFAULT 0,
    polling_stations INTEGER DEFAULT 0,
    boundaries JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    current_election_id VARCHAR(50),
    assigned_ro_id UUID,
    assigned_ro_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_county_code ON counties(county_code);
CREATE INDEX idx_county_name ON counties(county_name);

-- elections table
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_name VARCHAR(200) NOT NULL,
    election_type VARCHAR(50) NOT NULL,
    election_date DATE NOT NULL,
    
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    nomination_start_date TIMESTAMP,
    nomination_end_date TIMESTAMP,
    campaign_start_date TIMESTAMP,
    campaign_end_date TIMESTAMP,
    voting_start_date TIMESTAMP,
    voting_end_date TIMESTAMP,
    
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    
    enable_online_voting BOOLEAN DEFAULT TRUE,
    enable_physical_voting BOOLEAN DEFAULT TRUE,
    enable_early_voting BOOLEAN DEFAULT FALSE,
    
    results_announced_at TIMESTAMP,
    total_votes_cast INTEGER,
    turnout_percentage DECIMAL(5,2),
    
    blockchain_contract_address VARCHAR(100),
    election_key_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX idx_election_status ON elections(status);
CREATE INDEX idx_election_date ON elections(election_date);

-- audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    location VARCHAR(200),
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

## 6. Admin Level Permissions

| Permission | Super Admin | Admin | Auditor |
|------------|-------------|-------|---------|
| Manage Super Admins | ✓ | ✗ | ✗ |
| Approve RO Applications | ✓ | ✓ | ✗ |
| Add/Edit Counties | ✓ | ✗ | ✗ |
| Add Presidential Candidates | ✓ | ✗ | ✗ |
| Approve All Candidates | ✓ | ✓ | ✗ |
| View All Results | ✓ | ✓ | ✓ |
| View Audit Logs | ✓ | ✓ | ✓ |
| Export Data | ✓ | ✓ | ✗ |
| System Configuration | ✓ | ✗ | ✗ |
| Manage Elections | ✓ | ✗ | ✗ |
