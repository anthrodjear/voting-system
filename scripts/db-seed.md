# Database Seeding Guide

This document describes the database seeding process for the Voting System, including the seed scripts available, how to run them, and verification steps.

---

## Overview

Database seeding populates the voting system with foundational geographic and electoral data needed for the application to function. Seeding is essential because:

- **Geographic Hierarchy**: The voting system is built on Kenya's administrative structure (47 counties, 290 constituencies, 1,450+ wards)
- **Election Data**: Elections must exist before voters can participate
- **Test Data**: Pre-generated voters and candidates enable immediate testing of the system
- **Referential Integrity**: Seeds establish the relationships between entities (e.g., wards belong to constituencies, which belong to counties)

---

## Prerequisites

Before running any seed scripts, ensure the following:

### 1. Database Connection

The seeding scripts connect to PostgreSQL using environment variables. Create or update your `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=voting_system
```

### 2. Migration Status

Ensure migrations have been run before seeding. The seeds require the tables to exist:

```bash
# Navigate to backend directory
cd backend

# Run migrations
npm run migration:run
```

> **Note**: Seeds use `synchronize: false` to avoid accidentally modifying your schema. They only insert or update data within existing tables.

---

## Seed Scripts Description

The seed scripts are located in `backend/src/database/seeds/` and are implemented as TypeORM-based seed services. Each seed can be run independently or as part of a full seed operation.

### County Seed

- **File**: `county.seed.ts`
- **Data**: All 47 Kenyan counties with official IEBC codes
- **Fields**: countyCode, countyName, region, capital, areaSqKm, population
- **Example Counties**: Nairobi (001), Mombasa (002), Kisumu (043), Kakamega (038)
- **Behavior**: Upsert operation - updates existing counties if they already exist

### Constituency Seed

- **File**: `constituency.seed.ts`
- **Data**: All 290 Kenyan constituencies with IEBC codes
- **Fields**: constituencyCode, constituencyName, countyCode (foreign key)
- **Example**: Starehe (001), Westlands (006), Kisumu Central (258)
- **Dependency**: Requires counties to be seeded first (for foreign key references)

### Ward Seed

- **File**: `ward.seed.ts`
- **Data**: 600+ Kenyan wards with IEBC codes
- **Fields**: wardCode, wardName, constituencyCode (foreign key)
- **Example**: Pumwani (001001), Westlands (001021), Kisumu Central (043002)
- **Dependency**: Requires constituencies to be seeded first

### Voter Seed

- **File**: `voter.seed.ts`
- **Data**: 120+ randomly generated test voters
- **Fields**: nationalId, firstName, lastName, dateOfBirth, email, phoneNumber
- **Location**: Distributed across 40+ wards in major counties
- **Default Password**: `voter123` (bcrypt hash: `$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`)
- **Status**: All generated voters are pre-verified
- **Dependency**: Requires counties, constituencies, and wards to be seeded

### Candidate Seed

- **File**: `candidate.seed.ts`
- **Data**: 200+ candidates across multiple positions
- **Positions**:
  - President: 5 candidates
  - Governor: 30-50 candidates (10 counties, 3-5 per county)
  - Senator: 30-50 candidates (10 counties, 3-5 per county)
  - MP: 80-120 candidates (20 constituencies, 4-8 per constituency)
  - MCA: 60-100 candidates (20 wards, 3-7 per ward)
- **Parties**: Jubilee Party, ODM, KANU, WDM, ANC, Ford Kenya, and more
- **Status**: All candidates are pre-approved
- **Dependency**: Requires counties, constituencies, wards, and elections to be seeded

### Election Seed

- **File**: `election.seed.ts`
- **Data**: 10 elections (past, present, and future)
- **Election Types**: General elections, by-elections
- **Examples**:
  - Kenya General Elections 2017 (completed)
  - Kenya General Elections 2022 (completed)
  - Kenya General Elections 2024 (active)
  - Kenya General Elections 2027 (draft)
  - Various by-elections (2021-2025)
- **Fields**: electionName, electionType, electionDate, registration dates, nomination dates, voting dates, status

---

## Running Seeds

All seed commands are executed from the `backend/` directory.

### Order of Execution

When running seeds individually, follow this order to maintain referential integrity:

```
1. Counties        → Required by constituencies
2. Constituencies  → Required by wards
3. Wards           → Required by voters
4. Elections       → Required by candidates
5. Voters          → Independent
6. Candidates      → Requires all above
```

### Run All Seeds

To seed the entire database in one command:

```bash
cd backend
npm run seed
```

Or equivalently:

```bash
cd backend
npm run seed:all
```

This runs all six seeds in the correct order and displays a summary at the end.

### Run Individual Seeds

```bash
# Seed only counties
npm run seed:county

# Seed only constituencies
npm run seed:constituency

# Seed only wards
npm run seed:ward

# Seed only elections
npm run seed:election

# Seed only voters
npm run seed:voter

# Seed only candidates
npm run seed:candidate
```

---

## Verification Steps

After running seeds, verify that data was loaded correctly using SQL queries via psql or any PostgreSQL client.

### Connect to Database

```bash
psql -h localhost -U postgres -d voting_system
```

### Verify Data Counts

```sql
-- Check all table counts
SELECT 'Counties'       AS entity, COUNT(*) AS total FROM counties
UNION ALL
SELECT 'Constituencies', COUNT(*)        FROM constituencies
UNION ALL
SELECT 'Wards',         COUNT(*)        FROM wards
UNION ALL
SELECT 'Elections',     COUNT(*)        FROM elections
UNION ALL
SELECT 'Voters',        COUNT(*)        FROM voters
UNION ALL
SELECT 'Candidates',    COUNT(*)        FROM candidates;
```

Expected output:
```
    entity     | total 
---------------+-------
 Counties      |    47
 Constituencies|   290
 Wards         |   600+
 Elections     |    10
 Voters        |   120
 Candidates    |   200+
```

### Verify Geographic Hierarchy

```sql
-- Verify county -> constituency -> ward relationship
SELECT 
    c.county_name,
    COUNT(DISTINCT con.constituency_code) AS constituencies,
    COUNT(DISTINCT w.ward_code) AS wards
FROM counties c
LEFT JOIN constituencies con ON con.county_id = c.id
LEFT JOIN wards w ON w.constituency_id = con.id
GROUP BY c.county_name
ORDER BY constituencies DESC
LIMIT 10;
```

### Verify Voters by County

```sql
-- Distribution of test voters
SELECT 
    c.county_name,
    COUNT(v.id) AS voter_count
FROM voters v
JOIN counties c ON c.id = v.county_id
GROUP BY c.county_name
ORDER BY voter_count DESC;
```

### Verify Candidates by Position

```sql
-- Candidate count by position
SELECT 
    position,
    COUNT(*) AS total,
    COUNT(DISTINCT party_abbreviation) AS parties
FROM candidates
GROUP BY position
ORDER BY total DESC;
```

### Verify Active Election

```sql
-- Check the active election
SELECT 
    election_name,
    election_type,
    election_date,
    status,
    enable_online_voting
FROM elections
WHERE status = 'active';
```

---

## Custom Data

### Adding Custom Seed Data

To add custom data to the seeds, edit the respective seed file in `backend/src/database/seeds/`:

1. **County/Constituency/Ward**: Add entries to the static data arrays in each seed file
2. **Voters**: Modify the `generateVoterData()` method in `voter.seed.ts` to change voter count or distribution
3. **Candidates**: Modify the generation methods in `candidate.seed.ts` to add specific candidates
4. **Elections**: Add new election objects to the `elections` array in `election.seed.ts`

After editing, re-run the relevant seed command:

```bash
npm run seed:county      # For geographic data
npm run seed:voter       # For voter data
npm run seed:candidate  # For candidate data
npm run seed:election    # For election data
```

### Reset Procedures

To reset and re-seed data:

#### Reset All Data

```bash
# Drop all tables (careful - this deletes everything!)
npm run migration:drop

# Re-run migrations
npm run migration:run

# Re-seed everything
npm run seed
```

#### Reset Specific Entity

To reset only voters, for example:

```sql
-- Delete all voters
DELETE FROM voters;

-- Re-run voter seed
npm run seed:voter
```

#### Reset Candidates for Active Election

```sql
-- Delete candidates for a specific election
DELETE FROM candidates 
WHERE election_id = (SELECT id FROM elections WHERE status = 'active');

-- Re-seed candidates
npm run seed:candidate
```

---

## Troubleshooting

### "Connection refused" Error

Ensure PostgreSQL is running and the database connection details in `.env` are correct:

```bash
# Check PostgreSQL status (Linux/macOS)
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d voting_system
```

### "Relation does not exist" Error

Run migrations before seeding:

```bash
npm run migration:run
```

### Foreign Key Constraint Errors

Ensure seeds run in the correct order. If running individually:

1. Counties first
2. Then constituencies
3. Then wards
4. Then elections
5. Then voters
6. Finally candidates

### Duplicate Data

The seeds use upsert operations (insert or update). Re-running seeds is safe and will not create duplicates - it will update existing records.

---

## Seed File Reference

| Seed Script | Location | Records | Dependencies |
|-------------|----------|---------|--------------|
| County | `src/database/seeds/county.seed.ts` | 47 | None |
| Constituency | `src/database/seeds/constituency.seed.ts` | 290 | Counties |
| Ward | `src/database/seeds/ward.seed.ts` | 600+ | Constituencies |
| Election | `src/database/seeds/election.seed.ts` | 10 | None |
| Voter | `src/database/seeds/voter.seed.ts` | 120+ | Counties, Constituencies, Wards |
| Candidate | `src/database/seeds/candidate.seed.ts` | 200+ | Counties, Constituencies, Wards, Elections |

---

## Related Documentation

- [Database Schema](../backend/src/database/schema.md)
- [Migration Guide](./db-migration.md)
- [Environment Configuration](./environment.md)
