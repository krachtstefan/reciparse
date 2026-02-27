import { v } from "convex/values";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { serializeRecipe } from "./helper";
import { workflow } from "./workflow";

export const getRecipe = query({
  args: {
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const { recipeId } = args;
    const idNormalized = ctx.db.normalizeId("recipes", recipeId);
    if (!idNormalized) {
      return null;
    }

    const recipe = await ctx.db.get(idNormalized);
    if (!recipe) {
      return null;
    }

    const imageUrl = await ctx.storage.getUrl(recipe.imageId);

    if (!imageUrl) {
      throw new Error("image not found");
    }
    return serializeRecipe(recipe, imageUrl);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createRecipe = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const recipeId = await ctx.db.insert("recipes", {
      imageId: args.imageId,
      recipeSchema: {
        status: "pending",
      },
    });

    await workflow.start(
      ctx,
      internal.workflow.recipe.generateHeadlineWorkflow,
      {
        recipeId,
      }
    );

    return recipeId;
  },
});
