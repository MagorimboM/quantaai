import { Injectable } from '@nestjs/common';
import { AssistantRepository } from '@/modules/assistant/assistant.repository';

// Service layer delegating assistant chat and history operations to AssistantRepository.
@Injectable()
export class AssistantService {
  // Inject AssistantRepository for database and retrieval-augmented generation queries.
  constructor(private readonly assistantRepository: AssistantRepository) {}

  // Send a user message to the assistant and return the persisted reply.
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
    // Delegate chat processing to the repository.
    return this.assistantRepository.chatWithAssistant({
      projectId,
      companyId,
      clerkId,
      userMessage,
    });
  }

  // Fetch recent chat history for the given user, company, and project.
  async getChatHistory({
    projectId,
    companyId,
    clerkId,
  }: {
    projectId: string;
    clerkId: string;
    companyId: string;
  }) {
    // Delegate history lookup to the repository.
    return await this.assistantRepository.getChatHistory({
      projectId,
      companyId,
      clerkId,
    });
  }
}