import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { openAi } from '@/core/Ai/openAi';
import { Reranker } from 'flashrank-js';
import fs from 'fs';
import path from 'path';

// Represents a single message entry in a conversation history.
export type ChatHistoryItem = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

// Handles retrieval-augmented assistant chat and chat history persistence.
@Injectable()
export class AssistantRepository {
  // Embeds the user query, retrieves and reranks project document chunks, generates an AI reply, and persists messages.
  async chatWithAssistant({
    projectId,
    companyId,
    clerkId,
    userMessage,
  }: {
    projectId: string;
    companyId: string;
    clerkId: string;
    userMessage: string;
  }) {
    // Look up the user by Clerk ID and ensure they exist.
    const user = await prisma.user.findUnique({ where: { clerkId: clerkId } });
    if (user == undefined) {
      throw new NotFoundException(
        'User does not exist, login in again or signup',
      );
    }

    // Fetch a document belonging to the user and specified project.
    const document = await prisma.document.findFirst({
      where: { projectId: projectId, userId: user.id },
    });
    if (document == undefined || document == null) {
      throw new NotFoundException(
        'No documents are uploaded, upload documents so Ai can help you',
      );
    }

    // Generate a vector embedding for the incoming user message.
    const embeddedResult = await openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: userMessage,
      encoding_format: 'float',
    });

    // Ensure the embedding API returned at least one vector entry.
    if (!embeddedResult.data || embeddedResult.data.length == 0) {
      throw new InternalServerErrorException('Failed to embed files');
    }
    // Extract the embedding float array and serialize it as a JSON string for pgvector.
    const embedding = embeddedResult.data[0]?.embedding;

    const embeddingString = JSON.stringify(embedding);

    // Query top 5 closest document chunks by cosine distance using pgvector.
    const relevantChunks = await prisma.$queryRaw<{ chunkText: string }[]>`
  SELECT de."chunkText"
  FROM document_embeddings de
  WHERE de."userId" = ${user.id}
    AND de."documentId" = ${document.id}
  ORDER BY de."embedding" <=> ${embeddingString}::vector ASC
  LIMIT 5
`;

    // Rerank candidate chunks against the user message.
    const reRanker = await Reranker.create();

    // Score and order candidate chunks by relevance to userMessage.
    const ranked = reRanker.rerank({
      query: userMessage,
      documents: relevantChunks.map((eachChunk) => eachChunk.chunkText),
      topN: 5,
    });

    // Filter reranked chunks to keep only those meeting the relevance threshold.
    const mostSimilar = (await ranked).filter((eachChunk) => {
      eachChunk.score >= 0.5;
    });

    // Format filtered chunks into a combined text block.
    const chunkTexts = '';
    const indexNumber = 0;
    for (const eachChunk of mostSimilar) {
      indexNumber;
      chunkTexts +
        `chunkNUmber:${indexNumber}\n
      content : ${eachChunk.document}\n`;
      indexNumber + 1;
    }

    // Persist the user's message in the chat history table.
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: 'user',
        content: userMessage,
        companyId: companyId,
        projectId:projectId
      },
    });

    // Verify user message persistence succeeded before building the prompt.
    if (chatMessage == undefined) {
      throw new InternalServerErrorException('couldn`t save user message');
    }

    // Load the base system prompt template from disk and inject query and retrieved chunks.
    const file = fs.readFileSync(
      path.join(__dirname, '../assistant/ai/systemPrompts', 'quantaAi.md'),
      'utf-8',
    );

    // Substitute placeholders in the prompt template with the current query and formatted chunks.
    const systemPrompt = file
      .replace('{userMessage}', userMessage)
      .replace('{retrievedChunks}', chunkTexts.trim());

    // Log the assembled system prompt for debugging.
    console.log(systemPrompt);

    // Retrieve recent conversation messages and format them for the chat completion API.
    const chatHistory = await prisma.chatMessage.findMany({
      where: { projectId, companyId, userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    // Reverse newest-first rows into chronological order and map to OpenAI message roles.
    const llmChatHistory = chatHistory.reverse().map((chat) => ({
      role: chat.role as 'user' | 'assistant',
      content: chat.content,
    }));

    // Request a chat completion using the system prompt, recent history, and current user message.
    const llmResponse = await openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...llmChatHistory,
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Persist and return the assistant's response message.
    const AiChatMessage = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        content: llmResponse.choices[0].message.content ?? '',
        role: 'assistant',
        companyId: companyId,
        projectId:projectId
      },
    });

    // Return the saved assistant message payload to the caller.
    return {
      content: AiChatMessage.content,
      role: AiChatMessage.role,
      companyId: AiChatMessage.companyId,
      id: AiChatMessage.id,
    };
  }

  // Retrieves up to 10 recent chat messages for a user within a project and company.
  async getChatHistory({
    projectId,
    companyId,
    clerkId,
  }: {
    projectId: string;
    clerkId: string;
    companyId: string;
  }) {
    // Run user lookup and chat history query inside a transaction.
    const response = await prisma.$transaction(async (tx) => {
      // Look up the user by Clerk ID and throw if not found.
      const user = await tx.user.findFirst({ where: { clerkId: clerkId } });
      if (!user || user == null) {
        throw new NotFoundException('user does not exist');
      }

      // Query up to 10 chat messages matching user, company, and project.
      const chatHistory = await tx.chatMessage.findMany({
        where: { userId: user.id, companyId: companyId, projectId: projectId },
        take: 10,
      });
      return chatHistory;
    });
    return response;
  }
}