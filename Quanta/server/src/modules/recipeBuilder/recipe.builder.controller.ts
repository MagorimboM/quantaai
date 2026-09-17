import { RecipeBuilderService } from '@/modules/recipeBuilder/recipe.builder.service';
import {Controller, Get, Post, Put, Delete } from "@nestjs/common"; 

@Controller('/create-recipe')
export class RecipeBuilderController {
  constructor(private readonly recipeBuilderService: RecipeBuilderService) {}

  





}
