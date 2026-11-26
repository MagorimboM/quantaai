import { Injectable } from '@nestjs/common';
import { prisma } from '@/core/database/postgres';
import type { NewCompanyRecord } from '@/modules/workspace/contracts/workspace.request.contracts';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { s3Client } from '@/core/storage/s3.bucket';
import { openAi } from '@/core/Ai/openAi';

import type {
  CompanyWorkspace,
  PersonalWorkspace,
  DueProject,
} from '@/modules/workspace/contracts/workspace.response.contracts';
import { randomUUID } from 'crypto';

// The most projects the "due" list returns
const DUE_PROJECT_LIMIT = 50;

// A new company starts with the trade categories the product promises, so its
// recipes have somewhere to go from day one. They are ordinary categories: the
// owner can add more.
const DEFAULT_CATEGORIES = [
  { name: 'Masonry', description: 'Bricks, blocks and mortar' },
  { name: 'Concrete', description: 'Concrete and reinforcement' },
  { name: 'Roofing', description: 'Roofing materials and labour' },
  { name: 'Framing', description: 'Timber and steel framing' },
  { name: 'Earthworks', description: 'Excavation, fill and compaction' },
  { name: 'Finishes', description: 'Plaster, paint, tiling and fit-off' },
];

// A workspace sits above a company: a company can have workspaces, and a
// workspace with no company is the person's own. Everything is filtered by the
// owning user, so a person only ever sees their own.
@Injectable()
export class WorkspaceRepository {
  // The person's company workspaces, alphabetical. The name shown is the
  // company's, and the counts are the company's projects and live recipes.
  async getCompanyWorkspaces(userId: string): Promise<CompanyWorkspace[]> {
    // Query company workspaces joined with company records and subqueries for project and active recipe counts
    return await prisma.$queryRaw<CompanyWorkspace[]>`
      SELECT
        w.id,
        c.name,
        w."companyId",
        (w."isArchived" OR c."isArchived") AS "isArchived",
        (SELECT COUNT(*)::int
           FROM projects p
          WHERE p."companyId" = c.id AND p."userId" = ${userId}) AS "numberOfProjects",
        (SELECT COUNT(*)::int
           FROM recipes r
          WHERE r."companyId" = c.id AND r."userId" = ${userId}
            AND r."isArchived" = false) AS "numberOfRecipes"
      FROM workspaces w
      JOIN companies c ON c.id = w."companyId"
      WHERE w."userId" = ${userId}
        AND c."userId" = ${userId}
      ORDER BY c.name ASC`;
  }

  // The person's own workspace (the one with no company), or null if they
  // don't have one. Its counts are the person's projects and recipes that
  // belong to no company.
  async getPersonalWorkspace(
    userId: string,
  ): Promise<PersonalWorkspace | null> {
    // Query the user's standalone workspace (companyId IS NULL) along with unassociated project and recipe counts
    const rows = await prisma.$queryRaw<PersonalWorkspace[]>`
      SELECT
        w.id,
        w.name,
        (SELECT COUNT(*)::int
           FROM projects p
          WHERE p."userId" = ${userId} AND p."companyId" IS NULL) AS "numberOfProjects",
        (SELECT COUNT(*)::int
           FROM recipes r
          WHERE r."userId" = ${userId} AND r."companyId" IS NULL
            AND r."isArchived" = false) AS "numberOfRecipes"
      FROM workspaces w
      WHERE w."userId" = ${userId}
        AND w."companyId" IS NULL
      LIMIT 1`;
    // Return the first matching personal workspace or null when none exists
    return rows[0] ?? null;
  }

  // The person's unfinished projects that have a due date, across all their
  // companies, soonest first. Overdue ones come first on purpose: a late
  // project is the one that needs attention most.
  async getDueProjects(userId: string): Promise<DueProject[]> {
    // Fetch active, incomplete projects across non-archived companies ordered by earliest endDate
    return await prisma.$queryRaw<DueProject[]>`
      SELECT
        p.id,
        p."companyId",
        p.name,
        c.name AS "companyName",
        p."endDate" AS "dueDate",
        p."updatedAt"
      FROM projects p
      JOIN companies c ON c.id = p."companyId"
      WHERE p."userId" = ${userId}
        AND c."userId" = ${userId}
        AND c."isArchived" = false
        AND p.completed = false
      ORDER BY p."endDate" ASC
      LIMIT ${DUE_PROJECT_LIMIT}`;
  }

  // True if the person already has a company with this name (ignoring case)
  async companyNameTaken(userId: string, name: string): Promise<boolean> {
    // Count matching company rows case-insensitively for this user
    const count = await prisma.company.count({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
    });
    return count > 0;
  }

  // Creates the company, its default categories and its workspace together, or
  // none of them if anything fails. The company keeps the text of its policy
  // PDF, or null if none was uploaded. Returns the workspace as the switcher
  // lists it; a brand-new company has no projects or recipes yet.
  async createCompanyWorkspace(
    record: NewCompanyRecord,
  ): Promise<CompanyWorkspace> {
    // Fast path when no policy document is attached: create company, default categories, and workspace in one transaction
    if (!record.companyPolicy) {
      const response = await prisma.$transaction(async (tx) => {
        // Create company record and seed default trade categories
        const newCompany = await tx.company.create({
          data: {
            name: record.name,
            userId: record.userId,
            address: record.address,
            city: record.city,
            state: record.state,
            postcode: record.postcode,
            country: record.country,
            phone: record.phone,
            email: record.email,
            contactName: record.contactName,
            contactPhone: record.contactPhone,
            contactEmail: record.contactEmail,
            companyType: record.companyType,
            categories: {
              create: DEFAULT_CATEGORIES.map((category) => ({
                userId: record.userId,
                name: category.name,
                description: category.description,
                isDefault: true,
              })),
            },
          },
        });

        // Create workspace linked to the new company
        const newWorkspace = await tx.workspace.create({
          data: {
            userId: record.userId,
            companyId: newCompany.id,
            name: newCompany.name,
          },
          select: { id: true },
        });

        // Query initial project and recipe counts for the new company
        const numberOfProjects = await tx.project.count({
          where: {
            companyId: newCompany.id,
          },
        });

        const numberOfRecipes = await tx.recipe.count({
          where: {
            companyId: newCompany.id,
          },
        });
        // Assemble the CompanyWorkspace summary object for the client
        return {
          id: newWorkspace.id,
          name: newCompany.name,
          companyId: newCompany.id,
          isArchived: newCompany.isArchived,
          numberOfProjects: numberOfProjects,
          numberOfRecipes: numberOfRecipes,
        };
      });

      return response;
    }

    // Accumulate page-level chunk embeddings before opening the database transaction
    const embeddedDocument: {
      documentTitle: string;
      documentPageNumber: number | string;
      chunks: { content: string; embedding: number[] }[];
    }[] = [];

    // Set once the upload succeeds. `fileUrl` is saved on the document row;
    // `fileKey` is kept so the file can be removed again if something fails.
    let fileUrl = '';
    let fileKey = '';

    try {
      // A unique key, so two companies uploading "Policy.pdf" never overwrite
      // each other
      fileKey = `company-policies/${record.userId}/${randomUUID()}-${record.chunkedCompanyPolicy[0].documentTitle}`;

      // save file to S3 bucket
      const savefileS3Response = await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
          Body: record.companyPolicy.buffer,
          ContentType: record.companyPolicy.mimetype,
        }),
      );

      // Fail early if S3 did not return HTTP 200
      if (savefileS3Response.$metadata.httpStatusCode !== 200) {
        throw new Error(
          `S3 upload failed with status ${savefileS3Response.$metadata.httpStatusCode}`,
        );
      }

      // Build the public/stored URL for the uploaded policy PDF
      const baseUrl = process.env.AWS_S3_BUCKET_URL!.replace(/\/$/, '');
      fileUrl = `${baseUrl}/${encodeURI(fileKey)}`;

      // Embed page by page. The OpenAI calls are slow, so they happen here,
      // before the database transaction opens.
      for (const eachPage of record.chunkedCompanyPolicy) {
        // The API rejects empty strings
        const contents = eachPage.chunkedContent.filter(
          (content) => content.trim() !== '',
        );
        if (contents.length === 0) continue;

        // Generate float vectors for non-empty chunks on the current page
        const embeddingResponse = await openAi.embeddings.create({
          model: 'text-embedding-3-small',
          input: contents,
          encoding_format: 'float',
        });

        // Pair each chunk string with its returned embedding vector
        embeddedDocument.push({
          documentTitle: eachPage.documentTitle,
          documentPageNumber: eachPage.documentPageNumber,
          chunks: contents.map((content, i) => ({
            content,
            embedding: embeddingResponse.data[i].embedding,
          })),
        });
      }
    } catch (error) {
      // Clean up any S3 object uploaded prior to failure and rethrow a uniform error
      console.error('Company policy upload or embedding failed:', error);
      await this.deleteUploadedFile(fileKey);
      throw new Error('Did not successfully embed items');
    }

    try {
      // Persist company, workspace, document record, and pgvector embeddings atomically
      const response = await prisma.$transaction(
        async (tx) => {
          // Create company record and seed default trade categories
          const newCompany = await tx.company.create({
            data: {
              name: record.name,
              userId: record.userId,
              address: record.address,
              city: record.city,
              state: record.state,
              postcode: record.postcode,
              country: record.country,
              phone: record.phone,
              email: record.email,
              contactName: record.contactName,
              contactPhone: record.contactPhone,
              contactEmail: record.contactEmail,
              companyType: record.companyType,
              categories: {
                create: DEFAULT_CATEGORIES.map((category) => ({
                  userId: record.userId,
                  name: category.name,
                  description: category.description,
                  isDefault: true,
                })),
              },
            },
          });

          // Create workspace linked to the new company
          const newWorkspace = await tx.workspace.create({
            data: {
              userId: record.userId,
              companyId: newCompany.id,
              name: newCompany.name,
            },
            select: { id: true },
          });

          // Query initial project and recipe counts for the new company
          const numberOfProjects = await tx.project.count({
            where: {
              companyId: newCompany.id,
            },
          });

          const numberOfRecipes = await tx.recipe.count({
            where: {
              companyId: newCompany.id,
            },
          });

          // Create the parent document row referencing the uploaded policy PDF
          const newDocument = await tx.document.create({
            data: {
              companyId: newCompany.id,
              userId: record.userId,
              documentTitle: record.chunkedCompanyPolicy[0].documentTitle,
              fileUrl,
              fileType: 'pdf',
              name: record.chunkedCompanyPolicy[0].documentTitle,
            },
          });

          // One row per chunk. `embedding` is a pgvector column, which Prisma
          // can't write directly, so this is raw SQL. The id is supplied here
          // because Prisma's uuid() default doesn't apply to raw inserts.
          let chunkIndex = 0;
          for (const eachPage of embeddedDocument) {
            for (const eachChunk of eachPage.chunks) {
              // Format float array into pgvector literal syntax `[x,y,z,...]`
              const vector = `[${eachChunk.embedding.join(',')}]`;
              const title = `${eachPage.documentTitle} (page ${eachPage.documentPageNumber})`;

              // Insert chunk text, metadata, and pgvector embedding into Postgres
              await tx.$executeRaw`
            INSERT INTO document_embeddings
              ("id", "userId", "documentId", "chunkText", "chunkTitle", "chunkIndex", "embedding")
            VALUES
              (${randomUUID()}, ${record.userId}, ${newDocument.id}, ${eachChunk.content}, ${title}, ${chunkIndex++}, ${vector}::vector)
          `;
            }
          }

          // Return the CompanyWorkspace summary object for the newly created company
          return {
            id: newWorkspace.id,
            name: newCompany.name,
            companyId: newCompany.id,
            isArchived: newCompany.isArchived,
            numberOfProjects: numberOfProjects,
            numberOfRecipes: numberOfRecipes,
          };
        },
        // Many inserts: the default 5 seconds is too short for a long policy
        { timeout: 60_000, maxWait: 10_000 },
      );

      return response;
    } catch (error) {
      // The file was uploaded before the database work, so remove it again
      await this.deleteUploadedFile(fileKey);
      throw error;
    }
  }

  // Best effort: a failed clean-up must not hide the original error
  private async deleteUploadedFile(fileKey: string): Promise<void> {
    // Skip S3 deletion if no object key was created
    if (!fileKey) return;
    try {
      // Remove the object from S3
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey,
        }),
      );
    } catch (error) {
      // Log cleanup failure without throwing over the caller's error
      console.error('Could not remove uploaded file:', fileKey, error);
    }
  }
}