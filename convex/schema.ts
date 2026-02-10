import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("succeeded"),
      v.literal("failed")
    ),
    melaRecipe: v.optional(
      v.object({
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
      })
    ),
  }),
});
