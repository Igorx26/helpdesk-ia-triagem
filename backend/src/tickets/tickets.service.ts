import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto.js';
import { CreateInteractionDto } from './dto/create-interaction.dto.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Abre um novo chamado.
   * Aciona a IA obrigatoriamente para definir categoria, prioridade e risco_seguranca.
   */
  async create(user: JwtPayload, dto: CreateTicketDto) {
    this.logger.log(
      `Processando abertura de chamado pelo usuÃ¡rio ${user.email}: "${dto.titulo}"`,
    );

    // 1. Processamento obrigatÃ³rio de IA
    const analiseIa = await this.aiService.analisarChamado(
      dto.titulo,
      dto.descricao,
    );

    // 2. PersistÃªncia no banco via Prisma
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
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    // 3. Registro de auditoria inicial
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

  /**
   * Lista os chamados de acordo com o perfil:
   * - TECNICO: Todos os chamados
   * - COMUM: Apenas os chamados abertos pelo prÃ³prio usuÃ¡rio
   */
  async findAll(user: JwtPayload) {
    const isTecnico = ['TECNICO', 'ADMIN'].includes(user.perfil);

    return this.prisma.chamado.findMany({
      where: isTecnico ? {} : { id_solicitante: user.sub },
      orderBy: [
        // Chamados com risco de seguranÃ§a e prioridade crÃ­tica aparecem primeiro
        { risco_seguranca: 'desc' },
        { criado_em: 'desc' },
      ],
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });
  }

  /**
   * Busca um chamado por ID respeitando permissÃµes de visualizaÃ§Ã£o
   */
  async findOne(id: string, user: JwtPayload) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
      include: {
        solicitante: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
        interacoes: {
          orderBy: { criado_em: 'asc' },
          include: {
            autor: {
              select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
              },
            },
          },
        },
        logs_auditoria: {
          orderBy: { criado_em: 'asc' },
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
              },
            },
          },
        },
      },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado nÃ£o encontrado.');
    }

    if (!['TECNICO', 'ADMIN'].includes(user.perfil) && chamado.id_solicitante !== user.sub) {
      throw new ForbiddenException(
        'VocÃª nÃ£o tem permissÃ£o para visualizar este chamado.',
      );
    }

    return chamado;
  }

  /**
   * Altera o status do chamado (exclusivo para TÃ©cnicos).
   * Registra log de auditoria imutÃ¡vel com os estados 'de' e 'para'.
   */
  async updateStatus(id: string, user: JwtPayload, dto: UpdateTicketStatusDto) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado nÃ£o encontrado.');
    }

    const statusAnterior = chamado.status;
    const novoStatus = dto.status;

    if (statusAnterior === novoStatus) {
      return chamado;
    }

    // Atualiza status e registra auditoria em transaÃ§Ã£o
    const [chamadoAtualizado] = await this.prisma.$transaction([
      this.prisma.chamado.update({
        where: { id },
        data: { status: novoStatus },
        include: {
          solicitante: {
            select: {
              id: true,
              nome: true,
              email: true,
              perfil: true,
            },
          },
        },
      }),
      this.prisma.logsAuditoria.create({
        data: {
          id_chamado: id,
          id_usuario: user.sub,
          acao: 'MudanÃ§a de Status',
          detalhes: {
            de: statusAnterior,
            para: novoStatus,
          },
        },
      }),
    ]);

    this.logger.log(
      `Status do chamado ${id} alterado de "${statusAnterior}" para "${novoStatus}" pelo tÃ©cnico ${user.email}`,
    );

    return chamadoAtualizado;
  }

  /**
   * Adiciona uma mensagem/interaÃ§Ã£o no chamado
   */
  async addInteraction(
    id: string,
    user: JwtPayload,
    dto: CreateInteractionDto,
  ) {
    const chamado = await this.prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamado) {
      throw new NotFoundException('Chamado nÃ£o encontrado.');
    }

    if (chamado.status === 'RESOLVIDO') {
      throw new BadRequestException(
        'Este chamado jÃ¡ foi resolvido e estÃ¡ encerrado. NÃ£o Ã© permitido adicionar novas mensagens.',
      );
    }

    if (!['TECNICO', 'ADMIN'].includes(user.perfil) && chamado.id_solicitante !== user.sub) {
      throw new ForbiddenException(
        'VocÃª nÃ£o tem permissÃ£o para interagir neste chamado.',
      );
    }

    const interacao = await this.prisma.interacao.create({
      data: {
        id_chamado: id,
        id_autor: user.sub,
        mensagem: dto.mensagem,
      },
      include: {
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            perfil: true,
          },
        },
      },
    });

    return interacao;
  }
}
