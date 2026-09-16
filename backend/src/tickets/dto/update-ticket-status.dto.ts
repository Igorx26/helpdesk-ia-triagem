import { IsIn, IsNotEmpty } from 'class-validator';

export const STATUS_PERMITIDOS = [
  'NOVO',
  'EM_ATENDIMENTO',
  'AGUARDANDO_USUARIO',
  'ESCALONADO',
  'RESOLVIDO',
] as const;

export type StatusChamado = (typeof STATUS_PERMITIDOS)[number];

export class UpdateTicketStatusDto {
  @IsNotEmpty({ message: 'O novo status é obrigatório.' })
  @IsIn(STATUS_PERMITIDOS, {
    message: `Status inválido. Valores permitidos: ${STATUS_PERMITIDOS.join(', ')}`,
  })
  status!: StatusChamado;
}
