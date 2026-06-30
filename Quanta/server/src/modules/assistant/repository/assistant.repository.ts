import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

@Injectable()
export class AssistantRepository {
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
  }; 

  async saveMessage({
    message,
    role,
    projectId,
    companyId,
    userId,
  }: {
    message: string;
    role: 'user' | 'assistant';
    projectId?: string;
    companyId?: string;
    userId?: string;
  }) {
    return await prisma.chatMessage.create({
      data: {
        content: message,
        role,
        projectId,
        companyId,
        userId,
      },
    });
  }; 

  async getChatHistory({
    projectId,
    userId,
  }: {
    userId?: string;
    projectId?: string;
  }) {
    return await prisma.chatMessage.findMany({
      where: { projectId, userId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
  }

  async getProjectCompanyPersonalDocuments({
    projectId,
    companyId,
    userId,
  }: {
    projectId?: string;
    companyId?: string;
    userId?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const documents: {
        nameOfDocument: string;
        content: string;
        documentType: string;
      }[] = [];

      const projectDocs = await tx.document.findMany({
        where: { projectId: projectId, userId: userId },
        take: 1,
      });

      const companyDocs = await tx.document.findMany({
        where: { companyId, projectId: null, userId: userId },
        take: 1,
      });

      const userDocs = await tx.document.findMany({
        where: { userId: userId, companyId: null, projectId: null },
        take: 1,
      });

      async function reconstructContent(
        docs: { id: string; name: string }[],
        documentType: string,
      ) {
        for (const doc of docs) {
          const chunks = await tx.documentEmbedding.findMany({
            where: { documentId: doc.id },
            orderBy: { chunkIndex: 'asc' },
          });

          if (chunks.length === 0) continue;

          const content = chunks.map((c) => c.chunkText).join('');
          documents.push({ nameOfDocument: doc.name, content, documentType });
        }
      }; 

      await reconstructContent(projectDocs, 'projectDocument');
      await reconstructContent(companyDocs, 'companyDocument');
      await reconstructContent(userDocs, 'userDocument');

      return documents;
    });
  }; 
}
