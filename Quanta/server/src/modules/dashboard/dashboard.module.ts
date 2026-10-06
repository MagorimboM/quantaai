import { Module } from '@nestjs/common';
import { DashboardController } from '@/modules/dashboard/dashboard.controller';
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { DashboardRepository } from '@/modules/dashboard/dashboard.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this company the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardService],
})
export class DashBoardModule {}