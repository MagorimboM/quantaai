import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AssistantService } from '@/modules/assistant/assistant.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator';
import {
  chatHistoryQuerySchema,
  sendMessageSchema,
} from '@/modules/assistant/contracts/assistant.schema';
import type {
  ChatHistoryQuery,
  SendMessageRequest,
} from '@/modules/assistant/contracts/chat.requests.contracts';

// Exposes endpoints for sending assistant chat messages and retrieving chat history under a company scope.
@Controller(':companyId/assistant')
export class AssistantController {
  // Injects the assistant service handling chat and history operations.
  constructor(private readonly assistantService: AssistantService) {}

  // Validates a chat request payload and forwards the message to the assistant service.
  @Post('chat')
  async chat(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) request: SendMessageRequest,
  ) {
    return await this.assistantService.chatWithAssistant({
      clerkId,
      companyId,
      projectId: request.projectId,
      userMessage: request.userMessage,
    });
  }

  // Validates query parameters and returns the chat history for the specified project and company.
  @Get('chatHistory')
  async getChatHistory(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(chatHistoryQuerySchema)) query: ChatHistoryQuery,
  ) {
    return await this.assistantService.getChatHistory({
      clerkId,
      companyId,
      projectId: query.projectId,
    });
  }
}