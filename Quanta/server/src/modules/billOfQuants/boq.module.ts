import { Module } from '@nestjs/common';
import { BillOfQuantsController } from '@/modules/billOfQuants/boq.controller';
import { BillOfQuantsService } from '@/modules/billOfQuants/boq.service';
import { BillOfQuantsRepository } from '@/modules/billOfQuants/boq.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this project the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [BillOfQuantsController],
  providers: [BillOfQuantsRepository, BillOfQuantsService],
})
export class BillOfQuantsModule {}