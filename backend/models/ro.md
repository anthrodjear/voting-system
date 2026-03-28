# Returning Officer Data Model

## Overview

This document details the Returning Officer (RO) data model, including application, assignment, and management. The model reflects Kenya's actual IEBC (Independent Electoral and Boundaries Commission) structure with 47 County Returning Officers and 290 Constituency Returning Officers.

---

## IEBC Organizational Structure (Actual)

Based on research, the IEBC structure is:

### Leadership (National Office - Nairobi)
- **Chairperson**: Erastus Edung Ethekon
- **Vice Chairperson**: Fahima Araphat Abdallah
- **5 Commissioners**: Total of 7 commissioners
- **CEO/Commission Secretary**: Moses Ledama Sunkuli (Acting)

### Staff
- Approximately 900 employees (2025)
- National office: Anniversary Towers, Nairobi

### Regional Structure
- **47 County Returning Officers** (one per county)
- **Deputy County Returning Officers**
- **290 Constituency Returning Officers** (one per constituency)
- **Deputy Constituency Returning Officers**
- **Ward-level staff**

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

## 1b. IEBC-Specific Enums

```typescript
// New enum reflecting IEBC structure
export enum IEBCRole {
  CHAIRPERSON = 'chairperson',
  VICE_CHAIRPERSON = 'vice_chairperson',
  COMMISSIONER = 'commissioner',
  CEO = 'ceo',
  COUNTY_RETURNING_OFFICER = 'county_ro',
  DEPUTY_COUNTY_RO = 'deputy_county_ro',
  CONSTITUENCY_RO = 'constituency_ro',
  DEPUTY_CONSTITUENCY_RO = 'deputy_constituency_ro',
}

// Updated RO Level to match IEBC
export enum ROLevel {
  NATIONAL = 'national',       // Chairperson, Commissioners, CEO
  COUNTY = 'county',           // County Returning Officer
  CONSTITUENCY = 'constituency' // Constituency Returning Officer
}

// IEBC Regions (for administrative grouping)
export enum IEBCRegion {
  CENTRAL = 'central',
  COAST = 'coast',
  EASTERN = 'eastern',
  NAIROBI = 'nairobi',
  NORTH_EASTERN = 'north_eastern',
  NYANZA = 'nyanza',
  RIFT_VALLEY = 'rift_valley',
  WESTERN = 'western',
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

## 2b. Kenya Counties Reference

The system supports all 47 Kenyan counties:

| Code | County | Region | Code | County | Region |
|------|--------|--------|------|--------|--------|
| 001 | Mombasa | Coast | 025 | Samburu | Rift Valley |
| 002 | Kwale | Coast | 026 | Trans Nzoia | Rift Valley |
| 003 | Kilifi | Coast | 027 | Uasin Gishu | Rift Valley |
| 004 | Lamu | Coast | 028 | Elgeyo-Marakwet | Rift Valley |
| 005 | Taita-Taveta | Coast | 029 | Nandi | Rift Valley |
| 006 | Garissa | North Eastern | 030 | Baringo | Rift Valley |
| 007 | Wajir | North Eastern | 031 | Laikipia | Rift Valley |
| 008 | Mandera | North Eastern | 032 | Nakuru | Rift Valley |
| 009 | Marsabit | Eastern | 033 | Narok | Rift Valley |
| 010 | Isiolo | Eastern | 034 | Kajiado | Rift Valley |
| 011 | Meru | Eastern | 035 | Kericho | Rift Valley |
| 012 | Tharaka-Nithi | Eastern | 036 | Bomet | Rift Valley |
| 013 | Embu | Eastern | 037 | Kakamega | Western |
| 014 | Kitui | Eastern | 038 | Vihiga | Western |
| 015 | Machakos | Eastern | 039 | Bungoma | Western |
| 016 | Makueni | Eastern | 040 | Busia | Western |
| 017 | Nyandarua | Central | 041 | Siaya | Nyanza |
| 018 | Nyeri | Central | 042 | Homa Bay | Nyanza |
| 019 | Kirinyaga | Central | 043 | Migori | Nyanza |
| 020 | Murang'a | Central | 044 | Kisii | Nyanza |
| 021 | Kiambu | Central | 045 | Nyamira | Nyanza |
| 022 | Turkana | Rift Valley | 046 | Nairobi | Nairobi |
| 023 | West Pokot | Rift Valley | 047 | Kiambu* | Central |
| 024 | Pokot | Rift Valley | | | |

*Note: Nairobi is a city-county with special administrative status

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

## 5. RO Permissions Matrix (IEBC-Aligned)

| Permission | Chairperson | Commissioner | CEO | County RO | Deputy County RO | Constituency RO | Super Admin |
|------------|-------------|--------------|-----|-----------|------------------|-----------------|-------------|
| View all voters (national) | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| View county voters | ✓ | ✓ | ✓ | ✓ | ✓ (read-only) | ✗ | ✓ |
| View constituency voters | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage county candidates | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage constituency candidates | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| View county results | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| View constituency results | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View national results | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Approve County ROs | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Approve Constituency ROs | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage system settings | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| View audit logs | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage elections | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |

---

## 5b. IEBC Appointment Workflow (Actual Process)

The actual IEBC RO appointment process:

```
┌─────────────────────────────────────────────────────────────────────┐
│                 IEBC RO APPOINTMENT PROCESS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   PHASE 1: VACANCY ANNOUNCEMENT                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Commission publishes vacancy for County RO positions       │  │
│   │  - Published in Kenya Gazette                               │  │
│   │  - IEBC website                                             │  │
│   │  - Print media                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   PHASE 2: APPLICATION                                              │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Candidates submit:                                          │  │
│   │  - Application form                                          │  │
│   │  - National ID copy                                          │  │
│   │  - Academic certificates                                     │  │
│   │  - Professional experience documents                         │  │
│   │  - Clear police clearance                                    │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   PHASE 3: SHORTLISTING                                             │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Secretariat reviews applications:                            │  │
│   │  - Verify qualifications                                     │  │
│   │  - Check integrity                                           │  │
│   │  - Shortlist candidates                                      │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   PHASE 4: INTERVIEW & ASSESSMENT                                   │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  shortlisted candidates undergo:                              │  │
│   │  - Oral interview panel                                       │  │
│   │  - Competency assessment                                      │  │
│   │  - Integrity verification                                     │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   PHASE 5: COMMISSION APPROVAL                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Interview panel submits recommendations to:                  │  │
│   │  → The Commission (7 Commissioners)                          │  │
│   │  → Commission deliberates and approves                       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   PHASE 6: APPOINTMENT                                              │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  Approved candidates:                                         │  │
│   │  - Appointed by the Commission                               │  │
│   │  - Oath of office                                            │  │
│   │  - Deployment to respective county                           │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

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

---

## 7. System Leadership (Default Accounts)

The system includes pre-configured leadership accounts matching actual IEBC structure:

| Role | Name | Email | County/Region |
|------|------|-------|---------------|
| Chairperson | Erastus Edung Ethektor | chair@iebc.ke | National |
| Vice Chairperson | Fahima Araphat Abdallah | vice@iebc.ke | National |
| Commissioner 1 | comm1@iebc.ke | National |
| Commissioner 2 | comm2@iebc.ke | National |
| Commissioner 3 | comm3@iebc.ke | National |
| Commissioner 4 | comm4@iebc.ke | National |
| Commissioner 5 | comm5@iebc.ke | National |
| CEO/Commission Secretary | Moses Ledama Sunkuli | ceo@iebc.ke | National |
| County RO - Nairobi | (appointed) | nairobi.ro@iebc.ke | Nairobi (046) |
| County RO - Mombasa | (appointed) | mombasa.ro@iebc.ke | Mombasa (001) |
| ... | ... | ... | ... (all 47 counties) |

---

## 8. County-RO Assignment

Each of Kenya's 47 counties requires a County Returning Officer:

```sql
-- Sample county RO assignments
INSERT INTO returning_officers (id, first_name, last_name, email, iebc_role, assigned_county_id, assigned_county_name, level, status) VALUES
('ro-001', 'County', 'RO Mombasa', 'mombasa.ro@iebc.ke', 'COUNTY_RETURNING_OFFICER', '046', 'Nairobi', 'county', 'approved'),
('ro-002', 'County', 'RO Nairobi', 'nairobi.ro@iebc.ke', 'COUNTY_RETURNING_OFFICER', '001', 'Mombasa', 'county', 'approved'),
-- ... 45 more county ROs
```

Each County RO manages:
- Deputy County Returning Officer(s)
- All Constituency Returning Officers in their county
- Voter registration for the county
- Election results aggregation for the county

---

## 9. Constituency Structure

Kenya has 290 constituencies, each with a Constituency Returning Officer:

```
┌─────────────────────────────────────────────────────────────────────┐
│               CONSTITUENCY STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   COUNTY (47 total)                                                 │
│   └── County Returning Officer (CRO)                               │
│       ├── Deputy County Returning Officer (DCRO)                   │
│       │                                                              │
│       ├── CONSTITUENCY 1                                            │
│       │   └── Constituency Returning Officer (CRO)                 │
│       │       └── Deputy CRO                                        │
│       │           └── Ward Staff                                    │
│       │                                                              │
│       ├── CONSTITUENCY 2                                            │
│       │   └── Constituency Returning Officer                        │
│       │       └── ...                                               │
│       │                                                              │
│       └── ... (6-30 constituencies per county)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sample Constituencies per County

| County | # Constituencies | Sample Constituency |
|--------|------------------|---------------------|
| Nairobi | 17 | Westlands, Dagoretti North, Kibra |
| Mombasa | 6 | Changamwe, Jomvu, Kisauni |
| Nakuru | 11 | Nakuru Town West, Naivasha, Molo |
| Kakamega | 12 | Lurambi, Shinyalu, Ikolomani |
| Kiambu | 12 | Gatundu South, Kiambu Town |
| (All 47) | **290** | ... |

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
