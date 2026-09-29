import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsuarioSafeDto, toUsuarioSafe } from './dto/usuario-safe.dto.js';
import type { Role } from '../auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UsuarioSafeDto> {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const senha_hash = await bcrypt.hash(dto.senha, this.SALT_ROUNDS);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha_hash,
        perfil: dto.perfil,
      },
    });

    return toUsuarioSafe(usuario);
  }

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.UsuarioWhereInput = search
      ? {
          nome: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const [total, usuarios] = await Promise.all([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
    ]);

    return {
      total,
      page,
      limit,
      data: usuarios.map(toUsuarioSafe),
    };
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UsuarioSafeDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return toUsuarioSafe(usuario);
  }

  async update(id: string, dto: UpdateUserDto, currentUserRole: Role): Promise<UsuarioSafeDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (currentUserRole === 'TECNICO' && usuario.perfil !== 'COMUM') {
      throw new ForbiddenException('Técnicos só podem alterar contas de usuários COMUM.');
    }

    if (currentUserRole === 'TECNICO' && dto.perfil && dto.perfil !== 'COMUM') {
      throw new ForbiddenException('Técnicos não podem alterar o perfil para níveis superiores.');
    }

    if (currentUserRole === 'COMUM' && dto.perfil && dto.perfil !== 'COMUM') {
      throw new ForbiddenException('Usuários não podem alterar o próprio perfil de acesso.');
    }

    if (dto.email && dto.email !== usuario.email) {
      const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (existente) throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const dataToUpdate: Prisma.UsuarioUpdateInput = {
      ...(dto.nome && { nome: dto.nome }),
      ...(dto.email && { email: dto.email }),
      ...(dto.perfil && { perfil: dto.perfil }),
    };

    if (dto.senha) {
      dataToUpdate.senha_hash = await bcrypt.hash(dto.senha, this.SALT_ROUNDS);
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
    });

    return toUsuarioSafe(updated);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.prisma.usuario.delete({ where: { id } });
  }
}
