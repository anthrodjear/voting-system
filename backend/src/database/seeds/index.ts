import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { Voter } from '../../entities/voter.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Election } from '../../entities/election.entity';

import { CountySeed } from './county.seed';
import { ConstituencySeed } from './constituency.seed';
import { WardSeed } from './ward.seed';
import { VoterSeed } from './voter.seed';
import { CandidateSeed } from './candidate.seed';
import { ElectionSeed } from './election.seed';

export const SEED_ORDER = [
  'County',
  'Constituency',
  'Ward',
  'Election',
  'Voter',
  'Candidate',
] as const;

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      County,
      Constituency,
      Ward,
      Voter,
      Candidate,
      Election,
    ]),
  ],
  providers: [
    CountySeed,
    ConstituencySeed,
    WardSeed,
    VoterSeed,
    CandidateSeed,
    ElectionSeed,
  ],
  exports: [
    CountySeed,
    ConstituencySeed,
    WardSeed,
    VoterSeed,
    CandidateSeed,
    ElectionSeed,
  ],
})
export class SeedsModule {}

/**
 * Seed Runner - runs all seeds in the correct order
 * 
 * Usage:
 * ```typescript
 * import { SeedRunner } from './database/seeds';
 * 
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly seedRunner: SeedRunner) {}
 *   
 *   async runSeeds() {
 *     await this.seedRunner.runAll();
 *   }
 * }
 * ```
 */
@Injectable()
export class SeedRunner {
  constructor(
    private readonly countySeed: CountySeed,
    private readonly constituencySeed: ConstituencySeed,
    private readonly wardSeed: WardSeed,
    private readonly electionSeed: ElectionSeed,
    private readonly voterSeed: VoterSeed,
    private readonly candidateSeed: CandidateSeed,
  ) {}

  /**
   * Run all seeds in the correct order
   * Order: County -> Constituency -> Ward -> Election -> Voter -> Candidate
   */
  async runAll(): Promise<void> {
    console.log('===========================================');
    console.log('Starting Database Seed Process');
    console.log('===========================================');

    // 1. Seed Counties first (no dependencies)
    console.log('\n[1/6] Seeding Counties...');
    await this.countySeed.seed();

    // 2. Seed Constituencies (depends on County)
    console.log('\n[2/6] Seeding Constituencies...');
    await this.constituencySeed.seed();

    // 3. Seed Wards (depends on Constituency)
    console.log('\n[3/6] Seeding Wards...');
    await this.wardSeed.seed();

    // 4. Seed Elections (no dependencies)
    console.log('\n[4/6] Seeding Elections...');
    await this.electionSeed.seed();

    // 5. Seed Voters (depends on County, Constituency, Ward)
    console.log('\n[5/6] Seeding Voters...');
    await this.voterSeed.seed();

    // 6. Seed Candidates (depends on all other entities)
    console.log('\n[6/6] Seeding Candidates...');
    await this.candidateSeed.seed();

    console.log('\n===========================================');
    console.log('Database Seed Complete!');
    console.log('===========================================');
  }

  /**
   * Run a specific seed
   */
  async runSeed(seedName: string): Promise<void> {
    const seedNameLower = seedName.toLowerCase();

    switch (seedNameLower) {
      case 'county':
      case 'counties':
        await this.countySeed.seed();
        break;
      case 'constituency':
      case 'constituencies':
        await this.constituencySeed.seed();
        break;
      case 'ward':
      case 'wards':
        await this.wardSeed.seed();
        break;
      case 'election':
      case 'elections':
        await this.electionSeed.seed();
        break;
      case 'voter':
      case 'voters':
        await this.voterSeed.seed();
        break;
      case 'candidate':
      case 'candidates':
        await this.candidateSeed.seed();
        break;
      default:
        throw new Error(`Unknown seed: ${seedName}`);
    }
  }
}

/**
 * Inject decorator for SeedRunner
 */
import { Injectable, Inject } from '@nestjs/common';

/**
 * Type for seed runner function
 */
export type SeedFunction = () => Promise<void>;

/**
 * Data Transfer Object for seed results
 */
export interface SeedResult {
  seedName: string;
  success: boolean;
  duration?: number;
  error?: string;
  recordsCount?: number;
}
