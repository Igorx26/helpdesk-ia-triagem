import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TicketsService } from './tickets.service.js';
import { TicketsController } from './tickets.controller.js';
import { AiModule } from '../ai/ai.module.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
