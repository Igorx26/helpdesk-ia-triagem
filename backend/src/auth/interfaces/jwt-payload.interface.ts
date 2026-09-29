/**
 * Tipos de perfil suportados no sistema.
 */
export type Role = 'COMUM' | 'TECNICO' | 'ADMIN';

export interface JwtPayload {
  sub: string; // UUID do usuário
  email: string;
  perfil: Role;
  iat?: number;
  exp?: number;
}
