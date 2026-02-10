import { v } from "convex/values";

export const melaRecipeValidator = v.object({
  id: v.string(),
  title: v.string(),
  text: v.string(),
  images: v.array(v.string()),
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

export const recipeStatusValidator = v.union(
  v.literal("pending"),
  v.literal("in_progress"),
  v.literal("succeeded"),
  v.literal("failed")
);
