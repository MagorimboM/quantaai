import { Module } from '@nestjs/common';
import { ProjectUploadsController } from '@/modules/uploads/projectUploads/pojectUploads.controller';
import { ProjectUploadsService } from '@/modules/uploads/projectUploads/projectsUploads.service';
import { ProjectUploadsPostgres } from '@/modules/uploads/projectUploads/storage/projectUploads.postgres';
import { ProjectUploadAiLayer } from '@/modules/uploads/projectUploads/ai/ai.projectUploads.AiLayer';
import { ProjectUploadsS3Bucket } from '@/modules/uploads/projectUploads/storage/projectUploads.s3bucket';

@Module({
  providers: [
    ProjectUploadsService,
    ProjectUploadsPostgres,
    ProjectUploadAiLayer,
    ProjectUploadsS3Bucket,
  ],
  controllers: [ProjectUploadsController],
})
export class ProjectUploadModule {}
