import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';

// ============================================================
// TYPES
// ============================================================

export type ChunkText = {
  chunkIndex: number;
  chunkText: string;
  chunkEmbedding: number[];
};

export type NewDocument = {
  userId?: string;
  companyId?: string;
  name: string;
  fileUrl: string;
  fileType: string;
  documentType: string;
  documentDate?: Date;
  documentVersion?: string;
  documentAuthor?: string;
  documentTitle?: string;
  issuedBy?: string;
  extractedText?: string;
  chunkTitle: string;
  chunkTexts: ChunkText[];
  isArchived?: boolean;
};

export type ArchiveDocument = {
  existingDocumentId: string;
  uploadedDocument: NewDocument;
};

export type CacheFile = {
  userId?: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  expiresAt?: Date;
};

// ============================================================
// POSTGRES LAYER
// ============================================================

@Injectable()
export class ProjectUploadsPostgres {

  // ============================================================
  // CHECK VECTOR TABLE FOR SIMILAR DOCUMENTS
  // Returns top 3 closest chunks with similarity score
  // ============================================================

  async checkSimilarInVectorTable(embeddedVector: string): Promise<
    {
      documentId: string;
      chunkText: string;
      chunkIndex: number;
      similarity: string;
    }[]
  > {
    const response: any = await prisma.$queryRaw`
      SELECT documentId, chunkText, chunkIndex,
        1 - (embedding <=> ${embeddedVector}::vector) AS similarity
      FROM document_embeddings
      WHERE isArchived = false
      ORDER BY embedding <=> ${embeddedVector}::vector
      LIMIT 3
    `;

    return response;
  }

  // ============================================================
  // GET ALL CHUNKS FOR A DOCUMENT
  // Ordered by chunkIndex to reconstruct full text
  // ============================================================

  async getAllChunks(documentId: string): Promise<{ chunkText: string }[]> {
    const response: any = await prisma.$queryRaw`
      SELECT chunkText FROM document_embeddings
      WHERE documentId = ${documentId}
      AND isArchived = false
      ORDER BY chunkIndex ASC
    `;

    return response;
  }

  // ============================================================
  // INSERT NEW DOCUMENT + EMBEDDINGS
  // Creates document record then inserts all chunks in a transaction
  // ============================================================

  async addNewProjectDocument(newDocument: NewDocument): Promise<void> {
    // Insert document record first to get the generated ID
    const newDocInfo = await prisma.document.create({
      data: {
        userId: newDocument.userId,
        companyId: newDocument.companyId,
        name: newDocument.name,
        fileType: newDocument.fileType,
        fileUrl: newDocument.fileUrl,
        documentType: newDocument.documentType,
        documentTitle: newDocument.documentTitle,
        documentDate: newDocument.documentDate,
        documentAuthor: newDocument.documentAuthor,
        documentVersion: newDocument.documentVersion,
        issuedBy: newDocument.issuedBy,
        extractedText: newDocument.extractedText,
        isArchived: false,
        status: 'active',
      },
    });

    // Insert all chunk embeddings in a single transaction
    try {
      await prisma.$queryRaw`BEGIN`;

      for (const eachChunk of newDocument.chunkTexts) {
        await prisma.$queryRaw`
          INSERT INTO document_embeddings
            (userId, documentId, chunkText, chunkTitle, chunkIndex, embedding, isArchived)
          VALUES
            (
              ${newDocument.userId},
              ${newDocInfo.id},
              ${eachChunk.chunkText},
              ${newDocument.chunkTitle},
              ${eachChunk.chunkIndex},
              ${`[${eachChunk.chunkEmbedding.join(',')}]`}::vector,
              false
            )
        `;
      }

      await prisma.$queryRaw`COMMIT`;
    } catch (error) {
      await prisma.$queryRaw`ROLLBACK`;
      throw error;
    }
  }

  // ============================================================
  // ARCHIVE OLD DOCUMENT + INSERT NEW VERSION
  // 1. Archive old doc record + all its embeddings
  // 2. Insert new doc record + fresh embeddings
  // ============================================================

  async updateDocument({
    existingDocumentId,
    uploadedDocument,
  }: ArchiveDocument): Promise<void> {
    // Step 1 — Archive the old document record
    const archivedDocument = await prisma.document.update({
      where: { id: existingDocumentId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: `Superseded by ${uploadedDocument.name}`,
      },
    });

    // Step 2 — Archive all embeddings tied to the old document
    await prisma.$queryRaw`
      UPDATE document_embeddings
      SET isArchived = true, archivedAt = NOW()
      WHERE documentId = ${archivedDocument.id}
    `;

    // Step 3 — Insert the new document record
    const newDocInfo = await prisma.document.create({
      data: {
        userId: uploadedDocument.userId,
        companyId: uploadedDocument.companyId,
        name: uploadedDocument.name,
        fileType: uploadedDocument.fileType,
        fileUrl: uploadedDocument.fileUrl,
        documentType: uploadedDocument.documentType,
        documentTitle: uploadedDocument.documentTitle,
        documentDate: uploadedDocument.documentDate,
        documentAuthor: uploadedDocument.documentAuthor,
        documentVersion: uploadedDocument.documentVersion,
        issuedBy: uploadedDocument.issuedBy,
        extractedText: uploadedDocument.extractedText,
        isArchived: false,
        status: 'active',
      },
    });

    // Step 4 — Insert new chunk embeddings in a transaction
    try {
      await prisma.$queryRaw`BEGIN`;

      for (const eachChunk of uploadedDocument.chunkTexts) {
        await prisma.$queryRaw`
          INSERT INTO document_embeddings
            (userId, documentId, chunkText, chunkTitle, chunkIndex, embedding, isArchived)
          VALUES
            (
              ${uploadedDocument.userId},
              ${newDocInfo.id},
              ${eachChunk.chunkText},
              ${uploadedDocument.chunkTitle},
              ${eachChunk.chunkIndex},
              ${`[${eachChunk.chunkEmbedding.join(',')}]`}::vector,
              false
            )
        `;
      }

      await prisma.$queryRaw`COMMIT`;
    } catch (error) {
      await prisma.$queryRaw`ROLLBACK`;
      throw error;
    }
  }

  // ============================================================
  // CACHE UNKNOWN FILE
  // Stores file reference in temp_file_cache pending user decision
  // Defaults to 24hr expiry if expiresAt not provided
  // ============================================================

  async cacheFile({ userId, fileName, fileType, fileUrl, expiresAt }: CacheFile) {
    const expiry = expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);

    const cachedFile = await prisma.tempFileCache.create({
      data: {
        userId: userId,
        fileName: fileName,
        fileType: fileType,
        fileUrl: fileUrl,
        expiresAt: expiry,
      },
    });

    return cachedFile;
  }
}