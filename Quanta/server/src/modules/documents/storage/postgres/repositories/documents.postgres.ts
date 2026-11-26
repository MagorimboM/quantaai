import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import { PDFParse } from 'pdf-parse';
import { S3StorageService } from '@/modules/documents/storage/s3/s3Storage.service';
import type {
  DeleteFilesRequest,
  GetFilesRequest,
  SaveNewFileRequest,
} from '@/modules/documents/contracts/documents.request.contracts';
import type {
  GetFilesResponse,
  DeleteFileResponse,
} from '@/modules/documents/contracts/documents.response.contracts';
import { openAi } from '@/core/Ai/openAi';
import { embed } from 'ai';

@Injectable()
export class FilesRepository {
  // Inject S3 storage service for retrieving and deleting file objects
  constructor(private readonly s3StorageService: S3StorageService) {}

  // Extracts PDF text, chunks it, generates OpenAI embeddings, and persists the document and vector rows in a transaction
  async SaveNewFileToDatabase(request: SaveNewFileRequest) {
    // Initialize PDF parser with raw file bytes and extract plain text
    const parser = new PDFParse(new Uint8Array(request.fileBuffer));
    const result = await parser.getText();
    // Split raw PDF text into character slices of up to 700 characters
    const chunkedText = result.text.match(/.{1,700}/gs) ?? [];

    // Normalize extracted text and split into non-empty whitespace-delimited words
    const pdfText: string = result.text ?? '';
    const words: string[] = pdfText.trim().split(/\s+/).filter(Boolean);

    // Group words into chunks of up to 700 words each
    const chunkLimit = 700;
    const chunkedTexts: string[] = [];

    for (let i = 0; i < words.length; i += chunkLimit) {
      const chunk = words.slice(i, i + chunkLimit).join(' ');
      chunkedTexts.push(chunk);
    }

    // Request float embedding vectors from OpenAI for each chunk in chunkedTexts
    const documentEmbedding = await openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunkedTexts,
      encoding_format: 'float',
    });

    // Run document creation and embedding inserts atomically inside a Prisma transaction
    const response = await prisma.$transaction(async (tx) => {
      // save the mebedding in the database

      // Insert the document metadata record and get its generated ID
      const newDocument = await tx.document.create({
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

      // save embedding in the database

      // Await all raw pgvector inserts so the transaction stays open until every chunk finishes
      await Promise.all(
        documentEmbedding.data.map(
          async (eachEmbedding, index) =>
            await tx.$queryRaw`
    INSERT INTO 
    document_embeddings ("id","userId", "documentId","chunkText","chunkIndex", "embedding" )
    VALUES (gen_random_uuid(),${request.userId},${newDocument.id}, ${chunkedText[index]}, ${eachEmbedding.index}, ${JSON.stringify(eachEmbedding.embedding)}::vector) 
    RETURNING id`,
        ),
      );

      // Return the newly created document record from the transaction
      return newDocument;
    });

    return response;
  }

  // Fetches active project documents from Postgres and downloads their byte payloads from S3
  async getFiles(request: GetFilesRequest): Promise<GetFilesResponse[]> {
    const projectFiles: any[] = [];
    // Query non-archived documents scoped to the company and project
    const files = await prisma.document.findMany({
      where: {
        projectId: request.projectId,
        companyId: request.companyId,
        isArchived: false,
      },
    });

    // Fetch each file's bytes from S3 and pair them with its database record
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

  // Deletes a document from S3, removes its embedding chunks, and deletes the document row
  async deleteFiles(request: DeleteFilesRequest): Promise<DeleteFileResponse> {
    // Verify the target document exists for the given company and project
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

    // Delete the file object from the S3 bucket
    const deleteResponse = await this.s3StorageService.deleteFileFromS3Bucket({
      fileName: document.name,
    });

    // Delete all embedding rows associated with this document
    const deletedChunks = await prisma.documentEmbedding.deleteMany({
      where: {
        documentId: document.id,
      },
    });

    // Delete the document record itself
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        id: request.documentId,
        projectId: request.projectId,
        companyId: request.companyId,
      },
    });

    // Guard against no-op deletes when neither chunks nor document rows were removed
    if (deletedChunks.count === 0 && deletedDocuments.count === 0) {
      throw new Error('nothing was deleted');
    }

    return { success: true, message: 'documents successfully deleted' };
  }
}