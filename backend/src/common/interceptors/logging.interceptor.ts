import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // Skip logging for health checks
    if (url === '/api/health' || url === '/api/docs') {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`,
          );
        },
        error: (error: Error) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ERROR - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
