import type { Role } from '../interfaces/jwt-payload.interface.js';

export class LoginResponseDto {
  access_token!: string;
  usuario!: {
    id: string;
    nome: string;
    email: string;
    perfil: Role | string;
  };
}
