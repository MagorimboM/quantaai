import { Module } from '@nestjs/common';
import { WorkspaceController } from '@/modules/workspace/workspace.controller';
import { WorkspaceRepository } from '@/modules/workspace/workspace.repository';
import { WorkspaceService } from '@/modules/workspace/workspace.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceRepository, WorkspaceService],
})
export class WorkspaceModule {}
