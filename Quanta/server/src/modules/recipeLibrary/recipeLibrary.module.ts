import { Module } from '@nestjs/common';
import { RecipeLibraryController } from '@/modules/recipeLibrary/recipeLibrary.controller';
import { RecipeLibraryService } from '@/modules/recipeLibrary/recipeLibrary.service';
import { RecipeLibraryRepository } from '@/modules/recipeLibrary/recipeLibrary.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this company the caller's?" check
@Module({
  imports: [AuthModule],
  providers: [RecipeLibraryRepository, RecipeLibraryService],
  controllers: [RecipeLibraryController],
})
export class RecipeLibraryModule {}