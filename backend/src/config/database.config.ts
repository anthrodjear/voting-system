import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Parses the DATABASE_URL connection string using the WHATWG URL API.
 * Falls back to individual DB_* env vars when DATABASE_URL is absent.
 */
function resolveConnectionParams(): {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
} {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      // WHATWG URL API (replaces deprecated url.parse — fixes DEP0169)
      const parsed = new URL(databaseUrl);
      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port, 10) || 5432,
        username: decodeURIComponent(parsed.username) || 'postgres',
        password: decodeURIComponent(parsed.password) || 'postgres',
        database: parsed.pathname.slice(1) || 'voting_system',
      };
    } catch {
      throw new Error(
        `Invalid DATABASE_URL format: "${databaseUrl}".\n` +
          `Expected: postgresql://user:password@host:port/database`,
      );
    }
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'voting_system',
  };
}

/**
 * Build SSL config for pg driver.
 * Enabled explicitly via DB_SSL=true or implicitly in production.
 */
function resolveSsl(): { rejectUnauthorized: boolean; ca?: string } | false {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const sslEnabled = process.env.DB_SSL === 'true' || nodeEnv === 'production';

  if (!sslEnabled) return false;

  return {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
    ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
  };
}

/**
 * Builds the full TypeORM connection options from environment variables.
 *
 * Connection pooling, retry strategy, SSL, and timeouts are all configurable
 * via env vars. Designed to be used as the factory in TypeOrmModule.forRootAsync.
 */
export function buildDatabaseConfig(): TypeOrmModuleOptions {
  const conn = resolveConnectionParams();
  const nodeEnv = process.env.NODE_ENV || 'development';
  const logging = nodeEnv === 'development';

  // ── Pool sizing ──────────────────────────────────────────────────
  const poolSize = parseInt(process.env.DB_POOL_SIZE || '10', 10);

  // ── Timeouts (milliseconds) ─────────────────────────────────────
  const connectionTimeout = parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10);
  const idleTimeout = parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10);
  const statementTimeout = parseInt(process.env.DB_STATEMENT_TIMEOUT || '30000', 10);
  const queryTimeout = parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10);

  // ── Retry config ─────────────────────────────────────────────────
  const retryAttempts = parseInt(process.env.DB_RETRY_ATTEMPTS || '10', 10);
  const retryDelay = parseInt(process.env.DB_RETRY_DELAY || '3000', 10);

  return {
    type: 'postgres',
    ...conn,

    // Auto-discover entities
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],

    // Schema sync — dev only, NEVER in production
    synchronize: nodeEnv === 'development',

    // Logging
    logging,
    logger: logging ? 'advanced-console' : 'file',

    // ── Connection pool (passed to pg driver via `extra`) ───────────
    extra: {
      max: poolSize,
      connectionTimeoutMillis: connectionTimeout,
      idleTimeoutMillis: idleTimeout,
      statement_timeout: statementTimeout,
      query_timeout: queryTimeout,
      // TCP keepalive to prevent idle connection drops
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    },

    // ── SSL ─────────────────────────────────────────────────────────
    ssl: resolveSsl(),

    // ── Retry strategy ──────────────────────────────────────────────
    retryAttempts,
    retryDelay,

    // ── Migrations ──────────────────────────────────────────────────
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
  };
}
