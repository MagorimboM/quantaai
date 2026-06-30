import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { openAi } from '@/core/Ai/openAi';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LLMService {
  constructor() {}

  private readonly quantaAiPromptTemplate: string = fs.readFileSync(
    path.join(__dirname, 'systemPrompts/quantaAi.md'),
    'utf-8',
  );

  buildSystemPrompt(
    companyName: string,
    projectName: string | null,
    projectStage: string | null,
    projectType: string | null,
    stageName: string | null,
    policyChunks: string,
  ): string {
    
    return this.quantaAiPromptTemplate
      .replace('{companyName}', companyName)
      .replace('{projectName}', projectName ?? 'No project selected')
      .replace('{projectStage}', projectStage ?? '')
      .replace('{projectType}', projectType ?? '')
      .replace('{stageName}', stageName ?? 'Current Stage')
      .replace('{policyChunks}', policyChunks);
  }

  async embedQuestion(question: string): Promise<string> {
    const embeddingResponse = await openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });

    return `[${embeddingResponse.data[0].embedding.toString()}]`;
  }

  async generateResponse({
    message,
    chatHistory,
    systemPrompt,
  }: {
    message: { role: string; content: string };
    chatHistory: { role: string; content: string }[];
    systemPrompt: string;
  }): Promise<string> {
    try {
      const response = await openAi.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...chatHistory.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          {
            role: message.role as 'user' | 'assistant',
            content: message.content,
          },
        ],
      });

      return response.choices[0].message.content ?? '';
    } catch (error) {
      throw new InternalServerErrorException('Cannot talk to the assistant');
    }
  }
}
