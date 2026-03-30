/**
 * Seed CLI - Standalone script to run database seeds
 * 
 * Usage:
 *   npm run seed              # Run all seeds
 *   npm run seed:county       # Run only county seed
 *   npm run seed:constituency # Run only constituency seed
 *   npm run seed:voters      # Run only voter seed
 *   npm run seed:candidates  # Run only candidate seed
 *   npm run seed:elections   # Run only election seed
 * 
 * Or programmatically:
 *   npx ts-node src/database/seeds/seed-cli.ts
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { Voter } from '../../entities/voter.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Election } from '../../entities/election.entity';

import { CountySeed } from './county.seed';
import { ConstituencySeed } from './constituency.seed';
import { WardSeed } from './ward.seed';
import { ElectionSeed } from './election.seed';
import { VoterSeed } from './voter.seed';
import { CandidateSeed } from './candidate.seed';

async function createDataSource(): Promise<DataSource> {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
    entities: [
      County,
      Constituency,
      Ward,
      Voter,
      Candidate,
      Election,
    ],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  });

  await AppDataSource.initialize();
  return AppDataSource;
}

async function runSeeds() {
  const dataSource = await createDataSource();
  console.log('Database connection established\n');

  const args = process.argv.slice(2);
  const seedType = args[0] || 'all';

  try {
    switch (seedType) {
      case 'all':
        console.log('Running ALL seeds...\n');
        
        console.log('[1/6] Seeding Counties...');
        const countyRepo = dataSource.getRepository(County);
        const countySeed = new CountySeed(countyRepo);
        await countySeed.seed();
        
        console.log('\n[2/6] Seeding Constituencies...');
        const constituencyRepo = dataSource.getRepository(Constituency);
        const constituencySeed = new ConstituencySeed(constituencyRepo, countySeed);
        await constituencySeed.seed();
        
        console.log('\n[3/6] Seeding Wards...');
        const wardRepo = dataSource.getRepository(Ward);
        const wardSeed = new WardSeed(wardRepo, constituencySeed);
        await wardSeed.seed();
        
        console.log('\n[4/6] Seeding Elections...');
        const electionRepo = dataSource.getRepository(Election);
        const electionSeed = new ElectionSeed(electionRepo);
        await electionSeed.seed();
        
        console.log('\n[5/6] Seeding Voters...');
        const voterRepo = dataSource.getRepository(Voter);
        const voterSeed = new VoterSeed(voterRepo, countySeed, constituencySeed, wardSeed);
        await voterSeed.seed();
        
        console.log('\n[6/6] Seeding Candidates...');
        const candidateRepo = dataSource.getRepository(Candidate);
        const candidateSeed = new CandidateSeed(
          candidateRepo,
          countySeed,
          constituencySeed,
          wardSeed,
          electionSeed,
        );
        await candidateSeed.seed();
        
        break;

      case 'county':
      case 'counties':
        console.log('Seeding Counties...');
        const countyRepository = dataSource.getRepository(County);
        const countySeedService = new CountySeed(countyRepository);
        await countySeedService.seed();
        break;

      case 'constituency':
      case 'constituencies':
        console.log('Seeding Constituencies...');
        const countyRepo1 = dataSource.getRepository(County);
        const cs1 = new CountySeed(countyRepo1);
        const constRepo = dataSource.getRepository(Constituency);
        const constSeed = new ConstituencySeed(constRepo, cs1);
        await constSeed.seed();
        break;

      case 'ward':
      case 'wards':
        console.log('Seeding Wards...');
        const countyRepo2 = dataSource.getRepository(County);
        const cs2 = new CountySeed(countyRepo2);
        const constRepo2 = dataSource.getRepository(Constituency);
        const cs3 = new ConstituencySeed(constRepo2, cs2);
        const wardRepo2 = dataSource.getRepository(Ward);
        const wardSeedService = new WardSeed(wardRepo2, cs3);
        await wardSeedService.seed();
        break;

      case 'election':
      case 'elections':
        console.log('Seeding Elections...');
        const electionRepository = dataSource.getRepository(Election);
        const electionSeedService = new ElectionSeed(electionRepository);
        await electionSeedService.seed();
        break;

      case 'voter':
      case 'voters':
        console.log('Seeding Voters...');
        const countyRepo3 = dataSource.getRepository(County);
        const cs4 = new CountySeed(countyRepo3);
        const constRepo3 = dataSource.getRepository(Constituency);
        const cs5 = new ConstituencySeed(constRepo3, cs4);
        const wardRepo3 = dataSource.getRepository(Ward);
        const cs6 = new WardSeed(wardRepo3, cs5);
        const voterRepository = dataSource.getRepository(Voter);
        const voterSeedService = new VoterSeed(voterRepository, cs4, cs5, cs6);
        await voterSeedService.seed();
        break;

      case 'candidate':
      case 'candidates':
        console.log('Seeding Candidates...');
        const countyRepo4 = dataSource.getRepository(County);
        const cs7 = new CountySeed(countyRepo4);
        const constRepo4 = dataSource.getRepository(Constituency);
        const cs8 = new ConstituencySeed(constRepo4, cs7);
        const wardRepo4 = dataSource.getRepository(Ward);
        const cs9 = new WardSeed(wardRepo4, cs8);
        const electionRepo2 = dataSource.getRepository(Election);
        const cs10 = new ElectionSeed(electionRepo2);
        const candidateRepository = dataSource.getRepository(Candidate);
        const candidateSeedService = new CandidateSeed(
          candidateRepository,
          cs7,
          cs8,
          cs9,
          cs10,
        );
        await candidateSeedService.seed();
        break;

      default:
        console.error(`Unknown seed type: ${seedType}`);
        console.log('Available seed types: all, county, constituency, ward, election, voter, candidate');
        process.exit(1);
    }

    // Print summary
    console.log('\n========================================');
    console.log('Seed Summary:');
    console.log('========================================');
    
    const countyCount = await dataSource.getRepository(County).count();
    const constituencyCount = await dataSource.getRepository(Constituency).count();
    const wardCount = await dataSource.getRepository(Ward).count();
    const electionCount = await dataSource.getRepository(Election).count();
    const voterCount = await dataSource.getRepository(Voter).count();
    const candidateCount = await dataSource.getRepository(Candidate).count();
    
    console.log(`Counties:       ${countyCount}`);
    console.log(`Constituencies: ${constituencyCount}`);
    console.log(`Wards:         ${wardCount}`);
    console.log(`Elections:     ${electionCount}`);
    console.log(`Voters:        ${voterCount}`);
    console.log(`Candidates:    ${candidateCount}`);
    console.log('========================================\n');
    
    console.log('Seed completed successfully!');
    
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
runSeeds();
