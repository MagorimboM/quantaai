import { Injectable } from '@nestjs/common';
import { openAi } from '@/core/Ai/openAi';
import { ProjectUploadsPostgres } from '@/modules/uploads/projectUploads/storage/projectUploads.postgres';
import { ProjectUploadAiLayer } from '@/modules/uploads/projectUploads/ai/ai.projectUploads.AiLayer';
import { ProjectUploadsS3Bucket } from '@/modules/uploads/projectUploads/storage/projectUploads.s3bucket';
import type {
  DocumentInformation,
  DocumentFile,
  ChunkText,
  UploadedDocument,
  DocumentUploadResult,
  ResolveUnknownFiles,
} from '@/modules/uploads/projectUploads/dto/types';
import pdf from 'pdf-parse-new';
import { from } from 'rxjs';

// ============================================================
// SERVICE
// ============================================================

@Injectable()
export class ProjectUploadsService {
  constructor(
    private readonly projectsUploadsPostgres: ProjectUploadsPostgres,
    private readonly projectUploadAiLayer: ProjectUploadAiLayer,
    private readonly projectUploadS3Bucket: ProjectUploadsS3Bucket,
  ) {}

  async documentUpload(
    body: DocumentInformation,
    files: DocumentFile[],
  ): Promise<DocumentUploadResult> {
    const CHUNK_SIZE = 700;
    const VECTOR_SIMILARITY_THRESHOLD = 0.7;

    // ============================================================
    // STEP 1 — Parse, chunk, and embed every uploaded file
    // ============================================================

    const uploadedFiles: UploadedDocument[] = [];

    for (const eachFile of files) {
      const content = await pdf(eachFile.buffer);
      const fullText = content.text;
      const totalChunks = Math.ceil(fullText.length / CHUNK_SIZE);
      const chunkTexts: ChunkText[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const chunkText = fullText.slice(start, end);

        const embeddedString = await openAi.embeddings.create({
          model: 'text-embedding-3-large',
          input: chunkText,
        });

        chunkTexts.push({
          chunkIndex: i,
          chunkText: chunkText,
          chunkEmbedding: embeddedString.data[0].embedding,
        });
      }

      uploadedFiles.push({
        fileType: eachFile.mimeType,
        documentName: eachFile.originalName,
        chunkTexts: chunkTexts,
        originalFile: eachFile,
      });
    }

    // ============================================================
    // STEP 2 — Classify each file: new / duplicate / update / unknown
    // ============================================================

    const newFiles: UploadedDocument[] = [];
    const updateFiles: {
      uploaded: UploadedDocument;
      existingDocumentId: string;
    }[] = [];
    const duplicatedFiles: string[] = [];
    const unknownFiles: string[] = [];

    for (const eachUploadedFile of uploadedFiles) {
      // Use first chunk embedding to find similar docs in vector table
      const similarChunks =
        await this.projectsUploadsPostgres.checkSimilarInVectorTable(
          `[${eachUploadedFile.chunkTexts[0].chunkEmbedding.join(',')}]`,
        );

      // No similar docs found — brand new document
      if (similarChunks.length === 0) {
        newFiles.push(eachUploadedFile);
        continue;
      }

      // Calculate average similarity score across returned chunks
      const similarityTotal = similarChunks.reduce(
        (sum, chunk) => sum + Number(chunk.similarity),
        0,
      );
      const averageSimilarity = similarityTotal / similarChunks.length;

      // Below threshold — not similar enough, treat as new
      if (averageSimilarity < VECTOR_SIMILARITY_THRESHOLD) {
        newFiles.push(eachUploadedFile);
        continue;
      }

      // Similar doc found — pull its full text and let AI compare
      const existingDocumentId = similarChunks[0].documentId;
      const existingChunks =
        await this.projectsUploadsPostgres.getAllChunks(existingDocumentId);

      // Reconstruct full text strings for AI comparison
      const uploadedFullText = eachUploadedFile.chunkTexts
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map((c) => c.chunkText)
        .join('');

      const existingFullText = existingChunks.map((c) => c.chunkText).join('');

      const comparisonResponse =
        await this.projectUploadAiLayer.EvaluateNewDocuments(
          uploadedFullText,
          existingFullText,
        );

      switch (comparisonResponse.status) {
        case 'new':
          newFiles.push(eachUploadedFile);
          break;
        case 'same':
          duplicatedFiles.push(eachUploadedFile.documentName);
          break;
        case 'update':
          updateFiles.push({
            uploaded: eachUploadedFile,
            existingDocumentId: existingDocumentId,
          });
          break;
        case 'unknown':
          unknownFiles.push(eachUploadedFile.documentName);
          break;
      }
    }

    // ============================================================
    // STEP 3 — Save new files → S3 + postgres + embeddings
    // ============================================================

    const insertedDocuments: string[] = [];

    for (const newFile of newFiles) {
      const fileUrl = await this.projectUploadS3Bucket.insertFileToS3Bucket({
        fileName: newFile.documentName,
        body: newFile.originalFile.buffer,
      });

      await this.projectsUploadsPostgres.addNewProjectDocument({
        userId: body.userId,
        companyId: body.companyId,
        name: newFile.documentName,
        fileUrl: fileUrl,
        fileType: newFile.fileType,
        documentType: body.documentType,
        chunkTitle: newFile.documentName,
        chunkTexts: newFile.chunkTexts,
        isArchived: false,
      });

      insertedDocuments.push(newFile.documentName);
    }

    // ============================================================
    // STEP 4 — Update files → archive old, save new to S3 + postgres
    // ============================================================

    const updatedDocuments: string[] = [];

    for (const { uploaded, existingDocumentId } of updateFiles) {
      const fileUrl = await this.projectUploadS3Bucket.insertFileToS3Bucket({
        fileName: uploaded.documentName,
        body: uploaded.originalFile.buffer,
      });

      await this.projectsUploadsPostgres.updateDocument({
        existingDocumentId: existingDocumentId,
        uploadedDocument: {
          userId: body.userId,
          companyId: body.companyId,
          name: uploaded.documentName,
          fileUrl: fileUrl,
          fileType: uploaded.fileType,
          documentType: body.documentType,
          chunkTitle: uploaded.documentName,
          chunkTexts: uploaded.chunkTexts,
        },
      });

      updatedDocuments.push(uploaded.documentName);
    }

    // ============================================================
    // STEP 5 — Cache unknown files → S3 + temp_file_cache
    // These are held for 24hrs pending user decision on the frontend
    // ============================================================

    if (unknownFiles.length > 0) {
      const unknownNameSet = new Set(unknownFiles);
      const unknownFileBuffers = files.filter((f) =>
        unknownNameSet.has(f.originalName),
      );

      for (const eachFile of unknownFileBuffers) {
        const cachedFileUrl =
          await this.projectUploadS3Bucket.insertFileToS3Bucket({
            fileName: eachFile.originalName,
            body: eachFile.buffer,
          });

        await this.projectsUploadsPostgres.cacheFile({
          userId: body.userId,
          fileName: eachFile.originalName,
          fileType: eachFile.mimeType,
          fileUrl: cachedFileUrl,
        });
      }
    }

    // ============================================================
    // STEP 6 — Return result summary
    // ============================================================

    return {
      inserted: insertedDocuments, // new docs saved
      updated: updatedDocuments, // old archived, new version saved
      duplicates: duplicatedFiles, // ignored — already exists
      unknown: unknownFiles, // cached — needs user decision on frontend
    };
  }

  async resolveUnknownFile(body: ResolveUnknownFiles) {

    for (const eachFile of body.decisions){
      // if decision is to keep, 
      // remove the exising file, and replace it with a new one. 
      // remove file from database and and vector table use url from s3. 
      // add the new 
    }





  }
}
