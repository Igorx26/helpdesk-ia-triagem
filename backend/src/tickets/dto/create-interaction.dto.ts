import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateInteractionDto {
  @IsNotEmpty({ message: 'A mensagem não pode estar vazia.' })
  @IsString()
  @MinLength(2, { message: 'A mensagem deve ter pelo menos 2 caracteres.' })
  mensagem!: string;
}
