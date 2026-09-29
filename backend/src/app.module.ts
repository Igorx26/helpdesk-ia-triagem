import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AiModule } from './ai/ai.module.js';
import { TicketsModule } from './tickets/tickets.module.js';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate Limiting global definido no módulo, restrito apenas a rotas específicas (@UseGuards)
    // Conforme AGENTS.md, limite de 5 requisições por hora (3600000ms) para evitar DDoS na API de LLM.
    ThrottlerModule.forRoot([{ ttl: 3600000, limit: 5 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    AiModule,
    TicketsModule,
  ],
})
export class AppModule {}
