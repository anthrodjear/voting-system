# Rate Limiter

## Overview

Rate limiting configuration to prevent abuse and manage load.

---

## 1. Rate Limit Configuration

```typescript
// config/rate-limit.config.ts
export const rateLimitConfig = {
  // Global limits
  global: {
    ttl: 60000, // 1 minute
    limit: 1000
  },

  // Authentication endpoints
  auth: {
    login: { ttl: 60000, limit: 10 }, // 10 attempts per minute
    register: { ttl: 3600000, limit: 5 }, // 5 registrations per hour
    mfa: { ttl: 60000, limit: 20 }
  },

  // Voting endpoints
  voting: {
    cast: { ttl: 60000, limit: 1 }, // 1 vote per minute
    ballot: { ttl: 300000, limit: 10 }, // 10 ballot requests per 5 min
    confirm: { ttl: 60000, limit: 10 }
  },

  // Batch endpoints
  batch: {
    join: { ttl: 60000, limit: 5 },
    heartbeat: { ttl: 10000, limit: 10 }
  },

  // Admin endpoints
  admin: {
    approve: { ttl: 60000, limit: 100 },
    report: { ttl: 60000, limit: 50 }
  }
};
```
