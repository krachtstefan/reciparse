import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
    headlineStatus: v.optional(
      v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))
    ),
    headlineError: v.optional(v.string()),
    headlineUpdatedAt: v.optional(v.number()),
  }),
});
