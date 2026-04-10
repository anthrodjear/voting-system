/**
 * Application Configuration Module
 * 
 * Centralized configuration for voting system.
 * Provides type-safe access to all environment variables.
 */

import { plainToInstance, Type } from 'class-transformer';
import { ValidateNested, IsString, IsNumber, IsBoolean, IsOptional, validateSync } from 'class-validator';

/**
 * Database configuration
 */
class DatabaseConfig {
  @IsString()
  @IsOptional()
  host: string = 'localhost';

  @IsNumber()
  @IsOptional()
  port: number = 5432;

  @IsString()
  @IsOptional()
  username: string = 'postgres';

  @IsString()
  @IsOptional()
  password: string = process.env.DB_PASSWORD || '';

  @IsString()
  @IsOptional()
  database: string = 'voting_system';
}

/**
 * Root configuration object
 */
export class AppConfig {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  @IsOptional()
  database: DatabaseConfig = new DatabaseConfig();
}

/**
 * Validate configuration and return validated instance
 */
export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(AppConfig, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
  
  return validatedConfig;
}