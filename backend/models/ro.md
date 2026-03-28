# Returning Officer Data Model

## Overview

This document details the Returning Officer (RO) data model, including application, assignment, and management.

---

## 1. Entity Definition

```typescript
// entities/returning-officer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum ROStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum ROLevel {
  COUNTY = 'county',
  CONSTITUENCY = 'constituency',
  WARD = 'ward'
}

@Entity('returning_officers')
export class ReturningOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  @Index()
  nationalId: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  alternatePhone: string;

  // Professional Information
  @Column()
  highestEducation: string;

  @Column({ type: 'text', nullable: true })
  professionalBackground: string;

  @Column({ nullable: true })
  currentEmployer: string;

  @Column({ nullable: true })
  currentPosition: string;

  // Application Preferences
  @Column()
  preferredCounty1: string;

  @Column()
  preferredCounty2: string;

  // Assignment (after approval)
  @Column({ nullable: true })
  @Index()
  assignedCountyId: string;

  @Column({ nullable: true })
  assignedCountyName: string;

  @Column({ nullable: true })
  assignedConstituencyId: string;

  @Column({ nullable: true })
  assignedConstituencyName: string;

  @Column({
    type: 'enum',
    enum: ROLevel,
    default: ROLevel.COUNTY
  })
  level: ROLevel;

  // Status
  @Column({
    type: 'enum',
    enum: ROStatus,
    default: ROStatus.DRAFT
  })
  @Index()
  status: ROStatus;

  // Review Information
  @Column({ nullable: true })
  appliedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  suspensionReason: string;

  // Security
  @Column()
  passwordHash: string;

  @Column({ default: false })
  mfaEnabled: boolean;

  @Column({ nullable: true })
  mfaSecret: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  documentUrls: string[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 2. Application Entity

```typescript
// entities/ro-application.entity.ts
@Entity('ro_applications')
export class ROApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  roId: string;

  // Application Cycle
  @Column()
  electionCycle: string;

  @Column()
  applicationCycle: string;

  // Preferences
  @Column()
  preferredCounty1: string;

  @Column()
  preferredCounty2: string;

  // Supporting Information
  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ nullable: true })
  hasPriorExperience: boolean;

  @Column({ type: 'text', nullable: true })
  priorExperienceDetails: string;

  // Documents
  @Column({ type: 'simple-json', nullable: true })
  uploadedDocuments: {
    idCopy: string;
    educationCertificate: string;
    passportPhoto: string;
    other: string[];
  };

  // Status
  @Column({
    type: 'enum',
    enum: ROStatus,
    default: ROStatus.SUBMITTED
  })
  status: ROStatus;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  rejectionReason: string;

  // Assignment
  @Column({ nullable: true })
  assignedCounty: string;

  @Column({ nullable: true })
  assignedAt: Date;

  @Column({ nullable: true })
  assignedBy: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 3. Database Schema

```sql
-- returning_officers table
CREATE TABLE returning_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(8) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    
    -- Professional
    highest_education VARCHAR(200) NOT NULL,
    professional_background TEXT,
    current_employer VARCHAR(200),
    current_position VARCHAR(100),
    
    -- Preferences
    preferred_county1 VARCHAR(100) NOT NULL,
    preferred_county2 VARCHAR(100) NOT NULL,
    
    -- Assignment
    assigned_county_id VARCHAR(10),
    assigned_county_name VARCHAR(100),
    assigned_constituency_id VARCHAR(10),
    assigned_constituency_name VARCHAR(100),
    level VARCHAR(20) DEFAULT 'county',
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    applied_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    rejection_reason TEXT,
    suspension_reason TEXT,
    
    -- Security
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100),
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    
    -- Documents
    document_urls TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ro_national_id ON returning_officers(national_id);
CREATE INDEX idx_ro_email ON returning_officers(email);
CREATE INDEX idx_ro_status ON returning_officers(status);
CREATE INDEX idx_ro_assigned_county ON returning_officers(assigned_county_id);

-- ro_applications table
CREATE TABLE ro_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ro_id UUID NOT NULL REFERENCES returning_officers(id) ON DELETE CASCADE,
    
    election_cycle VARCHAR(50) NOT NULL,
    application_cycle VARCHAR(50) NOT NULL,
    
    preferred_county1 VARCHAR(100) NOT NULL,
    preferred_county2 VARCHAR(100) NOT NULL,
    
    cover_letter TEXT,
    skills TEXT[],
    years_of_experience INTEGER,
    has_prior_experience BOOLEAN DEFAULT FALSE,
    prior_experience_details TEXT,
    
    uploaded_documents JSONB,
    
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    notes TEXT,
    rejection_reason TEXT,
    
    assigned_county VARCHAR(100),
    assigned_at TIMESTAMP,
    assigned_by VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ro_app_ro_id ON ro_applications(ro_id);
CREATE INDEX idx_ro_app_status ON ro_applications(status);
CREATE INDEX idx_ro_app_cycle ON ro_applications(election_cycle);
```

---

## 4. Application Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RO APPLICATION WORKFLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. CREATE ACCOUNT                                                  │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Basic   │───>│  Verify   │───>│  Account  │                   │
│   │  Info    │    │  Email    │    │  Created  │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                                      │
│   2. SUBMIT APPLICATION                                             │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Fill    │───>│  Upload   │───>│  Submit   │                   │
│   │  Details │    │  Docs     │    │  Application                  │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                            │                         │
│                                            ▼                         │
│   3. REVIEW PROCESS                         │                       │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │ Under    │<───│  Review   │───>│ Approve/ │                   │
│   │ Review   │    │  Details  │    │  Reject  │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                                      │
│   4. ASSIGNMENT                                                     │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │ Assigned │<───│  County   │───>│  Active   │                   │
│   │ County   │    │  Match    │    │  RO       │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. RO Permissions Matrix

| Permission | County RO | Constituency RO | Ward RO | Super Admin |
|------------|-----------|-----------------|---------|-------------|
| View county voters | ✓ | ✓ | ✓ | ✓ |
| Manage county candidates | ✓ | ✗ | ✗ | ✓ |
| View county results | ✓ | ✗ | ✗ | ✓ |
| View constituency voters | ✗ | ✓ | ✓ | ✓ |
| Manage constituency candidates | ✗ | ✓ | ✗ | ✓ |
| View constituency results | ✗ | ✓ | ✗ | ✓ |
| View ward voters | ✗ | ✗ | ✓ | ✓ |
| Manage ward candidates | ✗ | ✗ | ✓ | ✓ |
| View ward results | ✗ | ✗ | ✓ | ✓ |
| Approve sub-ROs | ✓ | ✓ | ✗ | ✓ |
| View all counties | ✗ | ✗ | ✗ | ✓ |

---

## 6. API Response Examples

### RO Application Response

```json
{
  "success": true,
  "data": {
    "applicationId": "app_abc123",
    "roId": "ro_xyz789",
    "fullName": "John Smith",
    "nationalId": "12345678",
    "email": "john.smith@email.com",
    "preferredCounty1": "Nairobi",
    "preferredCounty2": "Mombasa",
    "status": "submitted",
    "submittedAt": "2024-01-15T10:00:00Z"
  }
}
```

### RO List Response

```json
{
  "success": true,
  "data": {
    "returningOfficers": [
      {
        "id": "ro_abc123",
        "fullName": "Jane Doe",
        "email": "jane@iebc.ke",
        "assignedCounty": "Nairobi",
        "level": "county",
        "status": "approved",
        "lastLoginAt": "2024-01-20T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 47
    }
  }
}
```
