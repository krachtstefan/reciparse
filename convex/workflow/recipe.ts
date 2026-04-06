import { generateText, Output } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { MAX_RECIPE_UPLOAD_IMAGES } from "../../shared/recipe";
import { internal } from "../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { getRecipeImageIds } from "../helper";
import { schemaOrgRecipeValidator } from "../validators/recipe";
import { DEFAULT_MODEL, openrouter } from "./helper";
import { workflow } from "./index";

const createSchemaOrgRecipeSchema = (imageUrls: string[]) =>
  z.object({
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
            image: z
              .array(
                z.string().refine((value) => imageUrls.includes(value), {
                  message:
                    "Image URL must be one of the uploaded source images",
                })
              )
              .describe("Array of image URLs constrained to source images"),
            recipeYield: z.string().describe("Number of servings"),
            prepTime: z
              .string()
              .describe("Preparation time (ISO 8601 duration)"),
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
          })
          .strict(),
        z
          .object({
            status: z
              .literal("failed")
              .describe("The recipe extraction failed"),
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
    const { imageUrls } = await step.runQuery(
      internal.workflow.recipe.getRecipeImageUrls,
      { recipeId: args.recipeId }
    );

    try {
      const recipeSchema = await step.runAction(
        internal.workflow.recipe.generateSchemaOrgRecipeFromImage,
        { imageUrls },
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
            status: "failed",
            reason:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        }
      );
      throw error;
    }
  },
});

export const generateSchemaOrgRecipeFromImage = internalAction({
  args: {
    imageUrls: v.array(v.string()),
  },
  returns: schemaOrgRecipeValidator,
  handler: async (_ctx, args) => {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    if (args.imageUrls.length === 0) {
      throw new Error("At least one image is required");
    }

    try {
      const { output } = await generateText({
        model: openrouter(DEFAULT_MODEL),
        output: Output.object({
          schema: createSchemaOrgRecipeSchema(args.imageUrls),
        }),
        messages: [
          {
            role: "system",
            content:
              "You are a recipe extraction assistant that analyzes one ordered set of recipe images and outputs structured data in schema.org/Recipe format. Treat the images as sequential pages or screenshots for a single recipe only when the content clearly supports that conclusion. If the images appear to contain multiple recipes, conflicting recipe details, or an uncertain match across pages, return a failed result instead of guessing. Always return valid JSON wrapped in a 'result' object with a 'status' field ('success' or 'failed').",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract recipe details from this ordered set of recipe images and return a schema.org/Recipe JSON object.\n\nThe images are provided in reading order. Earlier images come first, and later images may continue ingredients, instructions, notes, or metadata from previous images.\n\nRequirements:\n- Only extract information that is explicitly visible in the image text; do not infer or invent recipe details from food photos.\n- Consider all uploaded images together as one recipe only when the pages clearly belong to the same recipe.\n- Respect the provided image order when combining split sections across pages or screenshots.\n- If the uploaded images appear to contain multiple recipes, conflicting recipe titles, conflicting ingredient lists, conflicting instructions, or uncertain page-to-page continuity, return `status: \"failed\"` with a clear `reason` instead of guessing.\n- Output only JSON, no markdown or code fences.\n- Keep the original language from the source.\n- Keep the original wording as much as possible.\n- Detect the language of the recipe (e.g., 'en' for English, 'es' for Spanish, 'fr' for French) and include it in the inLanguage field.\n- Use empty strings for unknown string fields and empty arrays for unknown lists.\n- Use the uploaded source image URLs in the same order they were provided.\n",
              },
              ...args.imageUrls.map((imageUrl) => ({
                type: "image" as const,
                image: imageUrl,
              })),
            ],
          },
        ],
        temperature: 0.4,
      });

      if (output.result.status === "success") {
        // The model may return any subset/order of the uploaded URLs, but the
        // stored recipe should always reflect the canonical uploaded source order.
        return {
          ...output.result,
          image: args.imageUrls,
        };
      }

      return output.result;
    } catch (error) {
      console.error(error);
      return {
        status: "failed" as const,
        reason:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

export const getRecipeImageUrls = internalQuery({
  args: {
    recipeId: v.id("recipes"),
  },
  returns: v.object({
    imageUrls: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const imageIds = getRecipeImageIds(recipe);
    if (imageIds.length === 0) {
      throw new Error("Recipe has no images");
    }

    if (imageIds.length > MAX_RECIPE_UPLOAD_IMAGES) {
      throw new Error(
        `Recipe exceeds the maximum of ${MAX_RECIPE_UPLOAD_IMAGES} images`
      );
    }

    const imageUrls = await Promise.all(
      imageIds.map(async (imageId) => {
        const imageUrl = await ctx.storage.getUrl(imageId);
        if (!imageUrl) {
          throw new Error("Unable to resolve image URL");
        }

        return imageUrl;
      })
    );

    return { imageUrls };
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
