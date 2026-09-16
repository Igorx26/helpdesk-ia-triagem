import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { CreateInteractionDto } from './dto/create-interaction.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * POST /api/v1/tickets - Abre um novo chamado (Qualquer usuário autenticado)
   */
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(user, dto);
  }

  /**
   * GET /api/v1/tickets - Lista chamados (Comum vê seus, Técnico vê todos)
   */
  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.ticketsService.findAll(user);
  }

  /**
   * GET /api/v1/tickets/:id - Detalhes do chamado com histórico e auditoria
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ticketsService.findOne(id, user);
  }

  /**
   * PATCH /api/v1/tickets/:id/status - Altera status do chamado (Apenas TECNICO)
   */
  @Roles('TECNICO')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(id, user, dto);
  }

  /**
   * POST /api/v1/tickets/:id/interactions - Adiciona comentário/interação
   */
  @Post(':id/interactions')
  async addInteraction(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInteractionDto,
  ) {
    return this.ticketsService.addInteraction(id, user, dto);
  }
}
