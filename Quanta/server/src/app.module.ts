import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from '@/modules/assistant/assistant.module';
import { FilesModule } from '@/modules/documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { DashBoardModule } from '@/modules/dashboard/dashboard.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { BillOfQuantsModule } from '@/modules/billOfQuants/boq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AssistantModule,
    FilesModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    DashBoardModule,
    ProjectsModule,
    BillOfQuantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
