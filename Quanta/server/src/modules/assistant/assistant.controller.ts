import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { SendMessageRequest } from '@/modules/assistant/contracts/chat.requests.contracts';
import { ClerkUserId } from '@/auth/services/currentUser.guard';

// Every route runs behind the global ClerkAuthGuard, so @ClerkUserId() is always the
// verified caller. The user is never read from the URL or the body.
@Controller(':companyId/assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  // Ask the assistant a question. Returns its reply.
  @Post('chat')
  async chat(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body() request: SendMessageRequest,
  ) {
    return await this.assistantService.chat({
      clerkId,
      companyId,
      projectId: request.projectId,
      userMessage: request.userMessage,
    });
  }
  // The caller's latest messages for this company (and project, if given), oldest first.
  // projectId is optional, so it is a query parameter: ?projectId=...
  @Get('chatHistory')
  async getChatHistory(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return await this.assistantService.getChatHistory({
      clerkId,
      companyId,
      projectId,
    });
  }
}