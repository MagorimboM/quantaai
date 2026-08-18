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
import type {
  UploadFilesRequest,
  GetFilesRequest,
  DeleteFilesRequest,
  File,
} from '@/modules/documents/contracts/documents.request';

@Controller(':companyId/files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async filesUpload(
    @UploadedFiles()
    projectFiles: Express.Multer.File[],
    @Body() request: UploadFilesRequest,
  ): Promise<any> {
    const files: File[] = projectFiles.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    }));
    return await this.filesService.filesUpload(request, files);
  }; 

  @Get(':projectId')
  async getFiles(@Param() request: GetFilesRequest) {
    const files = await this.filesService.getFiles(request);
    return files.map((file, index) => ({
      bytes: file.bytes ? Buffer.from(file.bytes).toString('base64') : null,
      document: file.file,
    }));
  }; 

  @Delete('/:projectId/:documentId')
  async deleteFiles(@Param() request: DeleteFilesRequest) {
    return await this.filesService.deleteFiles(request);
  }; 
}; 



