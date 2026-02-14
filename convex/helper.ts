import type { Infer } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { melaRecipeFieldsValidator } from "./validators/recipe";

export type MelaRecipeFields = Infer<typeof melaRecipeFieldsValidator>;

type BaseRecipe = {
  id: string;
  imageUrl: string | null;
};

export type SerializedRecipe =
  | (BaseRecipe & { status: "pending" })
  | (BaseRecipe & {
      status: "succeeded";
      melaRecipe: { result: { status: "success" } & MelaRecipeFields };
    })
  | (BaseRecipe & { status: "failed"; reason: string });

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
): SerializedRecipe => {
  if (!recipe.melaRecipe) {
    return {
      id: recipe._id,
      imageUrl,
      status: "pending",
    };
  }

  if (recipe.melaRecipe.result.status === "success") {
    return {
      id: recipe._id,
      imageUrl,
      status: "succeeded",
      melaRecipe: recipe.melaRecipe as {
        result: { status: "success" } & MelaRecipeFields;
      },
    };
  }

  return {
    id: recipe._id,
    imageUrl,
    status: "failed",
    reason: recipe.melaRecipe.result.reason,
  };
};
