import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from '@/modules/documents/documents.service';
import { AccessService } from '@/auth/services/access.service';
import { ClerkUserId } from '@/auth/services/currentUser.guard';
import { ZodValidationPipe } from '@/common/validations/global.input.validator';
import { FileValidationPipe } from '@/modules/documents/validation/pdf.signature.validator';
import {
  deleteFilesParamsSchema,
  getFilesParamsSchema,
  uploadFilesBodySchema,
} from '@/modules/documents/contracts/documents.schema';
import type {
  UploadFilesBody,
  GetFilesRequest,
  DeleteFilesRequest,
  File,
} from '@/modules/documents/contracts/documents.request.contracts';

// The most files one upload may hold, and the largest one file may be. Uploads
// are held in memory while they're read, so without a limit one huge file could
// take the server down. Raise these if real documents need more.
const MAX_FILES_PER_UPLOAD = 20;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

// A company's documents. Every route runs behind the global ClerkAuthGuard, so
// @ClerkUserId() is the verified caller. Before anything happens, the caller is
// checked to own the company in the URL (AccessService), so nobody can upload
// to, read or delete another company's documents by changing an id.
//
// The body and URL are checked by the schemas in documents.schema.ts, and the
// files by FileValidationPipe (at least one, each a real PDF). A bad request
// gets a 400 and never reaches the service.
@Controller(':companyId/files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly accessService: AccessService,
  ) {}

  // Uploads PDFs for a project   multipart form: files + { projectId, documentType? }
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async filesUpload(
    @ClerkUserId() clerkId: string,
    @Param('companyId') companyId: string,
    @UploadedFiles(new FileValidationPipe()) projectFiles: Express.Multer.File[],
    @Body(new ZodValidationPipe(uploadFilesBodySchema)) body: UploadFilesBody,
  ): Promise<any> {
    const userId = await this.accessService.requireCompanyAccess(clerkId, companyId);

    const files: File[] = projectFiles.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    }));
    return await this.filesService.filesUpload({ ...body, userId, companyId }, files);
  }

  // Every document of a project, each with its file base64-encoded
  @Get(':projectId')
  async getFiles(
    @ClerkUserId() clerkId: string,
    @Param(new ZodValidationPipe(getFilesParamsSchema)) request: GetFilesRequest,
  ) {
    await this.accessService.requireCompanyAccess(clerkId, request.companyId);

    const files = await this.filesService.getFiles(request);
    return files.map((file) => ({
      bytes: file.bytes ? Buffer.from(file.bytes).toString('base64') : null,
      document: file.file,
    }));
  }

  // Deletes one document of a project
  @Delete(':projectId/:documentId')
  async deleteFiles(
    @ClerkUserId() clerkId: string,
    @Param(new ZodValidationPipe(deleteFilesParamsSchema)) request: DeleteFilesRequest,
  ) {
    await this.accessService.requireCompanyAccess(clerkId, request.companyId);

    return await this.filesService.deleteFiles(request);
  }
}