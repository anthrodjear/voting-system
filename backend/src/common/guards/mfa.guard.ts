import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MfaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If MFA is required but not verified
    if (user?.mfaRequired && !user?.mfaVerified) {
      throw new UnauthorizedException('MFA verification required');
    }

    return true;
  }
}
