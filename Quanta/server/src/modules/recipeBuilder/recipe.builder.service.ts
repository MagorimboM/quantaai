import { RecipeBuilderRepository } from '@/modules/recipeBuilder/recipe.builder.repository';
import { Injectable } from '@nestjs/common';


type NewRecipe = {
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

  async createNewRecipe(companyId:string, userId: string, request: NewRecipe) {
    return await this.recipeBuilderRepository.createNewRecipe(companyId,userId, request);
  }

  async getListOfCategories(companyId: string, userId: string) {
    return await this.recipeBuilderRepository.getListOfCategories(
      companyId,
      userId,
    );
  }

  async getListOfMaterialsAndCategories(
    companyId: string,
    categoryId: string,
    userId: string,
    query: string,
  ) {
    return await this.recipeBuilderRepository.getListOfMaterialsAndCategories(
      companyId,
      categoryId,
      userId,
      query,
    );
  }


  async materialCategories (userId:string, companyId:string){

    return await this.recipeBuilderRepository.materialCategories(userId, companyId); 
  }
}
