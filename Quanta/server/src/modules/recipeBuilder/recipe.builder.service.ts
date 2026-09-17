import {RecipeBuilderRepository} from '@/modules/recipeBuilder/recipe.builder.repository'
import {Injectable} from "@nestjs/common"


@Injectable()
export class RecipeBuilderService {

    constructor (private readonly recipeBuilderRepository:RecipeBuilderRepository){}
}