import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { schemaOrgRecipeValidator } from "../validators/recipe";
import { DEFAULT_MODEL, openrouter } from "./helper";
import { workflow } from "./index";

const schemaOrgRecipeSchema = z.object({
  result: z
    .union([
      z
        .object({
          status: z
            .literal("success")
            .describe("The recipe was successfully extracted"),
          context: z
            .literal("https://schema.org")
            .describe("Schema.org context URL"),
          type: z.literal("Recipe").describe("Schema.org type"),
          name: z.string().min(1).describe("Recipe title"),
          description: z.string().describe("Short description of the recipe"),
          inLanguage: z
            .string()
            .describe(
              "The language of the recipe content using IETF BCP 47 standard (e.g., 'en' for English, 'es' for Spanish, 'fr' for French). Used by Temporal API for localized duration formatting. If uncertain, default to 'en'."
            ),
          image: z.array(z.string()).describe("Array of image URLs"),
          recipeYield: z.string().describe("Number of servings"),
          prepTime: z.string().describe("Preparation time (ISO 8601 duration)"),
          cookTime: z.string().describe("Cooking time (ISO 8601 duration)"),
          totalTime: z.string().describe("Total time (ISO 8601 duration)"),
          recipeIngredient: z
            .array(z.string())
            .describe(
              "List of ingredients, including quantities and units, e.g. '1 cup flour' or '2 eggs'"
            ),
          recipeInstructions: z
            .array(
              z.object({
                type: z.literal("HowToStep"),
                text: z.string().describe("Instruction step text"),
              })
            )
            .describe("Cooking instructions as HowToStep array"),
          comment: z
            .object({
              type: z.literal("Comment"),
              text: z.string().describe("Additional notes"),
            })
            .describe("Recipe notes as Comment"),
          nutrition: z
            .object({
              type: z.literal("NutritionInformation"),
              description: z.string().describe("Nutritional information"),
            })
            .describe("Nutrition information"),
          url: z.string().describe("Source URL of the recipe"),
        })
        .strict(),
      z
        .object({
          status: z.literal("failed").describe("The recipe extraction failed"),
          reason: z.string().describe("Reason for the failure"),
        })
        .strict(),
    ])
    .describe("The recipe extraction result in schema.org/Recipe format"),
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

    try {
      const recipeSchema = await step.runAction(
        internal.workflow.recipe.generateSchemaOrgRecipeFromImage,
        { imageUrl },
        { retry: true }
      );

      await step.runMutation(
        internal.workflow.recipe.updateRecipeFromWorkflow,
        {
          recipeId: args.recipeId,
          recipeSchema,
        }
      );
    } catch (error) {
      await step.runMutation(
        internal.workflow.recipe.updateRecipeFromWorkflow,
        {
          recipeId: args.recipeId,
          recipeSchema: {
            result: {
              status: "failed",
              reason:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          },
        }
      );
      throw error;
    }
  },
});

export const generateSchemaOrgRecipeFromImage = internalAction({
  args: {
    imageUrl: v.string(),
  },
  returns: schemaOrgRecipeValidator,
  handler: async (_ctx, args) => {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    try {
      const { output } = await generateText({
        model: openrouter(DEFAULT_MODEL),
        output: Output.object({ schema: schemaOrgRecipeSchema }),
        messages: [
          {
            role: "system",
            content:
              "You are a recipe extraction assistant that analyzes images of recipes and outputs structured data in schema.org/Recipe format. Always return valid JSON wrapped in a 'result' object with a 'status' field ('success' or 'failed').",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract recipe details from this image or screenshot and return a schema.org/Recipe JSON object.\n\nRequirements:\n- Only extract information that is explicitly visible in the image text; do not infer or invent recipe details from food photos.\n- Output only JSON, no markdown or code fences.\n- Keep the original language from the source.\n- Keep the original wording as much as possible.\n- Detect the language of the recipe (e.g., 'en' for English, 'es' for Spanish, 'fr' for French) and include it in the inLanguage field.\n- Use empty strings for unknown string fields and empty arrays for unknown lists.\n- If multiple recipes are visible, extract only the most prominent one.\n",
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
      return output;
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
    recipeSchema: schemaOrgRecipeValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recipeId, {
      recipeSchema: args.recipeSchema,
    });
  },
});
