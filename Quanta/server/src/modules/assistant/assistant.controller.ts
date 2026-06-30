import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AssistantService } from '@/modules/assistant/assistant.service';
import {
  SendMessageRequest,
  GetChatHistoryRequest,
} from '@/modules/assistant/contracts/chat.requests';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  // hardcoded for dev — swap with Auth0 JWT (req.user.sub) when auth is wired up
  private readonly DEV_USER_ID = 'seed-user-001';

  // returns seed user, company and project ids — useful for testing endpoints
  @Get()
  async testingInfo() {
    return this.assistantService.testingInfo();
  }
  // sends user message through the full RAG pipeline and returns the AI response
  // userId is hardcoded for now — will come from Auth0 token
  @Post('chat')
  async chat(@Body() request: SendMessageRequest) {
    return this.assistantService.chat(this.DEV_USER_ID, request);
  }
  // returns chat history for a specific project and user ordered oldest to newest
  @Get('chatHistory/:projectId/:userId')
  async getChatHistory(@Param() request: GetChatHistoryRequest) {
    return await this.assistantService.getChatHistory(request.projectId, request.projectId);
  }
}
