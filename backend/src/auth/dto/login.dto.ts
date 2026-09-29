import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha!: string;
}
