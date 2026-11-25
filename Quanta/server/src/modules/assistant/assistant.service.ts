import { Injectable, NotFoundException } from '@nestjs/common';
import { AssistantRepository } from '@/modules/assistant/assistant.repository';
import { openAi } from '@/core/Ai/openAi';
import { Reranker } from 'flashrank-js';

const SYSTEM_PROMPT =
  'Answer using ONLY the provided excerpts and chat history. If unsure, say you do not know.';

@Injectable()
export class AssistantService {
  private readonly reranker = Reranker.create();

  constructor(private readonly assistantRepository: AssistantRepository) {}

  async chatWithAssistant({
    clerkId,
    companyId,
    projectId,
    userMessage,
  }: {
    clerkId: string;
    companyId: string;
    projectId: string;
    userMessage: string;
  }) {
    return this.assistantRepository.chatWithAssistant({
      projectId,
      companyId,
      clerkId,
      userMessage,
    });
  }

  async getChatHistory({
    projectId,
    companyId,
    clerkId,
  }: {
    projectId: string;
    clerkId: string;
    companyId: string;
  }) {
    return await this.assistantRepository.getChatHistory({
      projectId,
      companyId,
      clerkId,
    });
  }
}
