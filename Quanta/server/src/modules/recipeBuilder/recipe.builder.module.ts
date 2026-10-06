import { Module } from '@nestjs/common';
import { RecipeBuilderController } from '@/modules/recipeBuilder/recipe.builder.controller';
import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import { RecipeBuilderRepository } from '@/modules/recipeBuilder/recipe.builder.repository';
import { AuthModule } from '@/auth/auth.module';

// AuthModule provides AccessService, the "is this company the caller's?" check
@Module({
  imports: [AuthModule],
  controllers: [RecipeBuilderController],
  providers: [RecipeBuilderRepository, RecipeBuilderService],
})
export class RecipeBuilderModule {}