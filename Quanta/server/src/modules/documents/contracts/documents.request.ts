export type UploadFilesRequest = {
  userId?: string;
  companyId?: string;
  projectId?: string;
  documentType?: string;
};

export type GetFilesRequest = {
  projectId: string;
  companyId: string;
};

export type DeleteFilesRequest = {
  projectId: string;
  companyId: string;
  documentId: string;
};

export type SaveNewFileRequest = {
  s3Url: string;
  fileType: string;
  fileName: string;
  fileBuffer: Buffer;
  companyId?: string;
  projectId?: string;
  userId?: string;
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
