import type { Doc } from "./_generated/dataModel";

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrls: string[]
) => {
  return {
    id: recipe._id,
    imageUrls,
    recipeSchema: recipe.recipeSchema,
  };
};

export type SerializedRecipe = ReturnType<typeof serializeRecipe>;
