import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { schemaOrgRecipeValidator } from "./validators/recipe";

export default defineSchema({
  recipes: defineTable({
    ownerId: v.optional(v.string()),
    version: v.optional(v.number()),
    imageIds: v.array(v.id("_storage")),
    recipeSchema: schemaOrgRecipeValidator,
  }).index("by_owner", ["ownerId"]),
});
