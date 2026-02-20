import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { schemaOrgRecipeValidator } from "./validators/recipe";

export default defineSchema({
  recipes: defineTable({
    imageId: v.id("_storage"),
    recipeSchema: schemaOrgRecipeValidator,
  }),
});
