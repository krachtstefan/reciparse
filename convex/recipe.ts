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

    const imageUrls = await Promise.all(
      recipe.imageIds.map(async (imageId) => await ctx.storage.getUrl(imageId))
    );
    const validImageUrls = imageUrls.filter(
      (imageUrl): imageUrl is string => imageUrl !== null
    );

    if (validImageUrls.length === 0) {
      throw new Error("image not found");
    }
    return serializeRecipe(recipe, validImageUrls);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createRecipe = mutation({
  args: {
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const recipeId = await ctx.db.insert("recipes", {
      imageIds: args.imageIds,
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
