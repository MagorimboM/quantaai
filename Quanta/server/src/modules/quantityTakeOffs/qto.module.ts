import { Module } from '@nestjs/common';
import { QuantityTakeOffsController } from '@/modules/quantityTakeOffs/qto.controller';
import { QuantityTakeOffsService } from '@/modules/quantityTakeOffs/qto.service';
import { QuantityTakeOffsRepository } from '@/modules/quantityTakeOffs/qto.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this project the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [QuantityTakeOffsController],
  providers: [QuantityTakeOffsRepository, QuantityTakeOffsService],
})
export class QuantityTakeOffsModule {}
