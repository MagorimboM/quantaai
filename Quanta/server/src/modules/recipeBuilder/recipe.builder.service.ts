import { RecipeBuilderRepository } from '@/modules/recipeBuilder/recipe.builder.repository';
import { Injectable } from '@nestjs/common';
type NewRecipe = {
  companyId: string;
  categoryId: string;
  recipeName: string;
  recipeCode: string;
  recipeDescription: string;
  recipeUnitMeasure: string;
  ingredients: {
    materialId: string;
    unitMeasureId: string;
    quantity: string;
  }[];
};

@Injectable()
export class RecipeBuilderService {
  constructor(
    private readonly recipeBuilderRepository: RecipeBuilderRepository,
  ) {}

  async createNewRecipe(userId:string, request: NewRecipe) {
    
    return await this.recipeBuilderRepository.createNewRecipe(userId, request)
  }
}
