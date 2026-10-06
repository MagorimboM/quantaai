import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

// How many of the most recent messages are shown in the widget and sent to
// the model as its memory of the conversation.
const CHAT_HISTORY_LIMIT = 20;

// Which of the user's documents a piece of text came from.
//  - projectDocument: uploaded against the project the user is in
//  - companyDocument: uploaded against the company, not tied to a project
//  - userDocument:    personal, not tied to any company or project
export type AssistantDocument = {
  nameOfDocument: string;
  content: string;
  documentType: 'projectDocument' | 'companyDocument' | 'userDocument';
};

// OWNERSHIP MODEL: userId owns all data; companyId and projectId are tags on
// it. So every query below is filtered by userId first.
@Injectable()
export class AssistantRepository {
  // Clerk identifies the person; every other table points at our own users.id
  async findUserByClerkId(clerkId: string) {
    return await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
  }

  // True only if the company (and project, when given) belong to this user.
  // The company and project ids come from the URL/body, so they can't be trusted on their own.
  async scopeBelongsToUser({
    userId,
    companyId,
    projectId,
  }: {
    userId: string;
    companyId: string;
    projectId?: string;
  }): Promise<boolean> {
    const company = await prisma.company.findFirst({
      where: { id: companyId, userId },
      select: { id: true },
    });
    if (!company) return false;
    if (!projectId) return true;

    const project = await prisma.project.findFirst({
      where: { id: projectId, companyId, userId },
      select: { id: true },
    });
    return project !== null;
  }

  async saveMessage({
    message,
    role,
    userId,
    companyId,
    projectId,
  }: {
    message: string;
    role: 'user' | 'assistant';
    userId: string;
    companyId: string;
    projectId?: string;
  }) {
    return await prisma.chatMessage.create({
      data: {
        content: message,
        role,
        userId,
        companyId,
        projectId: projectId ?? null,
      },
    });
  }

  // The latest messages of one conversation, oldest first.
  // A conversation is one user + one company + one project. With no project it
  // is the company-level conversation (projectId null). Leaving projectId out of
  // the filter instead would mix every project's messages together, because
  // Prisma ignores an undefined filter.
  async getChatHistory({
    userId,
    companyId,
    projectId,
  }: {
    userId: string;
    companyId: string;
    projectId?: string;
  }) {
    // Newest 20 first (so a long conversation keeps its recent messages),
    // then flipped back into reading order.
    const latestMessages = await prisma.chatMessage.findMany({
      where: { userId, companyId, projectId: projectId ?? null },
      orderBy: { createdAt: 'desc' },
      take: CHAT_HISTORY_LIMIT,
    });

    return latestMessages.reverse();
  }

  // The full text of every active document the assistant may read in this scope.
  // Archived documents are skipped: archiving means "exclude from AI search".
  // A document's text is stored as chunks (document_embeddings); they are
  // joined back together in order here.
  async getAssistantDocuments({
    userId,
    companyId,
    projectId,
  }: {
    userId: string;
    companyId: string;
    projectId?: string;
  }): Promise<AssistantDocument[]> {
    // Project documents only when the user is inside a project. Without this
    // guard an undefined projectId would match every document the user owns.
    const projectDocs = projectId
      ? await prisma.document.findMany({
          where: { userId, projectId, isArchived: false },
          select: { id: true, name: true },
        })
      : [];

    const companyDocs = await prisma.document.findMany({
      where: { userId, companyId, projectId: null, isArchived: false },
      select: { id: true, name: true },
    });

    const userDocs = await prisma.document.findMany({
      where: { userId, companyId: null, projectId: null, isArchived: false },
      select: { id: true, name: true },
    });

    const documents = [
      ...projectDocs.map((doc) => ({ ...doc, documentType: 'projectDocument' as const })),
      ...companyDocs.map((doc) => ({ ...doc, documentType: 'companyDocument' as const })),
      ...userDocs.map((doc) => ({ ...doc, documentType: 'userDocument' as const })),
    ];
    if (documents.length === 0) return [];

    // One query for every document's chunks, instead of one query per document
    const chunks = await prisma.documentEmbedding.findMany({
      where: {
        documentId: { in: documents.map((doc) => doc.id) },
        isArchived: false,
      },
      orderBy: [{ documentId: 'asc' }, { chunkIndex: 'asc' }],
      select: { documentId: true, chunkText: true },
    });

    const chunkTextByDocument = new Map<string, string[]>();
    for (const chunk of chunks) {
      const texts = chunkTextByDocument.get(chunk.documentId) ?? [];
      texts.push(chunk.chunkText);
      chunkTextByDocument.set(chunk.documentId, texts);
    }

    // A document with no chunks yet is still being processed, so it is skipped
    return documents.flatMap((doc) => {
      const texts = chunkTextByDocument.get(doc.id);
      if (!texts) return [];
      return [
        {
          nameOfDocument: doc.name,
          content: texts.join(''),
          documentType: doc.documentType,
        },
      ];
    });
  }
}