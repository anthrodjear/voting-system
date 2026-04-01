/**
 * Seed Runner - Orchestrates database seeding in proper dependency order
 * 
 * Usage:
 *   npm run seed              # Run all seeds in order
 *   npm run seed:county       # Run only county seed
 *   npm run seed:voter        # Run only voter seed
 *   npm run seed:rollback     # Clear all seed data
 * 
 * Seed Order (critical for foreign key constraints):
 *   1. Counties (no dependencies)
 *   2. Constituencies (depends on Counties)
 *   3. Wards (depends on Constituencies)
 *   4. Elections (no dependencies)
 *   5. Voters (depends on Counties, Constituencies, Wards)
 *   6. Candidates (depends on all location entities + Elections)
 * 
 * Features:
 * - Progress reporting with timestamps
 * - Error handling with detailed messages
 * - Idempotent operations (safe to run multiple times)
 * - Transaction support for data consistency
 * - Summary statistics after completion
 */

import 'reflect-metadata';
import { DataSource, QueryRunner, Table } from 'typeorm';
import { config } from 'dotenv';

// Load environment
config();

import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { Voter } from '../../entities/voter.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';
import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { Vote } from '../../entities/vote.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import { Batch } from '../../entities/batch.entity';
import { Session } from '../../entities/session.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { LoginHistory } from '../../entities/login-history.entity';
import { AuditLog } from '../../entities/audit-log.entity';

import { CountySeed } from './county.seed';
import { ConstituencySeed } from './constituency.seed';
import { WardSeed } from './ward.seed';
import { ElectionSeed } from './election.seed';
import { VoterSeed } from './voter.seed';
import { CandidateSeed } from './candidate.seed';

// Seed result interface
interface SeedResult {
  name: string;
  success: boolean;
  duration: number;
  recordsCount?: number;
  error?: string;
}

/**
 * Color-coded console output
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function logError(message: string) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarn(message: string) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/**
 * Create configured DataSource
 */
async function createDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
    entities: [
      County, Constituency, Ward, Voter, VoterBiometric,
      Election, Candidate, PresidentialCandidate,
      Vote, VoteTracking, Batch, Session,
      ReturningOfficer, SuperAdmin, LoginHistory, AuditLog
    ],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  return dataSource;
}

/**
 * Execute a single seed with timing and error handling
 */
async function runSeed(
  name: string,
  seedFn: () => Promise<void>,
  countFn: () => Promise<number>
): Promise<SeedResult> {
  const startTime = Date.now();
  
  try {
    logInfo(`Running ${name} seed...`);
    await seedFn();
    const count = await countFn();
    const duration = Date.now() - startTime;
    
    logSuccess(`${name} completed (${count} records, ${duration}ms)`);
    
    return {
      name,
      success: true,
      duration,
      recordsCount: count,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logError(`${name} failed: ${errorMessage}`);
    
    return {
      name,
      success: false,
      duration,
      error: errorMessage,
    };
  }
}

/**
 * Run all seeds in proper order
 */
async function runAllSeeds(dataSource: DataSource) {
  const results: SeedResult[] = [];
  
  // Get repositories
  const countyRepo = dataSource.getRepository(County);
  const constituencyRepo = dataSource.getRepository(Constituency);
  const wardRepo = dataSource.getRepository(Ward);
  const electionRepo = dataSource.getRepository(Election);
  const voterRepo = dataSource.getRepository(Voter);
  const candidateRepo = dataSource.getRepository(Candidate);
  
  // Create seed instances
  const countySeed = new CountySeed(countyRepo);
  const constituencySeed = new ConstituencySeed(constituencyRepo, countySeed);
  const wardSeed = new WardSeed(wardRepo, constituencySeed);
  const electionSeed = new ElectionSeed(electionRepo);
  const voterSeed = new VoterSeed(voterRepo, countySeed, constituencySeed, wardSeed);
  const candidateSeed = new CandidateSeed(
    candidateRepo,
    countySeed,
    constituencySeed,
    wardSeed,
    electionSeed
  );
  
  // ============================================
  // SEED 1: Counties (foundation data)
  // ============================================
  results.push(await runSeed(
    'County',
    () => countySeed.seed(),
    () => countyRepo.count()
  ));
  
  // ============================================
  // SEED 2: Constituencies
  // ============================================
  results.push(await runSeed(
    'Constituency',
    () => constituencySeed.seed(),
    () => constituencyRepo.count()
  ));
  
  // ============================================
  // SEED 3: Wards
  // ============================================
  results.push(await runSeed(
    'Ward',
    () => wardSeed.seed(),
    () => wardRepo.count()
  ));
  
  // ============================================
  // SEED 4: Elections
  // ============================================
  results.push(await runSeed(
    'Election',
    () => electionSeed.seed(),
    () => electionRepo.count()
  ));
  
  // ============================================
  // SEED 5: Voters
  // ============================================
  results.push(await runSeed(
    'Voter',
    () => voterSeed.seed(),
    () => voterRepo.count()
  ));
  
  // ============================================
  // SEED 6: Candidates
  // ============================================
  results.push(await runSeed(
    'Candidate',
    () => candidateSeed.seed(),
    () => candidateRepo.count()
  ));
  
  return results;
}

/**
 * Print summary report
 */
function printSummary(results: SeedResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.bold}SEED SUMMARY REPORT${colors.reset}`);
  console.log('='.repeat(60));
  
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  results.forEach(result => {
    const status = result.success 
      ? `${colors.green}✓ PASS${colors.reset}` 
      : `${colors.red}✗ FAIL${colors.reset}`;
    
    const count = result.recordsCount !== undefined 
      ? `(${result.recordsCount} records)` 
      : '';
    
    console.log(
      `${status} ${result.name.padEnd(20)} ${result.duration.toString().padStart(5)}ms ${count}`
    );
  });
  
  console.log('='.repeat(60));
  console.log(`Total seeds: ${results.length} | ${colors.green}Passed: ${successful}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total execution time: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log('='.repeat(60));
  
  if (failed > 0) {
    console.log(`\n${colors.red}⚠️  ${failed} seed(s) failed. Check errors above.${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(`
${colors.bold}
╔═══════════════════════════════════════════════════════════════╗
║           🔄 IEBC VOTING SYSTEM - DATABASE SEEDER 🔄          ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}
  `);

  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  try {
    // Database connection
    logInfo('Connecting to database...');
    const dataSource = await createDataSource();
    logSuccess('Database connected');
    
    console.log('');
    
    if (command === 'clear' || command === 'rollback') {
      // Clear all seeded data (keep structure)
      logWarn('Clearing all seeded data...');
      
      // Use native query to truncate tables in correct order
      await dataSource.query(`TRUNCATE TABLE presidential_candidates, candidates, vote_tracking, votes, batches, ro_applications, voters, voter_biometrics, elections, sessions, login_history, audit_logs, returning_officers, wards, constituencies, super_admins, counties CASCADE`);
      
      logSuccess('All seeded data cleared');
    } else {
      // Run seeds
      const results = await runAllSeeds(dataSource);
      printSummary(results);
      
      // Log final status
      const failed = results.filter(r => !r.success).length;
      if (failed === 0) {
        console.log(`\n${colors.green}${colors.bold}🎉 All seeds completed successfully!${colors.reset}\n`);
      }
    }
    
    // Cleanup
    await dataSource.destroy();
    console.log('Database connection closed');
    
    process.exit(0);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Fatal error: ${errorMessage}`);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
main();