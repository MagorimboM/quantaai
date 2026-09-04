import { Module } from '@nestjs/common';
import { BillOfQuantsController } from '@/modules/billOfQuants/boq.controller';
import { BillOfQuantsService } from '@/modules/billOfQuants/boq.service';
import { BillOfQuantsRepository } from '@/modules/billOfQuants/boq.repository';

@Module({
  controllers: [BillOfQuantsController],
  providers: [BillOfQuantsRepository, BillOfQuantsService],
})
export class BillOfQuantsModule {}
