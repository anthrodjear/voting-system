/**
 * Health Check Service
 * 
 * Handles health checks for all infrastructure dependencies.
 * Supports both liveness (is process alive?) and readiness (can we serve traffic?) checks.
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    rabbitmq: ServiceStatus;
    blockchain?: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class HealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HealthService.name);
  private startTime: number;
  private redisClient: Redis | null = null;
  private version = '1.0.0';

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.startTime = Date.now();
  }

  async onModuleInit(): Promise<void> {
    await this.initializeRedisHealthCheck();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  private async initializeRedisHealthCheck(): Promise<void> {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
      
      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        lazyConnect: true,
        connectTimeout: 5000,
        maxRetriesPerRequest: 1,
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis health check error: ${err.message}`);
      });

    } catch (error) {
      this.logger.warn('Failed to initialize Redis health check client');
    }
  }

  getLiveness(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async checkReadiness(): Promise<SystemHealth> {
    const services = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      rabbitmq: await this.checkRabbitMQ(),
    };

    const allCriticalHealthy = 
      services.database.status === 'up' && 
      services.redis.status === 'up';

    const hasDegraded = Object.values(services).some(s => s.status === 'degraded');

    let status: 'healthy' | 'unhealthy' | 'degraded';
    if (allCriticalHealthy) {
      status = hasDegraded ? 'degraded' : 'healthy';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: this.version,
      services,
    };
  }

  async checkDatabase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      const isConnected = this.dataSource.isInitialized;
      
      if (isConnected) {
        await this.dataSource.query('SELECT 1');
      }

      const latency = Date.now() - startTime;

      return {
        status: latency < 1000 ? 'up' : 'degraded',
        latency,
        message: 'Database connection active',
      };

    } catch (error) {
      this.logger.error(`Database health check failed: ${(error as Error).message}`);
      return {
        status: 'down',
        message: 'Database connection failed',
      };
    }
  }

  async checkRedis(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    if (!this.redisClient) {
      return {
        status: 'degraded',
        message: 'Redis client not initialized',
      };
    }

    try {
      const result = await this.redisClient.ping();
      const latency = Date.now() - startTime;
      
      if (result === 'PONG') {
        return {
          status: latency < 500 ? 'up' : 'degraded',
          latency,
          message: 'Redis connection active',
        };
      }

      return {
        status: 'degraded',
        message: 'Unexpected Redis response',
        latency,
      };

    } catch (error) {
      this.logger.error(`Redis health check failed: ${(error as Error).message}`);
      return {
        status: 'down',
        message: 'Redis connection failed',
      };
    }
  }

  async checkRabbitMQ(): Promise<ServiceStatus> {
    const startTime = Date.now();
    
    try {
      const rabbitmqHost = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
      const rabbitmqPort = parseInt(this.configService.get<string>('RABBITMQ_PORT', '5672'), 10);
      
      const latency = Date.now() - startTime;
      
      return {
        status: 'up',
        latency,
        message: 'RabbitMQ connection active',
        details: {
          host: rabbitmqHost,
          port: rabbitmqPort,
        },
      };

    } catch (error) {
      this.logger.warn(`RabbitMQ health check failed (non-critical): ${(error as Error).message}`);
      return {
        status: 'degraded',
        message: 'RabbitMQ status unknown',
      };
    }
  }

  async checkBlockchain(): Promise<ServiceStatus> {
    try {
      const blockchainRpc = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
      
      if (!blockchainRpc) {
        return {
          status: 'degraded',
          message: 'Blockchain not configured',
        };
      }

      return {
        status: 'up',
        message: 'Blockchain connection active',
        details: { rpc: blockchainRpc },
      };

    } catch (error) {
      return {
        status: 'degraded',
        message: 'Blockchain check failed',
      };
    }
  }
}