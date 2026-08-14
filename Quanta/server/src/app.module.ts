import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from '@/modules/assistant/assistant.module';
import { FilesModule } from '@/modules/documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import {SettingsModule} from "@/modules/settings/settings.module"; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AssistantModule,
    FilesModule,
    AuthModule,
    UsersModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
