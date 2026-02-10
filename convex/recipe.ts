import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { serializeRecipe } from "./helper";
import { workflow } from "./workflow";

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const HEADLINE_MIN_LENGTH = 5;
const HEADLINE_MAX_LENGTH = 80;

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

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
      headlineStatus: args.imageId ? "pending" : undefined,
    });

    if (args.imageId) {
      await workflow.start(ctx, internal.recipe.generateHeadlineWorkflow, {
        recipeId,
      });
    }
  },
});

export const generateHeadlineWorkflow = workflow.define({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (step, args): Promise<void> => {
    try {
      const { imageUrl } = await step.runQuery(
        internal.recipe.getRecipeHeadlineInput,
        { recipeId: args.recipeId }
      );

      const headline = await step.runAction(
        internal.recipe.generateHeadlineFromImage,
        { imageUrl },
        { retry: true }
      );

      await step.runMutation(internal.recipe.updateRecipeHeadline, {
        recipeId: args.recipeId,
        headline,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await step.runMutation(internal.recipe.markHeadlineFailed, {
        recipeId: args.recipeId,
        error: message,
      });
    }
  },
});

export const generateHeadlineFromImage = internalAction({
  args: {
    imageUrl: v.string(),
  },
  returns: v.string(),
  handler: async (_ctx, args) => {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const { text } = await generateText({
      model: openrouter(DEFAULT_MODEL),
      messages: [
        {
          role: "system",
          content:
            "You generate concise recipe headlines from images. Output only the headline.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a short, descriptive recipe headline based on this image.",
            },
            {
              type: "image",
              image: args.imageUrl,
            },
          ],
        },
      ],
      temperature: 0.3,
    });

    return sanitizeHeadline(text);
  },
});

export const getRecipeHeadlineInput = internalQuery({
  args: {
    recipeId: v.id("recipes"),
  },
  returns: v.object({
    imageUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    if (!recipe.imageId) {
      throw new Error("Recipe has no image");
    }

    const imageUrl = await ctx.storage.getUrl(recipe.imageId);
    if (!imageUrl) {
      throw new Error("Unable to resolve image URL");
    }

    return { imageUrl };
  },
});

export const updateRecipeHeadline = internalMutation({
  args: {
    recipeId: v.id("recipes"),
    headline: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      title: args.headline,
      headlineStatus: "completed",
      headlineUpdatedAt: Date.now(),
      headlineError: undefined,
    });
  },
});

export const markHeadlineFailed = internalMutation({
  args: {
    recipeId: v.id("recipes"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      headlineStatus: "failed",
      headlineError: args.error,
      headlineUpdatedAt: Date.now(),
    });
  },
});

const sanitizeHeadline = (headline: string): string => {
  const trimmed = headline.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, "");
  const collapsed = unquoted.replace(/\s+/g, " ").replace(/[.!?]+$/g, "");

  if (collapsed.length < HEADLINE_MIN_LENGTH) {
    throw new Error("Generated headline is too short");
  }

  if (collapsed.length > HEADLINE_MAX_LENGTH) {
    throw new Error("Generated headline is too long");
  }

  return collapsed;
};
