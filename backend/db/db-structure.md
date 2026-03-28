# Database Structure

## Overview

This document details the complete database schema for the voting system.

---

## 1. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATABASE RELATIONSHIPS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│  │   County    │────────<│    Voter    │>────────│     Vote     │       │
│  └──────────────┘         └──────────────┘         └──────────────┘       │
│         │                        │                        │                 │
│         │                        │                        │                 │
│         ▼                        ▼                        ▼                 │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│  │Constituency  │         │VoterBiometric│         │   Election   │       │
│  └──────────────┘         └──────────────┘         └──────────────┘       │
│         │                                                   │                 │
│         │                                                   │                 │
│         ▼                                                   ▼                 │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│  │    Ward      │         │ Returning    │         │  Candidate   │       │
│  └──────────────┘         │   Officer    │         └──────────────┘       │
│                          └──────────────┘                │                 │
│                                 │                        │                 │
│                                 ▼                        ▼                 │
│                          ┌──────────────┐         ┌──────────────┐       │
│                          │ROApplication│         │    Election  │       │
│                          └──────────────┘         │   Results    │       │
│                                                     └──────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Tables

### 2.1 Users & Authentication

```sql
-- Super Admins
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    level VARCHAR(20) DEFAULT 'admin',
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Returning Officers
CREATE TABLE returning_officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);
```

### 2.2 Geographic Data

```sql
-- Counties
CREATE TABLE counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    county_code VARCHAR(10) UNIQUE NOT NULL,
    county_name VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(100) NOT NULL,
    capital VARCHAR(100),
    area_sq_km DECIMAL(10,2),
    population INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Constituencies
CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    county_id UUID NOT NULL REFERENCES counties(id),
    constituency_code VARCHAR(10) UNIQUE NOT NULL,
    constituency_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wards
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID NOT NULL REFERENCES constituencies(id),
    ward_code VARCHAR(10) UNIQUE NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Voters

```sql
-- Voters
CREATE TABLE voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    password_changed_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registered_at TIMESTAMP
);

-- Voter Biometrics
CREATE TABLE voter_biometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID UNIQUE NOT NULL REFERENCES voters(id) ON DELETE CASCADE,
    
    face_template TEXT,
    face_enrolled_at TIMESTAMP,
    face_enrolled BOOLEAN DEFAULT FALSE,
    face_quality_score FLOAT,
    
    left_thumb_template TEXT,
    right_thumb_template TEXT,
    fingerprint_enrolled_at TIMESTAMP,
    fingerprint_enrolled BOOLEAN DEFAULT FALSE,
    fingerprint_quality_score FLOAT,
    
    liveness_challenge TEXT,
    liveness_generated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.4 Elections & Candidates

```sql
-- Elections
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    total_votes_cast INTEGER DEFAULT 0,
    turnout_percentage DECIMAL(5,2),
    
    blockchain_contract_address VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number VARCHAR(10) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    
    position VARCHAR(20) NOT NULL,
    
    county_id UUID REFERENCES counties(id),
    constituency_id UUID REFERENCES constituencies(id),
    ward_id UUID REFERENCES wards(id),
    
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

-- Presidential Candidates (Extended)
CREATE TABLE presidential_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID UNIQUE NOT NULL REFERENCES candidates(id),
    deputy_full_name VARCHAR(200) NOT NULL,
    deputy_date_of_birth DATE,
    deputy_photo TEXT,
    nomination_date DATE NOT NULL,
    nomination_county VARCHAR(100) NOT NULL,
    nominator_count INTEGER NOT NULL,
    campaign_slogan VARCHAR(200),
    ballot_symbol VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 Voting

```sql
-- Votes
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    block_number INTEGER,
    
    INDEX idx_votes_voter (voter_id),
    INDEX idx_votes_election (election_id),
    INDEX idx_votes_hash (vote_hash),
    INDEX idx_votes_confirmation (confirmation_number)
);

-- Vote Tracking (for voter to check if voted)
CREATE TABLE vote_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID UNIQUE NOT NULL REFERENCES voters(id),
    election_id UUID NOT NULL REFERENCES elections(id),
    has_voted BOOLEAN DEFAULT FALSE,
    voted_at TIMESTAMP,
    confirmation_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.6 RO Applications

```sql
-- RO Applications
CREATE TABLE ro_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ro_id UUID NOT NULL REFERENCES returning_officers(id),
    election_cycle VARCHAR(50) NOT NULL,
    
    preferred_county1 VARCHAR(100) NOT NULL,
    preferred_county2 VARCHAR(100) NOT NULL,
    cover_letter TEXT,
    years_of_experience INTEGER,
    has_prior_experience BOOLEAN DEFAULT FALSE,
    prior_experience_details TEXT,
    
    uploaded_documents JSONB,
    
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    rejection_reason TEXT,
    
    assigned_county VARCHAR(100),
    assigned_at TIMESTAMP,
    assigned_by VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Audit & Logging

```sql
-- Audit Logs
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
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Login History
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Request Logs
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100),
    method VARCHAR(10) NOT NULL,
    path VARCHAR(255) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Indexes

```sql
-- Performance indexes
CREATE INDEX idx_voters_national_id ON voters(national_id);
CREATE INDEX idx_voters_county ON voters(county_id);
CREATE INDEX idx_voters_status ON voters(status);
CREATE INDEX idx_voters_email ON voters(email);

CREATE INDEX idx_candidates_election ON candidates(election_id);
CREATE INDEX idx_candidates_position ON candidates(position);
CREATE INDEX idx_candidates_county ON candidates(county_id);
CREATE INDEX idx_candidates_status ON candidates(status);

CREATE INDEX idx_votes_election ON votes(election_id);
CREATE INDEX idx_votes_voter ON votes(voter_id);
CREATE INDEX idx_votes_hash ON votes(vote_hash);
CREATE INDEX idx_votes_confirmation ON votes(confirmation_number);
CREATE INDEX idx_votes_blockchain ON votes(blockchain_tx_hash);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

CREATE INDEX idx_login_user ON login_history(user_id);
CREATE INDEX idx_login_created ON login_history(created_at);

CREATE INDEX idx_api_path ON api_logs(path);
CREATE INDEX idx_api_status ON api_logs(status_code);
CREATE INDEX idx_api_created ON api_logs(created_at);
```

---

## 4. Constraints

```sql
-- Voter age constraint (must be 18+)
ALTER TABLE voters 
ADD CONSTRAINT check_voter_age 
CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years');

-- Unique vote per election per voter
ALTER TABLE votes 
ADD CONSTRAINT unique_vote_per_election 
UNIQUE (voter_id, election_id);

-- National ID format
ALTER TABLE voters 
ADD CONSTRAINT valid_national_id 
CHECK (national_id ~ '^[0-9]{8}$');

-- Password not same as national ID
ALTER TABLE voters 
ADD CONSTRAINT password_not_id 
CHECK (password_hash != national_id);

-- Valid candidate status
ALTER TABLE candidates 
ADD CONSTRAINT valid_candidate_status 
CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'withdrawn', 'disqualified'));

-- Valid election status
ALTER TABLE elections 
ADD CONSTRAINT valid_election_status 
CHECK (status IN ('draft', 'scheduled', 'registration', 'voting', 'tallying', 'completed', 'cancelled'));
```

---

## 5. Views

```sql
-- Voter summary view
CREATE VIEW v_voter_summary AS
SELECT 
    v.id,
    v.national_id,
    v.first_name,
    v.last_name,
    v.county_name,
    v.constituency_name,
    v.ward_name,
    v.status,
    v.registered_at,
    c.county_name AS registered_county,
    COUNT(DISTINCT vo.id) AS vote_count
FROM voters v
LEFT JOIN counties c ON v.county_id = c.id
LEFT JOIN votes vo ON v.id = vo.voter_id
GROUP BY v.id, c.county_name;

-- Election results view
CREATE VIEW v_election_results AS
SELECT 
    e.id AS election_id,
    e.election_name,
    e.election_date,
    e.status,
    c.position,
    c.candidate_number,
    c.first_name,
    c.last_name,
    c.party_name,
    COUNT(v.id) AS vote_count,
    COUNT(v.id)::DECIMAL / NULLIFYZERO(e.total_votes_cast) * 100 AS percentage
FROM elections e
JOIN candidates c ON e.id = c.election_id
LEFT JOIN votes v ON c.id = v.candidate_id
WHERE c.status = 'approved'
GROUP BY e.id, c.id
ORDER BY e.election_date DESC, c.position, vote_count DESC;

-- Turnout by county
CREATE VIEW v_county_turnout AS
SELECT 
    e.id AS election_id,
    e.election_name,
    co.county_name,
    COUNT(DISTINCT v.id) AS registered_voters,
    COUNT(DISTINCT vo.voter_id) AS voters_who_voted,
    ROUND(
        COUNT(DISTINCT vo.voter_id)::DECIMAL / 
        NULLIFYZERO(COUNT(DISTINCT v.id)) * 100,
        2
    ) AS turnout_percentage
FROM elections e
JOIN voters v ON v.county_id IS NOT NULL
JOIN counties co ON v.county_id = co.id
LEFT JOIN votes vo ON v.id = vo.voter_id AND vo.election_id = e.id
WHERE e.status IN ('completed', 'tallying')
GROUP BY e.id, co.id
ORDER BY e.election_date DESC, turnout_percentage DESC;
```
