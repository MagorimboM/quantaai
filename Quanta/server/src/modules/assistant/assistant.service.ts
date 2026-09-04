import { Injectable } from '@nestjs/common';
import { AssistantRepository } from '@/modules/assistant/repository/assistant.repository';
import { SendMessageRequest } from '@/modules/assistant/contracts/chat.requests.contracts';
import { openAi } from '@/core/Ai/openAi';
import fs from 'fs';
import path from 'path';

type  ChatHistoryResponse = {
 id: string;
 userId: string | null;
 companyId: string | null;
 projectId: string | null;
 role: string;
 content: string;
 createdAt: Date;
}[]

type ProjectCompanyPersonalDocumentsResponse = {
 nameOfDocument: string;
 content: string;
 documentType: string;
}[]
@Injectable()
export class AssistantService {
  constructor(
    private readonly assistantRepository: AssistantRepository,
  ) {}

  // dev only — remove before production
  async testingInfo() {
    return this.assistantRepository.getTestingInfo();
  }

  /*  RAG FLOW:

    USER ASKS QUESTION
    SAVE TO DATABASE
    EMBED USER QUESTION
    SEARCH DATABASE FOR RELEVANT INFORMATION
    GET THE CHUNKS OF THAT RELEVANT INFORMATION
    GRAB THE PAST 20 CONVERSATIONS
    PLUG THEM INTO THE PROMPT TOGETHER WITH THE CHUNKS GOTTEN FROM VECTOR TABLE
    GET LLM RESPONSE
    SAVE LLM RESPONSE TO DATABASE
    SEND LLM RESPONSE TO USER.
    */

  async chat(userId: string, request: SendMessageRequest) {
    // USER ASKS QUESTION
    await this.assistantRepository.saveMessage({
      message: request.userMessage,
      userId: userId,
      projectId: request.projectId,
      companyId: request.companyId,
      role: request.role,
    });
    // last 15 messages reversed to chronological order for the prompt
    const chatHistory: ChatHistoryResponse = await this.assistantRepository.getChatHistory({
      projectId: request.projectId,
      userId: userId,
    });

    // pull all documents scoped to this user/company/project
    const documents:ProjectCompanyPersonalDocumentsResponse = await this.assistantRepository.getProjectCompanyPersonalDocuments({
      projectId: request.projectId,
      companyId: request.companyId,
      userId: userId,
    });

    // read the system prompt template from disk
    const prompt = fs.readFileSync(
      path.resolve(__dirname, 'ai/systemPrompts/quantaAi.md'),
      'utf-8',
    );

    // bucket documents by type before injecting into prompt
    let userDocument: string = '';
    let companyDocument: string = '';
    let projectDocument: string = '';

    for (const document of documents) {
      if (document.documentType === 'userDocument') {
        userDocument += document.content;
      }
      if (document.documentType === 'companyDocument') {
        companyDocument += document.content;
      }
      if (document.documentType === 'projectDocument') {
        projectDocument += document.content;
      }
    }

    // inject documents into the prompt placeholders
    const filledPrompt = prompt
      .replace('{personalDocuments}', userDocument)
      .replace('{companyDocuments}', companyDocument)
      .replace('{projectDocuments}', projectDocument);

    // system prompt + full history + current message sent to OpenAI
    const response = await openAi.responses.create({
      model: 'gpt-5.5',
      input: [
        {
          role: 'system',
          content: filledPrompt,
        },
        ...chatHistory.map((eachMessage) => ({
          role: eachMessage.role as 'user' | 'assistant' | 'system',
          content: eachMessage.content,
        })),
        {
          role: 'user',
          content: request.userMessage,
        },
      ],
    });

    // persist the AI response
    const savedLLMResponse = await this.assistantRepository.saveMessage({
      message: response.output_text,
      projectId: request.projectId,
      companyId: request.companyId,
      role: 'assistant',
      userId: userId,
    });

    return {
      role: 'assistant',
      content: response.output_text,
      savedAiMessage: savedLLMResponse,
    };
  }

  // returns chat history for a project ordered oldest to newest
  async getChatHistory(projectId: string, userId: string) {
    return await this.assistantRepository.getChatHistory({ projectId, userId });
  }
}