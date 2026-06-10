CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "document_embeddings" 
ADD COLUMN "embedding" vector(1536);