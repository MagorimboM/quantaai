import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AiService } from '@/modules/Ai/ai.service';
import { ChatDto, GetChatHistory } from '@/modules/Ai/dto/dto';

// TODO! Don't forget to remove the testInfo () and controller before going production
// TODO! Don't forget to remove dev use id before going to production
// TODO! Rename the folder from Ai to something else. Ai has become a layer part of he calculations etc. 


// handles all incoming HTTP requests for the AI chat feature
// routes are prefixed with /ai
// delegates all business logic to AiService — no logic lives here
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // hardcoded for dev — swap with Auth0 JWT (req.user.sub) when auth is wired up
  private readonly DEV_USER_ID = 'seed-user-001';

  // returns seed user, company and project ids — useful for testing endpoints
  @Get()
  async testingInfo() {
    return this.aiService.testingInfo();
  }

  // sends user message through the full RAG pipeline and returns the AI response
  // userId is hardcoded for now — will come from Auth0 token
  @Post('chat')
  async chatWithAssistant(@Body() dto: ChatDto) {
    return this.aiService.chat(this.DEV_USER_ID, dto);
  }

  // returns chat history for a specific project and user ordered oldest to newest
  @Get('chatHistory/:projectId/:userId')
  async getChatHistory(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return await this.aiService.getChatHistory(projectId, userId);
  }
}