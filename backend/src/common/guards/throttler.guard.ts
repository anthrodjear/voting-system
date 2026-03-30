import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard as NestThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {
  protected throttlers: ThrottlerOptions[] = [];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userType = (request.user as any)?.role || 'anonymous';

    // Get the route being accessed
    const path = request.route?.path || request.path;

    // Custom limits per endpoint type
    if (path.includes('/auth/login')) {
      // Auth login: 10 attempts per minute
      this.throttlers = [{
        name: 'login',
        ttl: 60000,
        limit: 10,
      }];
    } else if (path.includes('/votes/cast')) {
      // Vote cast: 1 per minute
      this.throttlers = [{
        name: 'vote',
        ttl: 60000,
        limit: 1,
      }];
    } else if (path.includes('/batches/heartbeat')) {
      // Batch heartbeat: 10 per 10 seconds
      this.throttlers = [{
        name: 'heartbeat',
        ttl: 10000,
        limit: 10,
      }];
    } else {
      // Default limits based on role
      const limits: Record<string, number> = {
        voter: 100,
        ro: 500,
        admin: 1000,
        super_admin: 1000,
        anonymous: 10,
      };
      this.throttlers = [{
        name: 'default',
        ttl: 60000,
        limit: limits[userType] || 10,
      }];
    }

    return super.canActivate(context);
  }
}
