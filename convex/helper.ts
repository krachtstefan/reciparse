import type { Infer } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { schemaOrgRecipeFieldsValidator } from "./validators/recipe";

export type SchemaOrgRecipeFields = Infer<
  typeof schemaOrgRecipeFieldsValidator
>;

type BaseRecipe = {
  id: string;
  imageUrl: string | null;
};

export type SerializedRecipe =
  | (BaseRecipe & { status: "pending" })
  | (BaseRecipe & {
      status: "succeeded";
      recipeSchema: { result: { status: "success" } & SchemaOrgRecipeFields };
    })
  | (BaseRecipe & { status: "failed"; reason: string });

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
): SerializedRecipe => {
  if (!recipe.recipeSchema) {
    return {
      id: recipe._id,
      imageUrl,
      status: "pending",
    };
  }

  if (recipe.recipeSchema.result.status === "success") {
    return {
      id: recipe._id,
      imageUrl,
      status: "succeeded",
      recipeSchema: recipe.recipeSchema as {
        result: { status: "success" } & SchemaOrgRecipeFields;
      },
    };
  }

  return {
    id: recipe._id,
    imageUrl,
    status: "failed",
    reason: recipe.recipeSchema.result.reason,
  };
};
