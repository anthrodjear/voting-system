/**
 * Health Check Module
 * 
 * Provides health check endpoints for monitoring infrastructure.
 * Includes readiness checks (database, redis, rabbitmq) and liveness checks.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Health Module
 * 
 * Provides:
 * - GET /health - Liveness probe (is the app running?)
 * - GET /health/ready - Readiness probe (can the app serve traffic?)
 * - GET /health/live - Liveness probe (simplified)
 */
@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}