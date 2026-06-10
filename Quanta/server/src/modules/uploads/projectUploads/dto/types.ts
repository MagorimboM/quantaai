export type DocumentInformation = {
  userId?: string;
  companyId?: string;
  projectId?: string;
  documentType: string;
};

export type DocumentFile = {
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
  originalFile: DocumentFile;
};

export type DocumentUploadResult = {
  inserted: string[];
  updated: string[];
  duplicates: string[];
  unknown: string[];
};

export type decision = {
  fileName: string;
  decision: 'keep' | 'discard';
};

export type ResolveUnknownFiles = {
  userId?: string;
  decisions: decision[];
};
