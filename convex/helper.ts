import type { Doc } from "./_generated/dataModel";

export const serializeRecipe = (recipe: Doc<"recipes">, imageUrl: string) => {
  return {
    id: recipe._id,
    imageUrl,
    recipeSchema: recipe.recipeSchema,
  };
};

export type SerializedRecipe = ReturnType<typeof serializeRecipe>;
