import type { Doc } from "./_generated/dataModel";

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
) => ({
  id: recipe._id,
  imageUrl,
  status: recipe.status,
  melaRecipe: recipe.melaRecipe,
});
