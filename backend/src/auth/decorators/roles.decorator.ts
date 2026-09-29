import { SetMetadata } from '@nestjs/common';
import type { Role } from '../interfaces/jwt-payload.interface.js';

export const ROLES_KEY = 'roles';

/**
 * Decorator que restringe acesso baseado nos perfis de usuário.
 * Utilizado em conjunto com o RolesGuard.
 * @example @Roles('TECNICO', 'ADMIN')
 */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
