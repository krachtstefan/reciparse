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

const melaRecipeSchema = z.object({
  result: z
    .union([
      z
        .object({
          status: z
            .literal("success")
            .describe("The recipe was successfully extracted"),
          id: z.string().min(1).describe("Unique identifier for the recipe"),
          title: z.string().min(1).describe("Recipe title"),
          text: z
            .string()
            .describe("Short description displayed after the title"),
          images: z
            .array(z.string())
            .describe("Array of base64-encoded image strings"),
          categories: z.array(z.string()).describe("Recipe categories"),
          yield: z.string().describe("Number of servings the recipe makes"),
          prepTime: z.string().describe("Preparation time"),
          cookTime: z.string().describe("Cooking time"),
          totalTime: z.string().describe("Total time (prep + cook)"),
          ingredients: z
            .string()
            .describe(
              "Newline-separated list of ingredients with Markdown support"
            ),
          instructions: z
            .string()
            .describe(
              "Newline-separated cooking instructions with Markdown support"
            ),
          notes: z.string().describe("Additional notes with Markdown support"),
          nutrition: z
            .string()
            .describe("Nutritional information with Markdown support"),
          link: z.string().describe("Source of the recipe"),
        })
        .strict(),
      z
        .object({
          status: z.literal("failed").describe("The recipe extraction failed"),
          reason: z.string().describe("Reason for the failure"),
        })
        .strict(),
    ])
    .describe("The recipe extraction result"),
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

    try {
      const { object } = await generateObject({
        model: openrouter(DEFAULT_MODEL),
        schema: melaRecipeSchema,
        messages: [
          {
            role: "system",
            content:
              "You generate a Mela .melarecipe JSON object from an image. Output only valid JSON with all required fields. The response must be wrapped in a 'result' object that contains a 'status' field of either 'success' or 'failed'.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Generate a complete .melarecipe JSON for the dish in this image.\n\nRequirements:\n- Output only JSON, no markdown or code fences.\n- Keep the original language from the source.\n- Wrap the entire response in a 'result' object.\n- The 'result' object must contain a 'status' field with value 'success' or 'failed'.\n- If status is 'success', include all recipe fields in result: id, title, text, images, categories, yield, prepTime, cookTime, totalTime, ingredients, instructions, notes, nutrition, link.\n- If status is 'failed', include a 'reason' field in result explaining why extraction failed.\n- Use empty strings for unknown string fields and empty arrays for unknown lists.\n- categories: Always set to an empty array [].\n- ingredients: newline-separated string (\\n). Supports Markdown: links and # for group titles.\n- instructions: newline-separated string (\\n). Supports Markdown: #, *, **, and links.\n- notes: Supports Markdown: #, *, **, and links.\n- nutrition: Supports Markdown: #, *, **, and links.\n- text: Short description displayed after title. Supports Markdown: links only.\n- id: Use a UUID or recipe name as identifier. Do not leave empty.\n- link: Source of the recipe (can be any string, not just URL).\n- images: Array of base64-encoded image strings; empty array if none.\n",
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
    } catch (error) {
      console.error(error);
      return {
        result: {
          status: "failed" as const,
          reason:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    }
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
