import type { Doc } from "./_generated/dataModel";

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
) => {
  const getStatus = (): "pending" | "succeeded" | "failed" => {
    if (!recipe.melaRecipe) {
      return "pending";
    }

    if (recipe.melaRecipe.result.status === "success") {
      return "succeeded";
    }

    return "failed";
  };

  return {
    id: recipe._id,
    imageUrl,
    status: getStatus(),
    melaRecipe: recipe.melaRecipe,
  };
};
