import { Injectable } from '@nestjs/common';
import { FilesRepository } from '@/modules/documents/storage/postgres/repositories/documents.postgres';
import { S3StorageService } from '@/modules/documents/storage/s3/s3Storage.service';
import type {
  GetFilesRequest,
  DeleteFilesRequest,
  UploadFilesRequest,
  File,
} from '@/modules/documents/contracts/documents.request.contracts';

import type {
  GetFilesResponse,
  DeleteFileResponse,
} from '@/modules/documents/contracts/documents.response.contracts';
import { file } from 'zod';

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly documentsS3Bucket: S3StorageService,
  ) {}

  async filesUpload(request: UploadFilesRequest, files: File[]) {
    const file = files[0]
      const url = await this.documentsS3Bucket.insertFileToS3Bucket({
        fileName: file.originalName,
        body: file.buffer      });
      const newDocument = await this.filesRepository.SaveNewFileToDatabase({
        fileName: file.originalName,
        fileType: file.mimeType,
        s3Url: url,
        fileBuffer: file.buffer,
        companyId: request.companyId,
        projectId: request.projectId,
        userId: request.userId,
      });



    return {
      success: true,
      message: 'well played we saved it',
    };
  }
  async getFiles(request: GetFilesRequest): Promise<GetFilesResponse[]> {
    const response = await this.filesRepository.getFiles(request);
    return response;
  }

  async deleteFiles(request: DeleteFilesRequest): Promise<DeleteFileResponse> {
    return await this.filesRepository.deleteFiles(request);
  }
}
