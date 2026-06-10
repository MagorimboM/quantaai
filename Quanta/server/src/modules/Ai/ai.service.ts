import { Injectable } from '@nestjs/common';
import { AiRepository } from '@/modules/Ai/repository/ai.repository';
import { AiLayer } from '@/modules/Ai/ai/ai.layer';
import { ChatDto } from '@/modules/Ai/dto/dto';
import { openAi } from '@/core/Ai/openAi';
import fs from 'fs';
import path from 'path';

// TODO! :: Messages are not being loaded or saved in the database
// TODO! :: Open AI takes time to respond

// orchestrates the full RAG pipeline for the AI chat feature
// reads documents from postgres, builds the system prompt,
// calls OpenAI and persists both the user message and AI response
@Injectable()
export class AiService {
  constructor(
    private readonly repository: AiRepository,
    private readonly ai: AiLayer,
  ) {}

  // dev only — remove before production
  async testingInfo() {
    return this.repository.getTestingInfo();
  }

  async chat(userId: string, dto: ChatDto) {
    // persist the user message before doing anything else
    await this.repository.saveMessage({
      message: dto.userMessage,
      projectId: dto.projectId,
      companyId: dto.companyId,
      role: dto.role,
    });

    // last 15 messages reversed to chronological order for the prompt
    const chatHistory: any[] = await this.repository.getChatHistory({
      projectId: dto.projectId,
      userId: userId,
    });

    // pull all documents scoped to this user/company/project
    const documents = await this.repository.getProjectCompanyPersonalDocuments({
      projectId: dto.projectId,
      companyId: dto.companyId,
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
          role: eachMessage.role,
          content: eachMessage.content,
        })),
        {
          role: 'user',
          content: dto.userMessage,
        },
      ],
    });

    // persist the AI response
    const savedLLMResponse = await this.repository.saveMessage({
      message: response.output_text,
      projectId: dto.projectId,
      companyId: dto.companyId,
      role: 'ai',
    });

    return {
      role: 'ai',
      content: response.output_text,
      savedAiMessage: savedLLMResponse,
    };
  }

  // returns chat history for a project ordered oldest to newest
  async getChatHistory(projectId: string, userId: string) {
    return await this.repository.getChatHistory({ projectId, userId });
  }
}
