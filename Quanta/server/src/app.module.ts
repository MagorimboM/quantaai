import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {AiModule} from "@/modules/Ai/ai.module"
import {ProjectUploadModule} from "@/modules/uploads/projectUploads/projects.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AiModule, 
    ProjectUploadModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {};