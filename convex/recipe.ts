import { v } from "convex/values";
import { MAX_RECIPE_UPLOAD_IMAGES } from "../shared/recipe";
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

    const [primaryImageId] = recipe.imageIds;
    const imageUrl = primaryImageId
      ? await ctx.storage.getUrl(primaryImageId)
      : null;

    return serializeRecipe(recipe, imageUrl ?? "");
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
    const { imageIds } = args;

    if (imageIds.length === 0) {
      throw new Error("At least one image is required");
    }

    if (imageIds.length > MAX_RECIPE_UPLOAD_IMAGES) {
      throw new Error(
        `A maximum of ${MAX_RECIPE_UPLOAD_IMAGES} images can be uploaded per recipe`
      );
    }

    const recipeId = await ctx.db.insert("recipes", {
      imageIds,
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
