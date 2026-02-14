import { v } from "convex/values";

export const melaRecipeFieldsValidator = v.object({
  id: v.string(),
  title: v.string(),
  text: v.string(),
  images: v.array(v.string()),
  categories: v.array(v.string()),
  yield: v.string(),
  prepTime: v.string(),
  cookTime: v.string(),
  totalTime: v.string(),
  ingredients: v.string(),
  instructions: v.string(),
  notes: v.string(),
  nutrition: v.string(),
  link: v.string(),
});

export const melaRecipeValidator = v.object({
  result: v.union(
    v.object({
      status: v.literal("success"),
      ...melaRecipeFieldsValidator.fields,
    }),
    v.object({
      status: v.literal("failed"),
      reason: v.string(),
    })
  ),
});
