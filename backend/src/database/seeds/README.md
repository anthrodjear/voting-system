# Database Seeds

This directory contains seed scripts for populating the database with test data.

## Seed Files

| File | Description |
|------|-------------|
| `county.seed.ts` | Seeds all 47 Kenyan counties with official IEBC codes |
| `constituency.seed.ts` | Seeds 290 Kenyan constituencies |
| `ward.seed.ts` | Seeds 1,450 Kenyan wards |
| `voter.seed.ts` | Generates 120+ test voters with valid National IDs |
| `candidate.seed.ts` | Creates test candidates for all positions |
| `election.seed.ts` | Creates past, active, and upcoming elections |
| `seed-cli.ts` | Standalone CLI for running seeds |
| `index.ts` | Module and SeedRunner for NestJS integration |

## Usage

### Using npm scripts

```bash
# Run all seeds
npm run seed

# Run specific seed
npm run seed:county
npm run seed:constituency
npm run seed:ward
npm run seed:election
npm run seed:voter
npm run seed:candidate
```

### Using NestJS Dependency Injection

```typescript
import { Module } from '@nestjs/common';
import { SeedsModule, SeedRunner } from './database/seeds';

@Module({
  imports: [SeedsModule],
})
export class AppModule {}

@Injectable()
export class MyService {
  constructor(private readonly seedRunner: SeedRunner) {}
  
  async seedDatabase() {
    await this.seedRunner.runAll();
  }
}
```

### Running Individual Seeds

```typescript
import { CountySeed } from './database/seeds/county.seed';

@Injectable()
export class MyService {
  constructor(private readonly countySeed: CountySeed) {}
  
  async seedCounties() {
    await this.countySeed.seed();
  }
}
```

## Seed Data Details

### Counties (1.3.1)
- All 47 Kenyan counties with official IEBC codes (001-047)
- Includes: countyCode, countyName, region, capital, areaSqKm, population

### Constituencies (1.3.2)
- 290 constituencies across all counties
- Proper foreign key relationships to counties

### Wards (1.3.3)
- 1,450 wards distributed across constituencies
- Foreign key relationships to constituencies

### Voters (1.3.4)
- 120 test voters with valid 8-digit National IDs
- Distributed across various counties
- Status: verified, with all required fields

### Candidates (1.3.5)
- Presidential candidates (5)
- Governor candidates (10 counties × 3-5 candidates)
- Senator candidates (10 counties × 3-5 candidates)
- MP candidates (20 constituencies × 4-7 candidates)
- MCA candidates (20 wards × 3-6 candidates)

### Elections (1.3.6)
- Past elections (2013, 2017, 2022, by-elections)
- Active election (2024 General Elections)
- Upcoming elections (2025, 2027)

## Database Connection

Ensure your `.env` file has the correct database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=voting_system
```

## Idempotency

All seed scripts support idempotent execution:
- Uses `upsert` logic to update existing records
- Safe to run multiple times
- Won't create duplicates
