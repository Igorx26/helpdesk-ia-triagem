export interface JwtPayload {
  sub: string; // UUID do usuário
  email: string;
  perfil: string; // 'COMUM' | 'TECNICO'
  iat?: number;
  exp?: number;
}
