import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import {
  melaRecipeValidator,
  recipeStatusValidator,
} from "../validators/recipe";
import { DEFAULT_MODEL, openrouter } from "./helper";
import { workflow } from "./index";

const melaRecipeSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    text: z.string(),
    images: z.array(z.string()),
    categories: z.array(z.string()),
    yield: z.string(),
    prepTime: z.string(),
    cookTime: z.string(),
    totalTime: z.string(),
    ingredients: z.string(),
    instructions: z.string(),
    notes: z.string(),
    nutrition: z.string(),
    link: z.string(),
  })
  .strict();

export const generateHeadlineWorkflow = workflow.define({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (step, args): Promise<void> => {
    const { imageUrl } = await step.runQuery(
      internal.workflow.recipe.getRecipeImageUrl,
      { recipeId: args.recipeId }
    );

    await step.runMutation(internal.workflow.recipe.updateRecipeStatus, {
      recipeId: args.recipeId,
      status: "in_progress",
    });

    try {
      const melaRecipe = await step.runAction(
        internal.workflow.recipe.generateMelaRecipeFromImage,
        { imageUrl },
        { retry: true }
      );

      await step.runMutation(
        internal.workflow.recipe.updateRecipeFromWorkflow,
        {
          recipeId: args.recipeId,
          melaRecipe,
        }
      );
    } catch (error) {
      await step.runMutation(internal.workflow.recipe.updateRecipeStatus, {
        recipeId: args.recipeId,
        status: "failed",
      });
      throw error;
    }
  },
});

export const generateMelaRecipeFromImage = internalAction({
  args: {
    imageUrl: v.string(),
  },
  returns: melaRecipeValidator,
  handler: async (_ctx, args) => {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    const { object } = await generateObject({
      model: openrouter(DEFAULT_MODEL),
      schema: melaRecipeSchema,
      messages: [
        {
          role: "system",
          content:
            "You generate a Mela .melarecipe JSON object from an image. Output only valid JSON with all required fields.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a complete .melarecipe JSON for the dish in this image.\n\nRequirements:\n- Output only JSON, no markdown or code fences.\n- Include these fields: id, title, text, images, categories, yield, prepTime, cookTime, totalTime, ingredients, instructions, notes, nutrition, link.\n- Use empty strings for unknown string fields and empty arrays for unknown lists.\n- categories: Always set to an empty array [].\n- ingredients: newline-separated string (\\n). Supports Markdown: links and # for group titles.\n- instructions: newline-separated string (\\n). Supports Markdown: #, *, **, and links.\n- notes: Supports Markdown: #, *, **, and links.\n- nutrition: Supports Markdown: #, *, **, and links.\n- text: Short description displayed after title. Supports Markdown: links only.\n- id: Use a UUID or recipe name as identifier. Do not leave empty.\n- link: Source of the recipe (can be any string, not just URL).\n- images: Array of base64-encoded image strings; empty array if none.\n",
            },
            {
              type: "image",
              image: args.imageUrl,
            },
          ],
        },
      ],
      temperature: 0.4,
    });

    return object;
  },
});

export const getRecipeImageUrl = internalQuery({
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

export const updateRecipeFromWorkflow = internalMutation({
  args: {
    recipeId: v.id("recipes"),
    melaRecipe: melaRecipeValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      melaRecipe: args.melaRecipe,
      status: "succeeded",
    });
  },
});

export const updateRecipeStatus = internalMutation({
  args: {
    recipeId: v.id("recipes"),
    status: recipeStatusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      status: args.status,
    });
  },
});
