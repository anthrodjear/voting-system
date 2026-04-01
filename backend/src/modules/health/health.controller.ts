/**
 * Health Check Controller
 * 
 * Provides HTTP endpoints for external monitoring systems.
 * Supports Kubernetes liveness and readiness probes.
 */

import { Controller, Get, Header, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { HealthService, SystemHealth } from './health.service';

@ApiTags('health')
@Controller({
  version: '1',
  path: 'health',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness Probe
   * 
   * Kubernetes uses this to know if the container should be restarted.
   * Simple check - does the process respond?
   * 
   * GET /health/live
   */
  @Get('live')
  @ApiExcludeEndpoint()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  getLiveness() {
    return this.healthService.getLiveness();
  }

  /**
   * Readiness Probe
   * 
   * Kubernetes uses this to know if the container can receive traffic.
   * Checks database, redis, rabbitmq connectivity.
   * 
   * GET /health/ready
   */
  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness probe', 
    description: 'Checks if the application can serve traffic (database, cache, queue available)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application ready to serve traffic',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
        uptime: { type: 'number' },
        timestamp: { type: 'string' },
        version: { type: 'string' },
        services: {
          type: 'object',
          properties: {
            database: { 
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['up', 'down', 'degraded'] },
                latency: { type: 'number' }
              }
            },
            redis: { type: 'object' },
            rabbitmq: { type: 'object' },
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application not ready to serve traffic' 
  })
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  async getReadiness(): Promise<SystemHealth> {
    const health = await this.healthService.checkReadiness();
    
    // Return appropriate status code based on health
    if (health.status === 'unhealthy') {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        message: 'One or more critical services are down',
        services: health.services,
      });
    }
    
    return health;
  }

  /**
   * Main Health Check
   * 
   * Combined liveness + basic readiness check.
   * Used for basic health monitoring.
   * 
   * GET /health
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Combined health check', 
    description: 'Returns basic health status including uptime and version' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Health status', 
    type: Object 
  })
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  getHealth() {
    return {
      success: true,
      data: this.healthService.getLiveness(),
    };
  }
}