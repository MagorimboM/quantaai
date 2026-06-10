import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import Multer from 'multer';
import { ProjectUploadsService } from '@/modules/uploads/projectUploads/projectsUploads.service';
import type {
  DocumentInformation,
  DocumentFile,
  DocumentUploadResult,
  ResolveUnknownFiles,
} from '@/modules/uploads/projectUploads/dto/types';

@Controller('project')
export class ProjectUploadsController {
  constructor(private readonly projectsUploadService: ProjectUploadsService) {}

  @Post('documentUpload')
  @UseInterceptors(FilesInterceptor('files'))
  async documentUpload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: DocumentInformation,
  ): Promise<DocumentUploadResult> {
    const documents: DocumentFile[] = files.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    }));

    return await this.projectsUploadService.documentUpload(body, documents);
  }

  // TODO :: a function that will be triggered with the users confirmation.
  // TODO :: decision tree, discard,
  // TODO :: same uploads, or unknown files , may comeback aas an array, choices are , keep or discard files.
  @Post('resolveFiles')
  async resolveUnknownFile(@Body() body: ResolveUnknownFiles) {
    return await this.resolveUnknownFile;
  }
}
