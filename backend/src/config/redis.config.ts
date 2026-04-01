import { RedisOptions } from 'ioredis';

/**
 * Resolves Redis connection parameters from environment variables.
 * Supports both individual REDIS_* vars and REDIS_URL connection string.
 */
function resolveRedisParams(): {
  host: string;
  port: number;
  password?: string;
  db: number;
} {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    try {
      // WHATWG URL API (fixes DEP0169)
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname || 'localhost',
        port: parseInt(parsed.port, 10) || 6379,
        password: parsed.password || undefined,
        db: parseInt(parsed.pathname.slice(1) || '0', 10),
      };
    } catch {
      throw new Error(
        `Invalid REDIS_URL format: "${redisUrl}".\n` +
          `Expected: redis://[:password]@host:port[/db]`,
      );
    }
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };
}

/**
 * Builds Redis connection options from environment variables.
 *
 * Use with:
 *   RedisModule.forRootAsync({ useFactory: () => buildRedisConfig() })
 *
 * Or instantiate ioredis directly with the returned options.
 */
export function buildRedisConfig(): RedisOptions {
  const conn = resolveRedisParams();
  const nodeEnv = process.env.NODE_ENV || 'development';

  // ── Connection pool / timeout settings ───────────────────────────
  const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10);
  const commandTimeout = parseInt(process.env.REDIS_COMMAND_TIMEOUT || '5000', 10);
  const maxRetriesPerRequest = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10);

  // ── Reconnect strategy with exponential backoff ──────────────────
  const maxReconnectAttempts = parseInt(process.env.REDIS_MAX_RECONNECT || '20', 10);

  return {
    ...conn,

    // Connection timeouts
    connectTimeout,
    commandTimeout,
    enableReadyCheck: true,

    // Retry strategy — exponential backoff capped at 3 seconds
    maxRetriesPerRequest,
    retryStrategy(times: number) {
      if (times > maxReconnectAttempts) {
        // Stop reconnecting after max attempts
        return null;
      }
      // Exponential backoff: 100ms, 200ms, 400ms, ... capped at 3000ms
      const delay = Math.min(times * 100, 3000);
      return delay;
    },

    // Reconnect on specific errors
    reconnectOnError(err) {
      const targetErrors = ['READONLY', 'LOADING', 'CLUSTERDOWN'];
      if (targetErrors.some((e) => err.message.includes(e))) {
        return true; // Reconnect
      }
      return false; // Don't reconnect
    },

    // TLS in production
    ...(process.env.REDIS_TLS === 'true' || nodeEnv === 'production'
      ? {
          tls: {
            rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
          },
        }
      : {}),

    // Friendly connection name for Redis monitoring
    connectionName: `voting-system-${nodeEnv}`,
    // Auto-resubscribe on reconnect
    autoResubscribe: true,
    // Auto-resend unfulfilled commands on reconnect
    autoResendUnfulfilledCommands: true,
  };
}
