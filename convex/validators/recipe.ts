import { v } from "convex/values";

export const schemaOrgRecipeFieldsValidator = v.object({
  context: v.string(),
  type: v.literal("Recipe"),
  name: v.string(),
  description: v.string(),
  inLanguage: v.optional(v.string()),
  image: v.array(v.string()),
  recipeYield: v.string(),
  prepTime: v.string(),
  cookTime: v.string(),
  totalTime: v.string(),
  recipeIngredient: v.array(v.string()),
  recipeInstructions: v.array(
    v.object({
      type: v.literal("HowToStep"),
      text: v.string(),
    })
  ),
  comment: v.object({
    type: v.literal("Comment"),
    text: v.string(),
  }),
  nutrition: v.object({
    type: v.literal("NutritionInformation"),
    description: v.string(),
  }),
  url: v.string(),
});

export const schemaOrgRecipeValidator = v.object({
  result: v.union(
    v.object({
      status: v.literal("pending"),
    }),
    v.object({
      status: v.literal("success"),
      ...schemaOrgRecipeFieldsValidator.fields,
    }),
    v.object({
      status: v.literal("failed"),
      reason: v.string(),
    })
  ),
});
