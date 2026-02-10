import { generateText } from "ai";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { DEFAULT_MODEL, openrouter, sanitizeHeadline } from "./helper";
import { workflow } from "./index";

export const generateHeadlineWorkflow = workflow.define({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (step, args): Promise<void> => {
    const { imageUrl } = await step.runQuery(
      internal.workflow.recipe.getRecipeHeadlineInput,
      { recipeId: args.recipeId }
    );

    const headline = await step.runAction(
      internal.workflow.recipe.generateHeadlineFromImage,
      { imageUrl },
      { retry: true }
    );

    await step.runMutation(internal.workflow.recipe.updateRecipeHeadline, {
      recipeId: args.recipeId,
      headline,
    });
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
    });
  },
});
