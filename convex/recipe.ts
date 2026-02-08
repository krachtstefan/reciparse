import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getRecipes = query({
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    return Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        imageUrl: recipe.imageId
          ? await ctx.storage.getUrl(recipe.imageId)
          : null,
      }))
    );
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createRecipe = mutation({
  args: {
    title: v.string(),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recipes", {
      title: args.title,
      imageId: args.imageId,
    });
  },
});
