import {Module } from "@nestjs/common"; 
import {RecipeBuilderController} from "@/modules/recipeBuilder/recipe.builder.controller"; 
import {RecipeBuilderService} from "@/modules/recipeBuilder/recipe.builder.service"; 
import {RecipeBuilderRepository} from "@/modules/recipeBuilder/recipe.builder.repository"; 


@Module({
    controllers:[RecipeBuilderController], 
    providers:[RecipeBuilderRepository, RecipeBuilderService]
})
export class RecipeBuilderModule{}