import { RecipeLibraryController } from '@/modules/recipeLibrary/recipeLibrary.controller';
import { RecipeLibraryService } from '@/modules/recipeLibrary/recipeLibrary.service';
import { RecipeLibraryRepository } from '@/modules/recipeLibrary/recipeLibrary.repository';
import { Module } from '@nestjs/common';

@Module({
  providers: [RecipeLibraryRepository, RecipeLibraryService],
  controllers: [RecipeLibraryController],
})
export class RecipeLibraryModule {}
