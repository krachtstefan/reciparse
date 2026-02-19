import type { Infer } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { schemaOrgRecipeFieldsValidator } from "./validators/recipe";

export type SchemaOrgRecipeFields = Infer<
  typeof schemaOrgRecipeFieldsValidator
>;

export const serializeRecipe = (recipe: Doc<"recipes">, imageUrl: string) => {
  return {
    id: recipe._id,
    imageUrl,
    recipeSchema: recipe.recipeSchema,
  };
};

export type SerializedRecipe = ReturnType<typeof serializeRecipe>;
