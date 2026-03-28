# Database Migrations

## Overview

This document details the database migration strategy and versioning for the voting system.

---

## 1. Migration Strategy

### 1.1 Version Control

```sql
-- migrations table (auto-created by TypeORM/Drizzle)
CREATE TABLE IF NOT EXISTS __migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Migration Naming Convention

```
V001__initial_schema.sql
V002__add_biometric_tables.sql
V003__add_election_tables.sql
V004__add_blockchain_fields.sql
V005__add_indexes_performance.sql
```

---

## 2. Migration Files

### 2.1 V001: Initial Schema

```sql
-- V001__initial_schema.sql

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Geographic tables
CREATE TABLE counties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    county_code VARCHAR(10) UNIQUE NOT NULL,
    county_name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    capital VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    county_id UUID NOT NULL REFERENCES counties(id),
    constituency_code VARCHAR(10) UNIQUE NOT NULL,
    constituency_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    constituency_id UUID NOT NULL REFERENCES constituencies(id),
    ward_code VARCHAR(10) UNIQUE NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 V002: Add User Tables

```sql
-- V002__add_user_tables.sql

-- Super Admins
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    level VARCHAR(20) DEFAULT 'admin',
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returning Officers
CREATE TABLE returning_officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(8) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    preferred_county1 VARCHAR(100) NOT NULL,
    preferred_county2 VARCHAR(100) NOT NULL,
    assigned_county_id VARCHAR(10),
    assigned_county_name VARCHAR(100),
    level VARCHAR(20) DEFAULT 'county',
    status VARCHAR(20) DEFAULT 'draft',
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 V003: Add Voter Tables

```sql
-- V003__add_voter_tables.sql

-- Voters
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(8) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20) NOT NULL,
    
    county_id UUID REFERENCES counties(id),
    county_name VARCHAR(100),
    constituency_id UUID REFERENCES constituencies(id),
    constituency_name VARCHAR(100),
    ward_id UUID REFERENCES wards(id),
    ward_name VARCHAR(100),
    
    status VARCHAR(30) DEFAULT 'pending',
    national_id_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    
    password_hash VARCHAR(255) NOT NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP
);

-- Voter Biometrics
CREATE TABLE voter_biometrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID UNIQUE NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
    
    face_template TEXT,
    face_enrolled_at TIMESTAMP,
    face_enrolled BOOLEAN DEFAULT FALSE,
    
    left_thumb_template TEXT,
    right_thumb_template TEXT,
    fingerprint_enrolled_at TIMESTAMP,
    fingerprint_enrolled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 V004: Add Election Tables

```sql
-- V004__add_election_tables.sql

-- Elections
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_name VARCHAR(200) NOT NULL,
    election_type VARCHAR(50) NOT NULL,
    election_date DATE NOT NULL,
    
    registration_start_date TIMESTAMP,
    registration_end_date TIMESTAMP,
    nomination_start_date TIMESTAMP,
    nomination_end_date TIMESTAMP,
    voting_start_date TIMESTAMP,
    voting_end_date TIMESTAMP,
    
    status VARCHAR(20) DEFAULT 'draft',
    enable_online_voting BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_number VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    
    position VARCHAR(20) NOT NULL,
    
    county_id UUID REFERENCES counties(id),
    constituency_id UUID REFERENCES constituencies(id),
    
    party_name VARCHAR(200),
    party_abbreviation VARCHAR(10),
    is_independent BOOLEAN DEFAULT FALSE,
    
    date_of_birth DATE,
    photo TEXT,
    manifesto TEXT,
    manifesto_highlights TEXT[],
    
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by VARCHAR(100),
    
    election_id UUID REFERENCES elections(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id UUID NOT NULL REFERENCES voters(id),
    election_id UUID NOT NULL REFERENCES elections(id),
    
    encrypted_vote TEXT NOT NULL,
    vote_hash VARCHAR(64) NOT NULL,
    zk_proof TEXT,
    
    batch_id VARCHAR(50),
    blockchain_tx_hash VARCHAR(100),
    confirmation_number VARCHAR(20) UNIQUE NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    block_number INTEGER
);
```

### 2.5 V005: Add Audit Tables

```sql
-- V005__add_audit_tables.sql

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(50),
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login History
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Logs
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100),
    method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Data Migration

### 3.1 Seed Data

```sql
-- Seed 47 counties
INSERT INTO counties (county_name, county_code, region, capital) VALUES
('Mombasa', '001', 'Coast', 'Mombasa'),
('Kwale', '002', 'Coast', 'Kwale'),
('Kilifi', '003', 'Coast', 'Kilifi'),
('Tana River', '004', 'Coast', 'Tana River'),
('Lamu', '005', 'Coast', 'Lamu'),
('Taita Taveta', '006', 'Coast', 'Voi'),
-- ... (all 47 counties)
('Nairobi', '047', 'Central', 'Nairobi')
ON CONFLICT (county_code) DO NOTHING;

-- Seed sample constituencies per county
-- Seed sample wards per constituency
```

---

## 4. Rollback Strategy

### 4.1 Safe Rollbacks

```sql
-- Always create backup before migration
-- Example: 
-- Before: ALTER TABLE voters ADD COLUMN new_field
-- After: ALTER TABLE voters DROP COLUMN IF EXISTS new_field
```

### 4.2 Migration Template

```sql
-- Migration template
-- Migration: V00X__description.sql
-- Description: What this migration does

--[[UP]]--
-- Migration commands here
ALTER TABLE voters ADD COLUMN new_field VARCHAR(100);

--[[DOWN]]--
-- Rollback commands here
ALTER TABLE voters DROP COLUMN IF EXISTS new_field;
```
