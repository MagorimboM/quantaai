-- ============================================================
-- PGVECTOR SETUP
-- Runs after the Prisma migration (the tables must exist first).
-- Prisma doesn't manage the "embedding" column, so it is added
-- here. Safe to run more than once.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- One embedding per chunk: 1536 numbers, the size OpenAI's
-- text-embedding-3-small produces. Change it if your model differs.
ALTER TABLE "document_embeddings"
  ADD COLUMN IF NOT EXISTS "embedding" vector(1536);

-- Makes "find the chunks closest to this question" fast once there
-- are many rows. HNSW with cosine distance suits text embeddings;
-- query with the <=> operator to use it:
--   ORDER BY "embedding" <=> $1 LIMIT 5
CREATE INDEX IF NOT EXISTS "document_embeddings_embedding_idx"
  ON "document_embeddings"
  USING hnsw ("embedding" vector_cosine_ops);