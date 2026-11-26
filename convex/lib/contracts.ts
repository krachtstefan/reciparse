import { z } from "zod";
import type { SchemaOrgRecipeFields } from "../validators/recipe";

const text = z.string().max(10_000);
const language = z
  .string()
  .max(100)
  .refine((value) => {
    if (!value) {
      return true;
    }
    try {
      return Intl.getCanonicalLocales(value).length === 1;
    } catch {
      return false;
    }
  }, "Use a BCP 47 language tag, for example en or de.");
const duration = z
  .string()
  .max(100)
  .regex(/^$|^P(?=\d|T\d)(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)$/)
  .describe("ISO 8601 duration, for example PT30M. Empty if unknown.");

export const recipeInput = z.strictObject({
  name: z.string().trim().min(1).max(300),
  description: text.default(""),
  inLanguage: language.default(""),
  recipeYield: z.string().max(300).default(""),
  prepTime: duration.default(""),
  cookTime: duration.default(""),
  totalTime: duration.default(""),
  recipeIngredient: z.array(text).max(200),
  recipeInstructions: z.array(text).max(200),
  notes: text.default(""),
  nutrition: text.default(""),
});

export const readInput = z.strictObject({
  recipeId: z.string().min(1).max(100),
});
export const versionedInput = readInput.extend({
  expectedVersion: z.number().int().positive(),
});
export const listInput = z.strictObject({
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().max(4096).nullable().default(null),
});

export function toStoredRecipe(
  input: z.infer<typeof recipeInput>
): SchemaOrgRecipeFields & { status: "success" } {
  return {
    status: "success",
    context: "https://schema.org",
    type: "Recipe",
    name: input.name,
    description: input.description,
    ...(input.inLanguage ? { inLanguage: input.inLanguage } : {}),
    image: [],
    recipeYield: input.recipeYield,
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    totalTime: input.totalTime,
    recipeIngredient: input.recipeIngredient,
    recipeInstructions: input.recipeInstructions.map((text) => ({
      type: "HowToStep",
      text,
    })),
    comment: { type: "Comment", text: input.notes },
    nutrition: { type: "NutritionInformation", description: input.nutrition },
  };
}
