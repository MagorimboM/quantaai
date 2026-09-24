import { prisma } from '@/core/database/postgres';
import { NotAcceptableException, Query } from '@nestjs/common';

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

export class RecipeBuilderRepository {
  async createNewRecipe(companyId: string, userId: string, request: NewRecipe) {
    const response = await prisma.$transaction(async (tx) => {
      // check if no similar recipe is there. if there is a similar recipe raise an error
      const recipeExists: { name: string; id: string }[] = await tx.$queryRaw`
        SELECT r.name, r.id
        FROM recipes r
        WHERE r."userId" = ${userId}
          AND r.name ILIKE ${'%' + request.recipeName + '%'}
        LIMIT 1
      `;

      if (recipeExists[0]) {
        throw new NotAcceptableException('Recipe with similar name exists');
      }

      const newRecipe: { id: string }[] = await tx.$queryRaw`
        INSERT INTO recipes
        (id, "userId", "categoryId", "companyId", name, description, unit, "isArchived", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${userId},
          ${request.categoryId},
          ${companyId},
          ${request.recipeName},
          ${request.recipeDescription},
          ${request.recipeUnitMeasure},
          false,
          now(),
          now()
        )
        RETURNING id
      `;

      const newRecipeId = newRecipe[0].id;

      for (const eachIngredient of request.ingredients) {
        await tx.$queryRaw`
          INSERT INTO recipe_materials (id, "userId", "recipeId", "materialId", quantity, unit)
          VALUES (
            gen_random_uuid(),
            ${userId},
            ${newRecipeId},
            ${eachIngredient.materialId},
            ${eachIngredient.quantity},
            ${eachIngredient.unitMeasureId}
          )
          RETURNING id
        `;
      }

      const addedRecipe: any[] = await tx.$queryRaw`
        SELECT
          r.id,
          r.name,
          r.description,
          r.unit,
          json_agg(
            json_build_object(
              'id', rm.id,
              'materialName', m.name,
              'materialUnitMeasure', rm.unit,
              'quantity', rm.quantity
            )
          ) AS ingredients
        FROM recipes r
        JOIN recipe_materials rm ON r.id = rm."recipeId"
        JOIN materials m ON m.id = rm."materialId"
        WHERE r."userId" = ${userId}
          AND r.id = ${newRecipeId}
        GROUP BY r.id
        ORDER BY r.name ASC
        LIMIT 1
      `;

      return addedRecipe[0];
    });

    return response;
  }

  async getListOfCategories(companyId: string, userId: string) {
    const response = await prisma.$queryRaw`
    SELECT c.id , c.name 
    FROM categories c 
    WHERE c."companyId" = ${companyId}
    AND  c."userId" = ${userId}
    ORDER BY c.name ASC `;
    return response;
  }

  async getListOfMaterialsAndCategories(
    companyId: string,
    categoryId: string,
    userId: string,
    query: string,
  ) {
    if (query == 'all' || query == 'All' || query == null) {
      const response = await prisma.$queryRaw`
    SELECT m.id, m.name,m.unit, c.id , c.name
    FROM materials m
    JOIN categories c 
    ON m."categoryId" = c.id
    WHERE m."companyId" = ${companyId}
    AND m."categoryId" = ${categoryId} 
    AND m."userId" = ${userId}
    GROUP BY c.name, m.id, c.id, m.name, m.unit
    ORDER BY m.name ASC`;

      return response;
    }

    const response = await prisma.$queryRaw`
    SELECT m.id, m.name,m.unit, c.id , c.name
    FROM materials m
    JOIN categories c 
    ON m."categoryId" = c.id
    WHERE m."companyId" = ${companyId}
    AND m."categoryId" = ${categoryId} 
    AND m."userId" = ${userId}
    AND m.name ILIKE ${'%' + query + '%'}
    GROUP BY c.name, m.id, c.id, m.name, m.unit
    ORDER BY m.name ASC`;

    return response;
  }

  async materialCategories(userId: string, companyId: string) {
    const response = await prisma.$queryRaw`
      SELECT c.name, c.id 
      FROM categories c 
      JOIN users u 
      ON u.id = c."userId"
      WHERE c."companyId" = ${companyId} 
      AND u.id = ${userId}
      GROUP BY c.id, c.name
      ORDER BY c.name ASC`;

    return response;
  }
}
