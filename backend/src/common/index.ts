/**
 * Common Module
 * 
 * Re-exports all common utilities, guards, interceptors, pipes, and filters.
 * This allows feature modules to import from a single source.
 */

// Filters
export * from './filters/all-exceptions.filter';
export * from './filters/exception.filter';

// Pipes
export * from './pipes/validation.pipe';

// Guards
export * from './guards/jwt-auth.guard';
export * from './guards/mfa.guard';
export * from './guards/roles.guard';
export * from './guards/throttler.guard';

// Interceptors
export * from './interceptors/logging.interceptor';

// Decorators
export * from './decorators/current-user.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/custom-validators';

/**
 * Common module barrel export
 * 
 * Usage:
 * import { JwtAuthGuard, RolesGuard, ValidationPipe } from '@common';
 */