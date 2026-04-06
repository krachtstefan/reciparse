import { v } from "convex/values";
import { MAX_RECIPE_UPLOAD_IMAGES } from "../shared/recipe";
import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getRecipeImageIds, serializeRecipe } from "./helper";
import { workflow } from "./workflow";

const DEFAULT_MIGRATION_BATCH_SIZE = 100;

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

    const [primaryImageId] = getRecipeImageIds(recipe);
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
    imageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const imageIds = args.imageIds ?? (args.imageId ? [args.imageId] : []);

    if (args.imageId && args.imageIds) {
      throw new Error("Pass either imageId or imageIds, not both");
    }

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

export const getRecipeImageMigrationStatus = internalQuery({
  handler: async (ctx) => {
    const recipes = await ctx.db.query("recipes").collect();

    let migratedRecipeCount = 0;
    let legacyRecipeCount = 0;
    let mixedRecipeCount = 0;
    let missingImageCount = 0;

    for (const recipe of recipes) {
      const hasImageIds = Boolean(
        recipe.imageIds && recipe.imageIds.length > 0
      );
      const hasLegacyImageId = Boolean(recipe.imageId);

      if (hasImageIds && hasLegacyImageId) {
        mixedRecipeCount += 1;
        continue;
      }

      if (hasImageIds) {
        migratedRecipeCount += 1;
        continue;
      }

      if (hasLegacyImageId) {
        legacyRecipeCount += 1;
        continue;
      }

      missingImageCount += 1;
    }

    return {
      totalRecipeCount: recipes.length,
      migratedRecipeCount,
      legacyRecipeCount,
      mixedRecipeCount,
      missingImageCount,
    };
  },
});

export const backfillRecipeImageIds = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize ?? DEFAULT_MIGRATION_BATCH_SIZE;
    if (batchSize <= 0) {
      throw new Error("batchSize must be greater than 0");
    }

    const recipes = await ctx.db.query("recipes").collect();
    const legacyRecipes = recipes
      .filter(
        (
          recipe
        ): recipe is typeof recipe & {
          imageId: NonNullable<typeof recipe.imageId>;
        } => Boolean(recipe.imageId) && !recipe.imageIds
      )
      .slice(0, batchSize);

    for (const recipe of legacyRecipes) {
      await ctx.db.patch(recipe._id, {
        imageIds: [recipe.imageId],
      });
    }

    return {
      scannedRecipeCount: recipes.length,
      updatedRecipeCount: legacyRecipes.length,
      remainingLegacyRecipeCount:
        recipes.filter((recipe) => recipe.imageId && !recipe.imageIds).length -
        legacyRecipes.length,
    };
  },
});
