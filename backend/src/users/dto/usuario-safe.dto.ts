import { Usuario } from '@prisma/client';

/**
 * Safe user object — never exposes senha_hash (as required by agent.md rule #3)
 */
export interface UsuarioSafeDto {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  criado_em: Date;
}

export function toUsuarioSafe(usuario: Usuario): UsuarioSafeDto {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    criado_em: usuario.criado_em,
  };
}
