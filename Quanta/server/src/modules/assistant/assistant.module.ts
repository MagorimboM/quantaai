import { Module } from '@nestjs/common';
import { AssistantController } from '@/modules/assistant/assistant.controller';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { AssistantRepository } from '@/modules/assistant/repository/assistant.repository';
import { LLMService } from '@/modules/assistant/ai/llm.service';

@Module({
  controllers: [AssistantController],
  providers: [AssistantService, AssistantRepository, LLMService],
})
export class AssistantModule {}; 