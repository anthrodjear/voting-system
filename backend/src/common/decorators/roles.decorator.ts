import { SetMetadata } from '@nestjs/common';

export type UserRole = 'voter' | 'ro' | 'admin' | 'super_admin' | 'observer';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
