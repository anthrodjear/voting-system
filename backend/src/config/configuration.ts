/**
 * Configuration Loader
 * 
 * This function loads all environment variables and provides
 * defaults appropriate for both development and production.
 * 
 * Uses the new URL() constructor instead of deprecated url.parse()
 */

/**
 * Configuration loader function
 * Returns configuration object compatible with NestJS ConfigModule
 */
export const validationConfig = () => ({
  app: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
});

/**
 * Helper function to validate and parse database URL
 * Uses URL class to avoid deprecated url.parse()
 */
export function parseDatabaseUrl(databaseUrl: string): Record<string, string | number> | null {
  if (!databaseUrl) return null;
  
  try {
    // Using URL() constructor - avoids DEP0169 deprecation warning
    const url = new URL(databaseUrl);
    
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
    };
  } catch {
    return null;
  }
}

/**
 * Helper function to validate and parse Redis URL
 * Uses URL class to avoid deprecated url.parse()
 */
export function parseRedisUrl(redisUrl: string): Record<string, string | number> | null {
  if (!redisUrl) return null;
  
  try {
    const url = new URL(redisUrl);
    
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
      password: url.password || '',
      db: parseInt(url.pathname.replace(/^\//, ''), 10) || 0,
    };
  } catch {
    return null;
  }
}