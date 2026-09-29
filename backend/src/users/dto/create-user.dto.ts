import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsIn,
} from 'class-validator';
import type { Role } from '../../auth/interfaces/jwt-payload.interface.js';

export const PERFIS_PERMITIDOS: readonly Role[] = ['COMUM', 'TECNICO', 'ADMIN'];

export class CreateUserDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  @MaxLength(100)
  nome!: string;

  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(150)
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  senha!: string;

  @IsIn(PERFIS_PERMITIDOS, {
    message: 'Perfil inválido. Use COMUM, TECNICO ou ADMIN.',
  })
  perfil!: Role;
}
