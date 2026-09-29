import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { PERFIS_PERMITIDOS } from './create-user.dto.js';
import type { Role } from '../../auth/interfaces/jwt-payload.interface.js';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  @IsOptional()
  senha?: string;

  @IsString()
  @IsIn(PERFIS_PERMITIDOS, {
    message: 'Perfil inválido. Use COMUM, TECNICO ou ADMIN.',
  })
  @IsOptional()
  perfil?: Role;
}
