import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  senha?: string;

  @IsString()
  @IsIn(['COMUM', 'TECNICO', 'ADMIN'])
  @IsOptional()
  perfil?: 'COMUM' | 'TECNICO' | 'ADMIN';
}
