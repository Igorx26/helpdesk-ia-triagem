import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UsuarioSafeDto, toUsuarioSafe } from './dto/usuario-safe.dto.js';

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
}
