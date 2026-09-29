import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { CreateInteractionDto } from './dto/create-interaction.dto.js';
import type { JwtPayload, Role } from '../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);
  private readonly perfisPrivilegiados: ReadonlySet<Role> = new Set(['TECNICO', 'ADMIN']);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(user: JwtPayload, dto: CreateTicketDto) {
    this.logger.log(`Processando abertura de chamado pelo usuário ${user.email}: "${dto.titulo}"`);

    const analiseIa = await this.aiService.analisarChamado(dto.titulo, dto.descricao);

    const novoChamado = await this.prisma.chamado.create({
      data: {
        id_solicitante: user.sub,
        titulo: dto.titulo,
        descricao: dto.descricao,
        categoria: analiseIa.categoria,
        prioridade: analiseIa.prioridade,
        risco_seguranca: analiseIa.risco_seguranca,
        status: 'NOVO',
      },
      include: {
        solicitante: {
          select: { id: true, nome: true, email: true, perfil: true },
        },
      },
    });

    await this.prisma.logsAuditoria.create({
      data: {
        id_chamado: novoChamado.id,
        id_usuario: user.sub,
        acao: 'Abertura de Chamado',
        detalhes: {
          status: 'NOVO',
          categoria: analiseIa.categoria,
          prioridade: analiseIa.prioridade,
          risco_seguranca: analiseIa.risco_seguranca,
        },
      },
    });

    return novoChamado;
  }

  async findAll(user: JwtPayload) {
    const isPrivilegiado = this.perfisPrivilegiados.has(user.perfil);

    return this.prisma.chamado.findMany({
      where: isPrivilegiado ? {} : { id_solicitante: user.sub },
      orderBy: [
        { risco_seguranca: 'desc' },
        { criado_em: 'desc' },
      ],
      include: {
        solicitante: {
          select: { id: true, nome: true, email: true, perfil: true },
        },
      },
    });
  }

  async findOne(id: string, user: JwtPayload) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
      include: {
        solicitante: {
          select: { id: true, nome: true, email: true, perfil: true },
        },
        interacoes: {
          orderBy: { criado_em: 'asc' },
          include: {
            autor: { select: { id: true, nome: true, email: true, perfil: true } },
          },
        },
        logs_auditoria: {
          orderBy: { criado_em: 'asc' },
          include: {
            usuario: { select: { id: true, nome: true, email: true, perfil: true } },
          },
        },
      },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    if (!this.perfisPrivilegiados.has(user.perfil) && chamado.id_solicitante !== user.sub) {
      throw new ForbiddenException('Você não tem permissão para visualizar este chamado.');
    }

    return chamado;
  }

  async updateStatus(id: string, user: JwtPayload, dto: UpdateTicketStatusDto) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    const statusAnterior = chamado.status;
    const novoStatus = dto.status;

    if (statusAnterior === novoStatus) {
      return chamado;
    }

    const [chamadoAtualizado] = await this.prisma.$transaction([
      this.prisma.chamado.update({
        where: { id },
        data: { status: novoStatus },
        include: {
          solicitante: {
            select: { id: true, nome: true, email: true, perfil: true },
          },
        },
      }),
      this.prisma.logsAuditoria.create({
        data: {
          id_chamado: id,
          id_usuario: user.sub,
          acao: 'Mudança de Status',
          detalhes: { de: statusAnterior, para: novoStatus },
        },
      }),
    ]);

    this.logger.log(`Status do chamado ${id} alterado de "${statusAnterior}" para "${novoStatus}" pelo usuário ${user.email}`);

    return chamadoAtualizado;
  }

  async addInteraction(id: string, user: JwtPayload, dto: CreateInteractionDto) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado não encontrado.');
    }

    if (chamado.status === 'RESOLVIDO') {
      throw new BadRequestException('Este chamado já foi resolvido e está encerrado. Não é permitido adicionar novas mensagens.');
    }

    if (!this.perfisPrivilegiados.has(user.perfil) && chamado.id_solicitante !== user.sub) {
      throw new ForbiddenException('Você não tem permissão para interagir neste chamado.');
    }

    const interacao = await this.prisma.interacao.create({
      data: {
        id_chamado: id,
        id_autor: user.sub,
        mensagem: dto.mensagem,
      },
      include: {
        autor: {
          select: { id: true, nome: true, email: true, perfil: true },
        },
      },
    });

    return interacao;
  }
}
