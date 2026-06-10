import { Module } from '@nestjs/common';
import { AiController } from '@/modules/Ai/ai.controller';
import { AiService } from '@/modules/Ai/ai.service';
import { AiRepository } from '@/modules/Ai/repository/ai.repository';
import { AiLayer } from '@/modules/Ai/ai/ai.layer';

// AI Module
// Bundles the controller, service, repository and AI layer for the chat feature.
// AiController  — handles HTTP routes
// AiService     — orchestrates the RAG pipeline
// AiRepository  — reads and writes to the database
// AiLayer       — handles OpenAI calls and prompt building
@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository, AiLayer],
})
export class AiModule {}; 