import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Handles all OpenAI operations for the AI module.
// No database operations live here — only calls to the OpenAI API.
// All Prisma operations are handled by AiRepository.
@Injectable()
export class AiLayer {
  private openai: OpenAI;

  // Reads the system prompt from the markdown file once on startup.
  // The markdown file is the single source of truth for the AI's identity,
  // roles and response format. Placeholders are replaced dynamically per request.
  private readonly quantaAiPromptTemplate: string;
  private readonly routerAiPromptTemplate: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });

    // Load the system prompt template from the markdown file.
    // Using a markdown file keeps the prompt clean and easy to edit
    // without touching the TypeScript code.
    this.quantaAiPromptTemplate = fs.readFileSync(
      path.join(__dirname, 'systemPrompts/quantaAi.md'),
      'utf-8',
    );

    this.routerAiPromptTemplate = fs.readFileSync(
      path.join(__dirname, 'systemPrompts/router.md'),
      'utf-8',
    );
  }

  // Builds the system prompt by replacing all placeholder variables
  // in the markdown template with the actual values for this request.
  // Policy chunks are injected at the bottom silently — the AI uses them
  // as its primary source of truth without being explicitly told about them.
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

  // Sends the router prompt to GPT-4o mini to decide if the user is
  // continuing the same conversation topic or asking about something new.
  // Returns "continue" if the topic is the same — skipping the vector search.
  // Returns "new_topic" if the topic changed — triggering a fresh vector search.
  // Uses GPT-4o mini instead of GPT-4o to keep routing costs minimal.
  async routeMessage(
    message: string,
    chatHistory: { role: string; content: string }[],
  ): Promise<{ action: 'continue' | 'new_topic'; reason: string }> {
    // If there is no conversation history this is always a new topic
    // since there is nothing to continue from
    if (!chatHistory.length) {
      return { action: 'new_topic', reason: 'No conversation history' };
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${this.routerAiPromptTemplate}`,
        },
        ...chatHistory.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ],
      response_format: { type: 'json_object' },
    });

    try {
      return JSON.parse(response.choices[0].message.content ?? '{}');
    } catch {
      // If the router response cannot be parsed default to new_topic
      // so a fresh vector search is always attempted as a safe fallback
      return { action: 'new_topic', reason: 'Could not parse router response' };
    }
  }

  // Converts the user question into a 1536 dimension embedding vector
  // using the OpenAI text-embedding-3-small model.
  // The vector is returned as a pgvector compatible string format [0.1,0.2,...]
  // ready to be passed directly into the repository for the similarity search.
  async embedQuestion(question: string): Promise<string> {
    const embeddingResponse = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    });

    // Convert the JS number array to a pgvector compatible string format.
    // pgvector expects [0.1,0.2,0.3,...] not a JSON array object.
    return `[${embeddingResponse.data[0].embedding.toString()}]`;
  }

  // Sends the full context to GPT-4o and returns the AI response.
  // Context includes the system prompt, conversation history and the user question.
  // Policy chunks are already embedded inside the system prompt by buildSystemPrompt.
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
      const response = await this.openai.chat.completions.create({
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
