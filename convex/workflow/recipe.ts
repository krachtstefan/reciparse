import { generateText } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
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

const melaRecipeValidator = v.object({
  id: v.string(),
  title: v.string(),
  text: v.string(),
  images: v.array(v.string()),
  categories: v.array(v.string()),
  yield: v.string(),
  prepTime: v.string(),
  cookTime: v.string(),
  totalTime: v.string(),
  ingredients: v.string(),
  instructions: v.string(),
  notes: v.string(),
  nutrition: v.string(),
  link: v.string(),
});

export const generateHeadlineWorkflow = workflow.define({
  args: {
    recipeId: v.id("recipes"),
  },
  handler: async (step, args): Promise<void> => {
    const { imageUrl } = await step.runQuery(
      internal.workflow.recipe.getRecipeImageUrl,
      { recipeId: args.recipeId }
    );

    const melaRecipe = await step.runAction(
      internal.workflow.recipe.generateMelaRecipeFromImage,
      { imageUrl },
      { retry: true }
    );

    await step.runMutation(internal.workflow.recipe.updateRecipeFromWorkflow, {
      recipeId: args.recipeId,
      melaRecipe,
    });
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

    const { text } = await generateText({
      model: openrouter(DEFAULT_MODEL),
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
              text: "Generate a complete .melarecipe JSON for the dish in this image.\n\nRequirements:\n- Output only JSON, no markdown or code fences.\n- Include all fields: id, title, text, images, categories, yield, prepTime, cookTime, totalTime, ingredients, instructions, notes, nutrition, link.\n- Use empty strings for unknown string fields and empty arrays for unknown lists.\n- ingredients and instructions must be newline-separated strings.\n- categories must not include commas.\n- images must be base64 strings if provided; otherwise empty array.\n",
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

    return melaRecipeSchema.parse(JSON.parse(text));
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
      title: args.melaRecipe.title,
      melaRecipe: args.melaRecipe,
    });
  },
});
