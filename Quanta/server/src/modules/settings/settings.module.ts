import { Module } from '@nestjs/common';
import { SettingsController } from '@/modules/settings/settings.controller';
import {SettingsService} from "@/modules/settings/settings.service"
import {SettingsRepository} from "@/modules/settings/settings.repository"; 

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
