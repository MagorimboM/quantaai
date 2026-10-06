import { Module } from '@nestjs/common';
import { SettingsController } from '@/modules/settings/settings.controller';
import { SettingsService } from '@/modules/settings/settings.service';
import { SettingsRepository } from '@/modules/settings/settings.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this company the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
})
export class SettingsModule {}