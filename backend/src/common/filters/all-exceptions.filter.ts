/**
 * Global Exception Filter
 * 
 * Catches all unhandled exceptions and formats them appropriately.
 * Provides consistent error responses with optional stack traces in development.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface ErrorResponseData {
  success: boolean;
  error: {
    code: number;
    message: string;
    details?: unknown;
    stack?: string;
  };
  meta: {
    timestamp: string;
    requestId: string;
    path: string;
    method: string;
    version: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction: boolean;

  constructor(isProduction: boolean = true) {
    this.isProduction = isProduction;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const requestId = String(request.headers['x-request-id'] || uuidv4());
    
    const { status, message, code, details } = this.determineErrorDetails(exception);

    const errorData: Record<string, unknown> = {
      code,
      message: Array.isArray(message) ? message.join(', ') : String(message),
    };
    
    if (details) {
      errorData.details = details;
    }
    
    if (!this.isProduction && exception instanceof Error && exception.stack) {
      errorData.stack = exception.stack;
    }

    const errorResponse: ErrorResponseData = {
      success: false,
      error: errorData as ErrorResponseData['error'],
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        path: request.url,
        method: request.method,
        version: '1.0.0',
      },
    };

    this.logError(exception, requestId, status);

    response.set({
      'X-Request-ID': requestId,
      'X-Error-Code': code.toString(),
    });

    response.status(status).json(errorResponse);
  }

  private determineErrorDetails(exception: unknown): {
    status: number;
    message: string | string[];
    code: number;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      let message: string | string[];
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(resp.message) 
          ? resp.message as string[] 
          : (resp.message as string) || exception.message;
      } else {
        message = exceptionResponse as string;
      }

      return {
        status: httpStatus,
        message,
        code: this.mapHttpCodeToErrorCode(httpStatus),
      };
    }

    if (exception instanceof TypeError || exception instanceof ReferenceError) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An internal error occurred',
        code: 5000,
        details: this.isProduction ? undefined : exception.message,
      };
    }

    if (exception instanceof Error) {
      const errorMessage = exception.message.toLowerCase();
      
      if (errorMessage.includes('connect') || errorMessage.includes('econnrefused')) {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database service is temporarily unavailable',
          code: 5030,
          details: this.isProduction ? undefined : exception.message,
        };
      }

      if (errorMessage.includes('redis') || errorMessage.includes('etimedout')) {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Cache service is temporarily unavailable',
          code: 5031,
        };
      }

      if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Authentication required or access denied',
          code: 4010,
        };
      }

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.isProduction 
          ? 'An unexpected error occurred' 
          : exception.message,
        code: 5000,
        details: this.isProduction ? undefined : exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unknown error occurred',
      code: 5000,
    };
  }

  private mapHttpCodeToErrorCode(httpStatus: number): number {
    switch (httpStatus) {
      case HttpStatus.BAD_REQUEST:
        return 4000;
      case HttpStatus.UNAUTHORIZED:
        return 4010;
      case HttpStatus.FORBIDDEN:
        return 4030;
      case HttpStatus.NOT_FOUND:
        return 4040;
      case HttpStatus.CONFLICT:
        return 4090;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 4220;
      case HttpStatus.TOO_MANY_REQUESTS:
        return 4290;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 5000;
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 5030;
      case HttpStatus.GATEWAY_TIMEOUT:
        return 5040;
      default:
        return httpStatus * 100;
    }
  }

  private logError(
    exception: unknown,
    requestId: string,
    status: number
  ): void {
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Request ${requestId} failed with status ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(
        `Request ${requestId} failed with status ${status}: ${(exception as Error).message}`
      );
    } else {
      this.logger.debug(
        `Request ${requestId} failed with status ${status}: ${(exception as Error).message}`
      );
    }
  }
}