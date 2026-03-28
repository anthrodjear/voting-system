# Authentication Middleware

## Overview

This document details the authentication middleware for voters, ROs, and admins.

---

## 1. JWT Authentication

```typescript
// middleware/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    const can = await super.canActivate(context);
    if (!can) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if account is active
    if (user.isActive === false) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return true;
  }
}
```

---

## 2. Role-Based Access Control

```typescript
// middleware/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Decorator
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

---

## 3. MFA Guard

```typescript
// middleware/mfa.guard.ts
@Injectable()
export class MfaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if MFA is required
    if (user.mfaRequired && !user.mfaVerified) {
      throw new UnauthorizedException('MFA verification required');
    }

    return true;
  }
}
```

---

## 4. Throttler

```typescript
// middleware/rate-limiter.guard.ts
@Injectable()
export class ThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Custom rate limiting
    const request = context.switchToHttp().getRequest();
    const userType = request.user?.role || 'anonymous';

    // Different limits per role
    const limits: Record<string, number> = {
      voter: 100,
      ro: 500,
      admin: 1000,
      anonymous: 10
    };

    this.ttl = 60000; // 1 minute
    this.limit = limits[userType] || 10;

    return super.canActivate(context);
  }
}
```
