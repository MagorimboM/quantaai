import { Module } from '@nestjs/common';
import { AssistantController } from '@/modules/assistant/assistant.controller';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { AssistantRepository } from '@/modules/assistant/assistant.repository';

@Module({
  controllers: [AssistantController],
  providers: [AssistantService, AssistantRepository],
})
export class AssistantModule {}