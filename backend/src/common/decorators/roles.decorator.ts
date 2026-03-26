/**
 * Roles Decorator
 * Marks endpoints that require specific roles
 */

import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export default Roles;
