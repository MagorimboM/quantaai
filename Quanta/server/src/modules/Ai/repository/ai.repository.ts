import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

// all database reads and writes for the AI chat feature
// no business logic lives here
@Injectable()
export class AiRepository {
  // dev only — remove before production
  async getTestingInfo() {
    const [user, company, project] = await Promise.all([
      prisma.user.findFirst(),
      prisma.company.findFirst(),
      prisma.project.findFirst(),
    ]);

    return {
      userId: user?.id,
      companyId: company?.id,
      projectId: project?.id,
    };
  }

  // persists a single message — works for both user and AI messages
  async saveMessage({
    message,
    role,
    projectId,
    companyId,
    userId
  }: {
    message: string;
    role: 'user' | 'ai';
    projectId?: string;
    companyId?: string;
    userId?:string
  }) {
    
      // ! why is it not saving the messages !
      const savedMessage = await prisma.chatMessage.create({
        data: {
          content: message,
          role: role,
          projectId: projectId,
          companyId: companyId,
          userId:userId
        },
      });
      return savedMessage;
  }

  // grabs the 15 most recent messages then reverses them
  // so they're in chronological order when passed to OpenAI
  async getChatHistory({
    projectId,
    userId,
  }: {
    userId?: string;
    projectId?: string;
  }) {
    const getChatHistory = await prisma.chatMessage.findMany({
      where: {
        projectId: projectId,
        userId: userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20,
    });

    return getChatHistory;
  }; 
    
  // loads documents scoped to the current user, company and project
  // reconstructs full text from sorted chunks per document
  // returns an array of { nameOfDocument, content, documentType }
  async getProjectCompanyPersonalDocuments({
    projectId,
    companyId,
    userId,
  }: {
    projectId?: string;
    companyId?: string;
    userId?: string;
  }) {
    const documents = await prisma.$transaction(async (tx) => {
      const documents: {
        nameOfDocument: string;
        content: string;
        documentType: string;
      }[] = [];

      // fetch one document per scope
      const projectDocumentIds = await tx.document.findMany({
        where: { projectId, companyId, userId },
        take: 1,
      });

      const companyDocumentIds = await tx.document.findMany({
        where: { userId, companyId, projectId: null },
        take: 1,
      });

      const userDocumentIds = await tx.document.findMany({
        where: { userId, companyId: null, projectId: null },
        take: 1,
      });

      let projectDocumentContent = '';
      let companyDocumentContent = '';
      let userDocumentContent = '';

      // reconstruct full text from sorted chunks — project documents
      for (const eachDocumentId of projectDocumentIds) {
        const projectDocumentChunks: {
          chunkText: string;
          chunkIndex: number;
        }[] = await prisma.documentEmbedding.findMany({
          where: { documentId: eachDocumentId.id },
        });
        const sortedProjectDocumentChunks = projectDocumentChunks.sort(
          (a, b) => a.chunkIndex - b.chunkIndex,
        );
        for (const eachChunk of sortedProjectDocumentChunks) {
          projectDocumentContent += eachChunk.chunkText;
        }
        documents.push({
          nameOfDocument: eachDocumentId.name,
          content: projectDocumentContent,
          documentType: 'projectDocument',
        });
      }

      // reconstruct full text from sorted chunks — company documents
      for (const eachDocumentId of companyDocumentIds) {
        const companyDocumentChunks: {
          chunkText: string;
          chunkIndex: number;
        }[] = await prisma.documentEmbedding.findMany({
          where: { documentId: eachDocumentId.id },
        });
        const sortedCompanyDocumentChunks = companyDocumentChunks.sort(
          (a, b) => a.chunkIndex - b.chunkIndex,
        );
        for (const eachChunk of sortedCompanyDocumentChunks) {
          companyDocumentContent += eachChunk.chunkText;
        }
        documents.push({
          nameOfDocument: eachDocumentId.name,
          content: companyDocumentContent,
          documentType: 'companyDocument',
        });
      }

      // reconstruct full text from sorted chunks — personal documents
      for (const eachDocumentId of userDocumentIds) {
        const userDocumentChunks: {
          chunkText: string;
          chunkIndex: number;
        }[] = await prisma.documentEmbedding.findMany({
          where: { documentId: eachDocumentId.id },
        });
        const sortedUserDocuments = userDocumentChunks.sort(
          (a, b) => a.chunkIndex - b.chunkIndex,
        );
        for (const eachChunk of sortedUserDocuments) {
          userDocumentContent += eachChunk.chunkText;
        }
        documents.push({
          nameOfDocument: eachDocumentId.name,
          content: userDocumentContent,
          documentType: 'userDocument',
        });
      }

      return documents;
    });

    return documents;
  }
}
