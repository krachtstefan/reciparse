import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { serializeRecipe } from "./helper";
import { workflow } from "./workflow";

export const getRecipes = query({
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();
    return Promise.all(
      recipes.map(async (recipe) => {
        const imageUrl = recipe.imageId
          ? await ctx.storage.getUrl(recipe.imageId)
          : null;

        return serializeRecipe(recipe, imageUrl);
      })
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
    const title = args.title.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    const recipeId = await ctx.db.insert("recipes", {
      title,
      imageId: args.imageId,
    });

    if (args.imageId) {
      await workflow.start(
        ctx,
        internal.workflow.recipe.generateHeadlineWorkflow,
        {
          recipeId,
        }
      );
    }
  },
});
