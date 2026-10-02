import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistantModule } from '@/modules/assistant/assistant.module';
import { FilesModule } from '@/modules/documents/documents.module';
import { AuthModule } from './auth/auth.module';
import { SettingsModule } from '@/modules/settings/settings.module';
import { DashBoardModule } from '@/modules/dashboard/dashboard.module';
import { ProjectsModule } from '@/modules/projects/projects.module';
import { BillOfQuantsModule } from '@/modules/billOfQuants/boq.module';
import { RecipeLibraryModule } from '@/modules/recipeLibrary/recipeLibrary.module';
import { WorkspaceModule } from '@/modules/workspace/workspace.module';
import { RecipeBuilderModule } from "@/modules/recipeBuilder/recipe.builder.module";
import { ClerkAuthGuard } from "@/auth/services/clerk.guard"

// NOTE :: [auth] ClerkAuthGuard is now registered globally via APP_GUARD --
// every route in every module above is protected by default. The one
// exception is the Clerk webhook (auth.controller.ts's handleClerkWebhook),
// marked with @Public() since it authenticates via its own Svix signature,
// not a user's session token.

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AssistantModule,
    FilesModule,
    AuthModule,
    SettingsModule,
    DashBoardModule,
    ProjectsModule,
    BillOfQuantsModule,
    RecipeLibraryModule,
    WorkspaceModule,
    RecipeBuilderModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}