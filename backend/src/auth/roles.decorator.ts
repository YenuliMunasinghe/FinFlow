import { SetMetadata } from '@nestjs/common';

export enum Role {
  ADMIN = 'ADMIN',
  PRESIDENT = 'PRESIDENT',
  TREASURER = 'TREASURER',
  COMMITTEE_MEMBER = 'COMMITTEE_MEMBER',
}

export const ROLES_KEY = 'roles';

/**
 * Custom @Roles(...) decorator to attach allowed user roles to NestJS route handlers.
 * Example: @Roles(Role.ADMIN, Role.PRESIDENT)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
