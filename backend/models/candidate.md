# Candidate Data Model

## Overview

This document details the Candidate data model for all election positions.

---

## 1. Entity Definition

```typescript
// entities/candidate.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum CandidatePosition {
  PRESIDENT = 'president',
  GOVERNOR = 'governor',
  SENATOR = 'senator',
  MP = 'mp',
  MCA = 'mca'
}

export enum CandidateStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  DISQUALIFIED = 'disqualified'
}

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  candidateNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  @Index()
  position: CandidatePosition;

  // For non-presidential positions
  @Column({ nullable: true })
  @Index()
  countyId: string;

  @Column({ nullable: true })
  countyName: string;

  @Column({ nullable: true })
  constituencyId: string;

  @Column({ nullable: true })
  constituencyName: string;

  @Column({ nullable: true })
  wardId: string;

  @Column({ nullable: true })
  wardName: string;

  // Party Information
  @Column({ nullable: true })
  partyName: string;

  @Column({ nullable: true })
  partyAbbreviation: string;

  @Column({ nullable: true })
  partySymbol: string;

  @Column({ default: false })
  isIndependent: boolean;

  // Personal Information
  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'text', nullable: true })
  photo: string; // Base64 or URL

  @Column({ type: 'text', nullable: true })
  signature: string;

  // Manifesto
  @Column({ type: 'text', nullable: true })
  manifesto: string;

  @Column({ type: 'simple-array', nullable: true })
  manifestoHighlights: string[];

  // Professional Background
  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  achievements: string[];

  // Status & Verification
  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.DRAFT
  })
  @Index()
  status: CandidateStatus;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  submittedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  disqualifiedAt: Date;

  @Column({ nullable: true })
  disqualifiedReason: string;

  // Election Reference
  @Column()
  @Index()
  electionId: string;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 2. Presidential Candidate Extension

```typescript
// entities/presidential-candidate.entity.ts
@Entity('presidential_candidates')
export class PresidentialCandidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  candidateId: string; // References Candidate

  // Deputy Presidential Candidate
  @Column()
  deputyFullName: string;

  @Column({ nullable: true })
  deputyDateOfBirth: Date;

  @Column({ nullable: true })
  deputyPhoto: string;

  @Column({ nullable: true })
  deputyBio: string;

  // Nomination Details
  @Column()
  nominationDate: Date;

  @Column()
  nominationCounty: string;

  @Column()
  nominatorCount: number;

  // Campaign Details
  @Column({ nullable: true })
  campaignSlogan: string;

  @Column({ type: 'simple-array', nullable: true })
  campaignColors: string[];

  // Symbols for blind voters
  @Column({ nullable: true })
  ballotSymbol: string;

  @Column({ nullable: true })
  symbolDescription: string;

  // Create date
  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 3. Database Schema

```sql
-- candidates table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    
    -- Position
    position VARCHAR(20) NOT NULL,
    
    -- Location (for non-presidential)
    county_id VARCHAR(10),
    county_name VARCHAR(100),
    constituency_id VARCHAR(10),
    constituency_name VARCHAR(100),
    ward_id VARCHAR(10),
    ward_name VARCHAR(100),
    
    -- Party
    party_name VARCHAR(200),
    party_abbreviation VARCHAR(10),
    party_symbol VARCHAR(50),
    is_independent BOOLEAN DEFAULT FALSE,
    
    -- Personal
    date_of_birth DATE,
    gender VARCHAR(20),
    photo TEXT,
    signature TEXT,
    
    -- Manifesto
    manifesto TEXT,
    manifesto_highlights TEXT[],
    
    -- Bio
    bio TEXT,
    achievements TEXT[],
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    submitted_at TIMESTAMP,
    submitted_by VARCHAR(100),
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    rejection_reason TEXT,
    disqualified_at TIMESTAMP,
    disqualified_reason TEXT,
    
    -- Election
    election_id VARCHAR(50) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_number ON candidates(candidate_number);
CREATE INDEX idx_candidates_position ON candidates(position);
CREATE INDEX idx_candidates_county ON candidates(county_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_election ON candidates(election_id);

-- presidential_candidates table
CREATE TABLE presidential_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID UNIQUE NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    
    deputy_full_name VARCHAR(200) NOT NULL,
    deputy_date_of_birth DATE,
    deputy_photo TEXT,
    deputy_bio TEXT,
    
    nomination_date DATE NOT NULL,
    nomination_county VARCHAR(100) NOT NULL,
    nominator_count INTEGER NOT NULL,
    
    campaign_slogan VARCHAR(200),
    campaign_colors TEXT[],
    
    ballot_symbol VARCHAR(50),
    symbol_description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Positions & Eligibility

| Position | Level | Eligibility Requirements |
|----------|-------|-------------------------|
| President | National | Kenyan citizen by birth, 35+ years, registered voter |
| Governor | County | Resident of county, 25+ years |
| Senator | County | Registered voter in county |
| MP | Constituency | Registered voter in constituency |
| MCA | Ward | Registered voter in ward |

---

## 5. Validation Rules

### Candidate Number Format

```
PRESIDENT: P-001 to P-999
GOVERNOR: G-{COUNTY_CODE}-001
SENATOR: S-{COUNTY_CODE}-001
MP: MP-{CONSTITUENCY_CODE}-001
MCA: MCA-{WARD_CODE}-001
```

### Required Documents

| Position | Required Documents |
|----------|-------------------|
| President | ID, Photo, Deputy ID, Party nomination, 2000+ nominators |
| Governor | ID, Photo, County residency proof, Party nomination |
| Senator | ID, Photo, Party nomination |
| MP | ID, Photo, Constituency nomination |
| MCA | ID, Photo, Ward nomination |

---

## 6. Status Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CANDIDATE STATUS WORKFLOW                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   DRAFT ──(submit)──> PENDING ──(approve)──> APPROVED              │
│     │                        │                        │              │
│     │                        │                        │              │
│     │                        └────(reject)           │              │
│     │                                         ┌─────┘              │
│     │                                         │                    │
│     │         ┌───────────────────────────────┘                    │
│     │         │                                                    │
│     │    WITHDRAWN ◄──(withdraw)                                   │
│     │                                                    │          │
│     │                                      ┌─────────────────────┘  │
│     │                                      │                         │
│     └─────────────(disqualify)────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. API Response Examples

### List Candidates Response

```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "id": "candidate_abc123",
        "candidateNumber": "P-001",
        "fullName": "John Doe",
        "position": "president",
        "party": "Party A",
        "partyAbbreviation": "PA",
        "photo": "base64...",
        "status": "approved",
        "manifestoHighlights": [
          "Infrastructure development",
          "Healthcare improvement"
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### Candidate Details Response

```json
{
  "success": true,
  "data": {
    "id": "candidate_abc123",
    "candidateNumber": "P-001",
    "fullName": "John Doe",
    "position": "president",
    "party": "Party A",
    "partyAbbreviation": "PA",
    "photo": "base64...",
    "dateOfBirth": "1960-01-01",
    "bio": "Experienced leader...",
    "manifesto": "My vision for Kenya...",
    "manifestoHighlights": [
      "Infrastructure development",
      "Healthcare improvement",
      "Education reform"
    ],
    "status": "approved",
    "approvedAt": "2024-01-20T10:00:00Z",
    "electionId": "election_2024"
  }
}
```

---

## 8. Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CANDIDATE RELATIONSHIPS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐        ┌─────────────────┐                       │
│   │  Candidate  │────────<│    Election     │                       │
│   └─────────────┘        └─────────────────┘                       │
│        │                                                       │
│        │                                                       │
│   ┌────┴────────┐                                              │
│   │             │                                              │
│   ▼             ▼                                              │
│ ┌──────┐  ┌──────────────┐                                    │
│ │County│  │Constituency  │                                    │
│ └──────┘  └──────────────┘                                    │
│                  │                                             │
│                  ▼                                             │
│           ┌──────────┐                                        │
│           │   Ward   │                                        │
│           └──────────┘                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
