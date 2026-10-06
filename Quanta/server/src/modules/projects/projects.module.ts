import { Module } from '@nestjs/common';
import { ProjectsController } from '@/modules/projects/projects.controller';
import { ProjectsService } from '@/modules/projects/projects.service';
import { ProjectsRepository } from '@/modules/projects/projects.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this company the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}