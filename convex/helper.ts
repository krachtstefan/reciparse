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

type RecipeSchema = Doc<"recipes">["recipeSchema"];

type PendingRecipeSchema = {
  result: { status: "pending" };
};

type SerializedRecipeSchema = PendingRecipeSchema | NonNullable<RecipeSchema>;

export type SerializedRecipe = BaseRecipe & {
  recipeSchema: SerializedRecipeSchema;
};

export const serializeRecipe = (
  recipe: Doc<"recipes">,
  imageUrl: string | null
): SerializedRecipe => {
  if (!recipe.recipeSchema) {
    return {
      id: recipe._id,
      imageUrl,
      recipeSchema: {
        result: {
          status: "pending",
        },
      },
    };
  }

  return {
    id: recipe._id,
    imageUrl,
    recipeSchema: recipe.recipeSchema,
  };
};
