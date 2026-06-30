import { Module } from '@nestjs/common';
import { FilesController } from '@/modules/documents/documents.controller';
import { FilesService } from '@/modules/documents/documents.service';
import { FilesRepository } from '@/modules/documents/storage/postgres/repositories/documents.postgres';
import { S3StorageService } from '@/modules/documents/storage/s3/s3Storage.service';
import { FileValidationPipe } from '@/modules/documents/validation/parse-document-uploads.pipeline';

@Module({
  providers: [
    FilesService,
    FilesRepository,
    S3StorageService,
    FileValidationPipe,
  ],
  controllers: [FilesController],
})
export class FilesModule {}; 


