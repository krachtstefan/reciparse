import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { melaRecipeValidator } from "./validators/recipe";

export default defineSchema({
  recipes: defineTable({
    imageId: v.id("_storage"),
    melaRecipe: v.optional(melaRecipeValidator),
  }),
});
