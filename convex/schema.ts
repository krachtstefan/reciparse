import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  melaRecipeValidator,
  recipeStatusValidator,
} from "./validators/recipe";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    status: recipeStatusValidator,
    melaRecipe: v.optional(melaRecipeValidator),
  }),
});
