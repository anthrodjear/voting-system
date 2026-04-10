/**
 * Root Application Module
 * 
 * Main module that orchestrates all feature modules and infrastructure.
 * Uses async configuration pattern for proper dependency injection.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { validationConfig } from './config/configuration';

/**
 * Feature Modules
 */
import { AuthModule } from './modules/auth/auth.module';
import { VoterModule } from './modules/voter/voter.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { VoteModule } from './modules/vote/vote.module';
import { BatchModule } from './modules/batch/batch.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { RoModule } from './modules/ro/ro.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GeographicModule } from './modules/geographic/geographic.module';
import { UploadModule } from './modules/admin/upload.module';

/**
 * Health Module
 */
import { HealthModule } from './modules/health/health.module';

/**
 * Guards
 */
import { ThrottlerGuard } from './common/guards/throttler.guard';

/**
 * Root Application Module
 */
@Module({
  imports: [
    /**
     * Global Configuration Module
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env'],
      load: [validationConfig],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    /**
     * TypeORM Configuration
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD') || (() => { throw new Error('DB_PASSWORD environment variable is required. Set it in your .env file.'); })(),
        database: configService.get<string>('DB_DATABASE', 'voting_system'),
        entities: [__dirname + '/entities/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
        retryAttempts: parseInt(configService.get<string>('DB_RETRY_ATTEMPTS', '10'), 10),
        retryDelay: parseInt(configService.get<string>('DB_RETRY_DELAY', '3000'), 10),
        extra: {
          poolSize: parseInt(configService.get<string>('DB_POOL_SIZE', '20'), 10),
          min: parseInt(configService.get<string>('DB_POOL_MIN', '5'), 10),
          max: parseInt(configService.get<string>('DB_POOL_MAX', '50'), 10),
          idleTimeoutMillis: parseInt(configService.get<string>('DB_IDLE_TIMEOUT', '30000'), 10),
          connectionTimeoutMillis: parseInt(configService.get<string>('DB_CONNECTION_TIMEOUT', '10000'), 10),
        },
      }),
      inject: [ConfigService],
    }),

    /**
     * Throttler Module (Rate Limiting)
     */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: parseInt(configService.get<string>('THROTTLE_TTL', '60000'), 10),
            limit: parseInt(configService.get<string>('THROTTLE_LIMIT', '1000'), 10),
          },
        ],
      }),
      inject: [ConfigService],
    }),

     /**
      * Feature Modules
      */
     AuthModule,
     VoterModule,
     CandidateModule,
     VoteModule,
     BatchModule,
     AdminModule,
     ReportingModule,
     BlockchainModule,
     RoModule,
     NotificationModule,
     HealthModule,
     GeographicModule,
     UploadModule,
     UploadModule,
  ],
  
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}