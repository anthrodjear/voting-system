# Voter Data Model

## Overview

This document details the Voter data model including all fields, relationships, and constraints.

---

## 1. Entity Definition

```typescript
// entities/voter.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { VoterBiometric } from './voter-biometric.entity';
import { Vote } from './vote.entity';

export enum VoterStatus {
  PENDING = 'pending',
  PENDING_BIOMETRICS = 'pending_biometrics',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

@Entity('voters')
export class Voter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  nationalId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Index()
  dateOfBirth: Date;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  phoneNumber2: string;

  // Location References
  @Column()
  @Index()
  countyId: string;

  @Column()
  countyName: string;

  @Column()
  constituencyId: string;

  @Column()
  constituencyName: string;

  @Column()
  wardId: string;

  @Column()
  wardName: string;

  // Registration Status
  @Column({
    type: 'enum',
    enum: VoterStatus,
    default: VoterStatus.PENDING
  })
  @Index()
  status: VoterStatus;

  @Column({ default: false })
  nationalIdVerified: boolean;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  // Security
  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @Column({ default: false })
  passwordLocked: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedAt: Date;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  registeredAt: Date;

  // Relationships
  @OneToOne(() => VoterBiometric, biometric => biometric.voter)
  @JoinColumn()
  biometric: VoterBiometric;

  @OneToMany(() => Vote, vote => vote.voter)
  votes: Vote[];
}
```

---

## 2. Biometric Data Model

```typescript
// entities/voter-biometric.entity.ts
@Entity('voter_biometrics')
export class VoterBiometric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  voterId: string;

  // Face Recognition
  @Column({ type: 'text', nullable: true })
  faceTemplate: string; // Encrypted

  @Column({ nullable: true })
  faceEnrolledAt: Date;

  @Column({ default: false })
  faceEnrolled: boolean;

  @Column({ type: 'float', nullable: true })
  faceQualityScore: number;

  // Fingerprint Recognition
  @Column({ type: 'text', nullable: true })
  leftThumbTemplate: string; // Encrypted

  @Column({ type: 'text', nullable: true })
  rightThumbTemplate: string; // Encrypted

  @Column({ nullable: true })
  fingerprintEnrolledAt: Date;

  @Column({ default: false })
  fingerprintEnrolled: boolean;

  @Column({ type: 'float', nullable: true })
  fingerprintQualityScore: number;

  // Liveness Data
  @Column({ type: 'text', nullable: true })
  livenessChallenge: string;

  @Column({ nullable: true })
  livenessGeneratedAt: Date;

  // Security
  @Column({ type: 'text', nullable: true })
  encryptionKeyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationship
  @OneToOne(() => Voter, voter => voter.biometric)
  @JoinColumn({ name: 'voterId' })
  voter: Voter;
}
```

---

## 3. Database Schema

```sql
-- voters table
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(8) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    phone_number2 VARCHAR(20),
    
    -- Location
    county_id VARCHAR(10) NOT NULL,
    county_name VARCHAR(100) NOT NULL,
    constituency_id VARCHAR(10) NOT NULL,
    constituency_name VARCHAR(100) NOT NULL,
    ward_id VARCHAR(10) NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    national_id_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by VARCHAR(100),
    
    -- Security
    password_hash VARCHAR(255) NOT NULL,
    password_changed_at TIMESTAMP,
    password_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP,
    
    -- Indexes
    CONSTRAINT valid_national_id CHECK (national_id ~ '^[0-9]{8}$')
);

CREATE INDEX idx_voters_national_id ON voters(national_id);
CREATE INDEX idx_voters_status ON voters(status);
CREATE INDEX idx_voters_county ON voters(county_id);
CREATE INDEX idx_voters_date_of_birth ON voters(date_of_birth);

-- voter_biometrics table
CREATE TABLE voter_biometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID UNIQUE NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
    
    -- Face
    face_template TEXT,
    face_enrolled_at TIMESTAMP,
    face_enrolled BOOLEAN DEFAULT FALSE,
    face_quality_score FLOAT,
    
    -- Fingerprint
    left_thumb_template TEXT,
    right_thumb_template TEXT,
    fingerprint_enrolled_at TIMESTAMP,
    fingerprint_enrolled BOOLEAN DEFAULT FALSE,
    fingerprint_quality_score FLOAT,
    
    -- Liveness
    liveness_challenge TEXT,
    liveness_generated_at TIMESTAMP,
    
    -- Security
    encryption_key_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_biometrics_voter_id ON voter_biometrics(voter_id);
```

---

## 4. Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOTER RELATIONSHIPS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────┐         ┌──────────────────┐         ┌─────────┐     │
│   │  Voter  │────────<│  VoterBiometric  │>────────│  Vote   │     │
│   └─────────┘         └──────────────────┘         └─────────┘     │
│        │                                                   │        │
│        │                                                   │        │
│        │              ┌──────────────────┐                  │        │
│        └──────────────<│     County      │<─────────────────┘        │
│                       └──────────────────┘                         │
│                              │                                       │
│                              │                                       │
│                       ┌──────────────────┐                         │
│                       │  Constituency    │                         │
│                       └──────────────────┘                         │
│                              │                                       │
│                              │                                       │
│                       ┌──────────────────┐                         │
│                       │      Ward        │                         │
│                       └──────────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Validation Rules

### National ID

- Must be exactly 8 digits
- Must be unique in the system
- First digit cannot be 0
- Checksum validation (Kenyan ID format)

### Password Requirements

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot contain National ID or name

### Biometric Quality

| Type | Minimum Score | Description |
|------|---------------|-------------|
| Face | 0.85 | Luminance, focus, pose |
| Fingerprint | 0.90 | Clarity, minutiae count |

---

## 6. Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOTER DATA FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REGISTRATION:                                                      │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐   │
│  │  Input   │───>│  Validate │───>│  Create   │───>│  Store   │   │
│  │ Form     │    │  Format   │    │  Record   │    │  (Encrypt)│   │
│  └──────────┘    └───────────┘    └───────────┘    └──────────┘   │
│                                                                      │
│  VERIFICATION:                                                      │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐   │
│  │ Biometric│───>│  Extract  │───>│  Compare  │───>│  Update  │   │
│  │ Capture  │    │  Template │    │  Templates│    │  Status  │   │
│  └──────────┘    └───────────┘    └───────────┘    └──────────┘   │
│                                                                      │
│  AUTHENTICATION:                                                    │
│  ┌──────────┐    ┌───────────┐    ┌───────────┐    ┌──────────┐   │
│  │  Login   │───>│  Verify   │───>│  MFA      │───>│  Issue   │   │
│  │ Credentials│  │  Password │    │  Check    │    │  Token   │   │
│  └──────────┘    └───────────┘    └───────────┘    └──────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Security Considerations

### Encryption

- All biometric templates encrypted with AES-256-GCM
- Encryption keys stored in HSM
- Each template has unique IV

### Access Control

- Voters can only access their own record
- ROs can access voters in their county
- Admins can access all records

### Audit Logging

- All status changes logged
- All verification attempts logged
- All profile updates logged

---

## 8. API Response Examples

### Get Voter Response

```json
{
  "success": true,
  "data": {
    "id": "voter_abc123",
    "nationalId": "12345678",
    "firstName": "John",
    "lastName": "Doe",
    "county": "Nairobi",
    "constituency": "Kasarani",
    "ward": "Mwiki",
    "status": "verified",
    "registeredAt": "2024-01-15T10:00:00Z"
  }
}
```

### Voter Status Response

```json
{
  "success": true,
  "data": {
    "voterId": "voter_abc123",
    "status": "verified",
    "idVerified": true,
    "faceEnrolled": true,
    "fingerprintEnrolled": true,
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```
