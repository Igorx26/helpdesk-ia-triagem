import { Body, Controller, Get, Post, Delete, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsuarioSafeDto } from './dto/usuario-safe.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN', 'TECNICO')
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UsuarioSafeDto> {
    return this.usersService.create(dto);
  }

  @Roles('ADMIN', 'TECNICO')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search: string = '',
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return this.usersService.findAll(isNaN(pageNum) ? 1 : pageNum, isNaN(limitNum) ? 10 : limitNum, search);
  }

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayload): Promise<UsuarioSafeDto> {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UsuarioSafeDto> {
    return this.usersService.update(user.sub, dto, user.perfil);
  }

  @Roles('ADMIN', 'TECNICO')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UsuarioSafeDto> {
    return this.usersService.update(id, dto, user.perfil);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
