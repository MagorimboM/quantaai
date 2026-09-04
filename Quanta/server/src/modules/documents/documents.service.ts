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

@Injectable()
export class FilesService {
  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly documentsS3Bucket: S3StorageService,
  ) {}

  async filesUpload(request: UploadFilesRequest, files: File[]) {
    const savedDocuments: any[] = [];
    for (const eachFile of files) {
      // save the files to the bucket
      const url = await this.documentsS3Bucket.insertFileToS3Bucket({
        fileName: eachFile.originalName,
        body: eachFile.buffer,
      });
      const newDocument = await this.filesRepository.SaveNewFileToDatabase({
        fileName: eachFile.originalName,
        fileType: eachFile.mimeType,
        s3Url: url,
        fileBuffer: eachFile.buffer,
        companyId: request.companyId,
        projectId: request.projectId,
        userId: request.userId,
      });

      savedDocuments.push(newDocument);
    }
    if (savedDocuments.length == 0) {
      return {
        success: false,
        message: 'failed to save data',
        documents: savedDocuments,
      };
    }
    return {
      success: true,
      message: 'well played we saved it',
      documents: savedDocuments,
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
