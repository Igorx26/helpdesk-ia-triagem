import type { Usuario } from '@prisma/client';
import type { Role } from '../../auth/interfaces/jwt-payload.interface.js';

/**
 * Objeto de usuário seguro - nunca expõe a senha_hash (Regra de segurancga #3)
 */
export class UsuarioSafeDto {
  id!: string;
  nome!: string;
  email!: string;
  perfil!: Role;
  criado_em!: Date;
}

export function toUsuarioSafe(usuario: Usuario): UsuarioSafeDto {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil as Role,
    criado_em: usuario.criado_em,
  };
}
