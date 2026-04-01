/**
 * TypeORM DataSource Configuration for CLI Migrations
 * 
 * This file provides the DataSource configuration for running migrations
 * using TypeORM CLI commands:
 * 
 * ⚡ Migration Commands:
 *   npm run migration:generate -- src/database/migrations/InitialSchema
 *   npm run migration:run
 *   npm run migration:revert
 *   npm run migration:show
 * 
 * 📋 Alternative Commands (using typeorm CLI):
 *   npx typeorm migration:generate -d src/database/data-source.ts src/database/migrations/InitialSchema
 *   npx typeorm migration:run -d src/database/data-source.ts
 *   npx typeorm migration:revert -d src/database/data-source.ts
 * 
 * 🐳 Docker/Production Usage:
 *   docker exec voting-backend npm run migration:run
 *   docker exec voting-backend npm run migration:revert
 */

import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

// Import all entities for migration synchronization
import { County } from '../entities/county.entity';
import { Constituency } from '../entities/constituency.entity';
import { Ward } from '../entities/ward.entity';
import { Voter } from '../entities/voter.entity';
import { VoterBiometric } from '../entities/voter-biometric.entity';
import { Election } from '../entities/election.entity';
import { Candidate } from '../entities/candidate.entity';
import { PresidentialCandidate } from '../entities/presidential-candidate.entity';
import { Vote } from '../entities/vote.entity';
import { VoteTracking } from '../entities/vote-tracking.entity';
import { Batch } from '../entities/batch.entity';
import { Session } from '../entities/session.entity';
import { ReturningOfficer } from '../entities/returning-officer.entity';
import { RoApplication } from '../entities/ro-application.entity';
import { SuperAdmin } from '../entities/super-admin.entity';
import { LoginHistory } from '../entities/login-history.entity';
import { AuditLog } from '../entities/audit-log.entity';

/**
 * All entities - must be imported for migrations to work correctly
 * Order matters for foreign key constraints (parent tables first)
 */
const entities = [
  // Administrative entities
  County,
  Constituency,
  Ward,
  
  // User entities
  Voter,
  VoterBiometric,
  ReturningOfficer,
  SuperAdmin,
  
  // Election entities
  Election,
  Candidate,
  PresidentialCandidate,
  
  // Vote entities (high-volume, handle with care)
  Vote,
  VoteTracking,
  Batch,
  
  // Session & Security
  Session,
  LoginHistory,
  AuditLog,
  
  // Applications
  RoApplication,
];

/**
 * Get database configuration from environment variables
 */
function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
  };
}

/**
 * AppDataSource - Main DataSource for TypeORM operations
 * 
 * ⚠️ IMPORTANT: This DataSource is configured for MIGRATIONS ONLY
 * - synchronize: false (NEVER use in production - migrations handle schema)
 * - migrationsRun: false (run migrations explicitly)
 * - logging: only in development mode
 */
const appDataSource = new DataSource({
  ...getDatabaseConfig(),
  type: 'postgres' as const,
  
  // Entity configuration
  entities,
  
  // ⚠️ CRITICAL: Never use synchronize in production!
  // Use migrations instead: npm run migration:generate
  synchronize: process.env.NODE_ENV !== 'production',
  
  // Don't run migrations on startup - use CLI instead
  migrationsRun: false,
  
  // Logging configuration
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error', 'warn'],
  
  // Migration configuration
  migrations: [join(__dirname, 'migrations', '*.ts')],
  migrationsTableName: 'migrations',
  
  // Connection pool settings (optimized for high throughput)
  maxQueryExecutionTime: 30 * 1000, // 30 seconds
  extra: {
    max: 20, // Maximum connections in pool
    min: 5,  // Minimum connections in pool
  },
  
  // SSL configuration for production
  ssl: process.env.DB_SSL === 'true' 
    ? { rejectUnauthorized: false } 
    : false,
});

/**
 * Initialize the DataSource with proper error handling
 */
export async function initializeDataSource(): Promise<DataSource> {
  try {
    if (!appDataSource.isInitialized) {
      await appDataSource.initialize();
      console.log('✅ Database DataSource initialized successfully');
    }
    return appDataSource;
  } catch (error) {
    console.error('❌ Failed to initialize Database DataSource:', error);
    throw error;
  }
}

/**
 * Get the initialized DataSource
 */
export function getDataSource(): DataSource {
  if (!appDataSource.isInitialized) {
    throw new Error('DataSource not initialized. Call initializeDataSource() first.');
  }
  return appDataSource;
}

/**
 * Close database connection
 */
export async function closeDataSource(): Promise<void> {
  if (appDataSource.isInitialized) {
    await appDataSource.destroy();
    console.log('✅ Database DataSource closed');
  }
}

// Export default for CLI usage
export default appDataSource;