import type { z } from 'zod';
import type {
  deleteFilesParamsSchema,
  getFilesParamsSchema,
  uploadFilesBodySchema,
} from '@/modules/documents/contracts/documents.schema';

// The form fields of POST /:companyId/files/upload, once checked. The user and
// company are NOT accepted from the body: the user comes from the Clerk token
// and the company from the URL.
export type UploadFilesBody = z.output<typeof uploadFilesBodySchema>;

// What the service needs to save an upload. `userId` is the verified caller's
// id (from the Clerk token, checked by AccessService to own the company).
export type UploadFilesRequest = UploadFilesBody & {
  userId: string;
  companyId: string;
};

// The URL of GET /:companyId/files/:projectId, once checked
export type GetFilesRequest = z.output<typeof getFilesParamsSchema>;

// The URL of DELETE /:companyId/files/:projectId/:documentId, once checked
export type DeleteFilesRequest = z.output<typeof deleteFilesParamsSchema>;

export type SaveNewFileRequest = {
  s3Url: string;
  fileType: string;
  fileName: string;
  fileBuffer: Buffer;
  companyId: string;
  projectId: string;
  userId: string;
};

export type File = {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  encoding: string;
};

export type ChunkText = {
  chunkIndex: number;
  chunkText: string;
  chunkEmbedding: number[];
};

export type UploadedDocument = {
  fileType: string;
  documentName: string;
  chunkTexts: ChunkText[];
  originalFile: Document;
};

export type DocumentUploadResult = {
  inserted: string[];
  updated: string[];
  duplicates: string[];
  unknown: string[];
};