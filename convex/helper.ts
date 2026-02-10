import type { Doc } from "./_generated/dataModel";

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
): {
  id: Doc<"recipes">["_id"];
  title: string;
  imageUrl: string | null;
  status: Doc<"recipes">["status"];
  melaRecipe?: Doc<"recipes">["melaRecipe"];
} => ({
  id: recipe._id,
  title: recipe.melaRecipe?.title ?? "",
  imageUrl,
  status: recipe.status,
  melaRecipe: recipe.melaRecipe,
});
