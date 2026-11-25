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

// TODO :: Upload Project Specifications:
//  - Only allow project specifications to be uploaded
//  - Update AI system prompt to read from project spec
//  - If project details are not related to construction, inform the user

// TODO :: Validate Form Data:
//  - Check if file type is valid (e.g., PDF, DOCX, etc.) : throw error if not
//  - Validate file size (maximum allowed size: 10MB) : throw error if above 10mb
//  - Ensure file is not empty or null : throw error if file is empty or null

// TODO :: File Upload:
//  - Upload the file to the designated bucket : s3 bucket 
//  - Get the URL of the uploaded file : form one, go online and see how to get it

// TODO :: Save to Vector Database:
//  - save the file to the documents table and this provides a new document Id with the S3 bucket gotten online
//  - Using new document id Save the uploaded file to the vector database
//  - Ensure the file is properly indexed and stored

// TODO :: Return Success:
//  - Once the file has been successfully uploaded and saved, return a success response to the user




    const savedDocuments: any[] = [];
    for (const eachFile of files) {
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
  }; 

  async deleteFiles(request: DeleteFilesRequest): Promise<DeleteFileResponse> {
    return await this.filesRepository.deleteFiles(request);
  }
}
