import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsNotEmpty({ message: 'O título do chamado é obrigatório.' })
  @IsString()
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres.' })
  titulo!: string;

  @IsNotEmpty({ message: 'A descriação do chamado é obrigatória.' })
  @IsString()
  @MinLength(10, { message: 'A descriação deve ter pelo menos 10 caracteres.' })
  descricao!: string;
}
