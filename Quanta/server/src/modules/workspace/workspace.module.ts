import { Module } from '@nestjs/common';
import { WorkspaceController } from '@/modules/workspace/workspace.controller';
import { WorkspaceService } from '@/modules/workspace/workspace.service';
import { WorkspaceRepository } from '@/modules/workspace/workspace.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, which identifies the signed-in person
@Module({
  imports: [AuthModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
})
export class WorkspaceModule {}