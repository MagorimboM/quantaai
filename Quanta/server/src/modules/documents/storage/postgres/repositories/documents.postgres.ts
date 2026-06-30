import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { PDFParse } from 'pdf-parse';
import { S3StorageService } from '@/modules/documents/storage/s3/s3Storage.service';
import type {
  DeleteFilesRequest,
  GetFilesRequest,
  SaveNewFileRequest,
} from '@/modules/documents/contracts/documents.request';
import type {
  GetFilesResponse,
  DeleteFileResponse,
} from '@/modules/documents/contracts/documents.response';

@Injectable()
export class FilesRepository {
  constructor(private readonly s3StorageService: S3StorageService) {}
  async SaveNewFileToDatabase(request: SaveNewFileRequest) {
    const parser = new PDFParse(new Uint8Array(request.fileBuffer));
    const result = await parser.getText();
    const chunkedText = result.text.match(/.{1,700}/gs) ?? [];

    const newDocument = await prisma.document.create({
      data: {
        fileType: request.fileType,
        fileUrl: request.s3Url,
        name: request.fileName,
        companyId: request.companyId,
        projectId: request.projectId,
        documentType: 'projectDocument',
        userId: request.userId,
      },
    });

    // TODO !! EMBED THE CHUNKS AND SAVE THEM IN THE VECTOR TABLE ALONG WITH TEXT.

    await prisma.$transaction(async (tx) => {
      await tx.documentEmbedding.createMany({
        data: chunkedText.map((chunkText, i) => ({
          chunkText,
          chunkIndex: i,
          documentId: newDocument.id,
          userId: request.userId,
        })),
      });
    });

    return newDocument;
  }

  async getFiles(request: GetFilesRequest): Promise<GetFilesResponse[]> {
    const projectFiles: any[] = [];
    const files = await prisma.document.findMany({
      where: {
        projectId: request.projectId,
        companyId: request.companyId,
        isArchived: false,
      },
    });

    for (const file of files) {
      const response = await this.s3StorageService.retrieveFileFromS3Bucket({
        fileName: file.name,
      });

      projectFiles.push({
        file,
        bytes: await response.Body?.transformToByteArray(),
      });
    }

    return projectFiles;
  }

  async deleteFiles(request: DeleteFilesRequest): Promise<DeleteFileResponse> {
    const document = await prisma.document.findUnique({
      where: {
        id: request.documentId,
        companyId: request.companyId,
        projectId: request.projectId,
      },
    });

    if (!document || document === null) {
      throw new NotFoundException('document does not exists');
    }

    //! TODO :: come back to this.

    const deleteResponse = await this.s3StorageService.deleteFileFromS3Bucket({
      fileName: document.name,
    });

    const deletedChunks = await prisma.documentEmbedding.deleteMany({
      where: {
        documentId: document.id,
      },
    });

    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        id: request.documentId,
        projectId: request.projectId,
        companyId: request.companyId,
      },
    });

    if (deletedChunks.count === 0 && deletedDocuments.count === 0) {
      throw new Error('nothing was deleted');
    }

    return { success: true, message: 'documents successfully deleted' };
  }
}
