import type { Doc, Id } from "./_generated/dataModel";

export const getRecipeImageIds = (recipe: Doc<"recipes">): Id<"_storage">[] => {
  if (recipe.imageIds && recipe.imageIds.length > 0) {
    return recipe.imageIds;
  }

  if (recipe.imageId) {
    return [recipe.imageId];
  }

  return [];
};

export const serializeRecipe = (recipe: Doc<"recipes">, imageUrl: string) => {
  return {
    id: recipe._id,
    imageUrl,
    recipeSchema: recipe.recipeSchema,
  };
};

export type SerializedRecipe = ReturnType<typeof serializeRecipe>;
