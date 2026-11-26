import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  type QueryCtx,
} from "./_generated/server";
import {
  listInput,
  readInput,
  recipeInput,
  toStoredRecipe,
  versionedInput,
} from "./lib/contracts";

const args = { ownerId: v.string(), input: v.any() };

async function ownedRecipe(ctx: QueryCtx, ownerId: string, recipeId: string) {
  const id = ctx.db.normalizeId("recipes", recipeId);
  const recipe = id ? await ctx.db.get(id) : null;
  if (!(recipe && ownerId) || recipe.ownerId !== ownerId) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Recipe not found in your account.",
    });
  }
  return recipe;
}

function checkVersion(recipe: Doc<"recipes">, expectedVersion: number) {
  if (recipe.version !== expectedVersion) {
    throw new ConvexError({
      code: "VERSION_CONFLICT",
      message: "Read the recipe again before editing or deleting it.",
    });
  }
}

function summary(recipe: Doc<"recipes">) {
  return {
    recipeId: recipe._id,
    version: recipe.version ?? 1,
    createdAt: recipe._creationTime,
    name:
      recipe.recipeSchema.status === "success" ? recipe.recipeSchema.name : "",
  };
}

export const list = internalQuery({
  args,
  handler: async (ctx, { ownerId, input }) => {
    const { limit, cursor } = listInput.parse(input);
    const result = await ctx.db
      .query("recipes")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .paginate({ numItems: limit, cursor });
    return {
      items: result.page.map(summary),
      nextCursor: result.isDone ? null : result.continueCursor,
    };
  },
});

export const read = internalQuery({
  args,
  handler: async (ctx, { ownerId, input }) => {
    const { recipeId } = readInput.parse(input);
    const recipe = await ownedRecipe(ctx, ownerId, recipeId);
    return { ...summary(recipe), recipe: recipe.recipeSchema };
  },
});

export const create = internalMutation({
  args,
  handler: async (ctx, { ownerId, input }) => {
    const recipeSchema = toStoredRecipe(recipeInput.parse(input));
    const recipeId = await ctx.db.insert("recipes", {
      ownerId,
      version: 1,
      imageIds: [],
      recipeSchema,
    });
    return { recipeId, version: 1, recipe: recipeSchema };
  },
});

export const update = internalMutation({
  args,
  handler: async (ctx, { ownerId, input }) => {
    const parsed = versionedInput.extend({ recipe: recipeInput }).parse(input);
    const recipe = await ownedRecipe(ctx, ownerId, parsed.recipeId);
    checkVersion(recipe, parsed.expectedVersion);
    const version = parsed.expectedVersion + 1;
    const recipeSchema = toStoredRecipe(parsed.recipe);
    await ctx.db.patch(recipe._id, { recipeSchema, version });
    return { recipeId: recipe._id, version, recipe: recipeSchema };
  },
});

export const remove = internalMutation({
  args,
  handler: async (ctx, { ownerId, input }) => {
    const parsed = versionedInput.parse(input);
    const recipe = await ownedRecipe(ctx, ownerId, parsed.recipeId);
    checkVersion(recipe, parsed.expectedVersion);
    await ctx.db.delete(recipe._id);
    return { recipeId: recipe._id, deleted: true };
  },
});
