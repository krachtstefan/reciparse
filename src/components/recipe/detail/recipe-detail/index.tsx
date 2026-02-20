import type { SchemaOrgRecipeFields } from "convex/validators/recipe";
import { Separator } from "@/components/ui/separator";
import { RecipeHeader } from "./header";
import { IngredientList } from "./ingredients";
import { InstructionList } from "./instructions";
import { RecipeMeta } from "./meta";
import { RecipeNotes } from "./notes";
import { RecipeNutrition } from "./nutrition";

type RecipeDetailProps = {
  recipe: SchemaOrgRecipeFields;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  recipe.totalTime;
  const hasIngredients = recipe.recipeIngredient.length > 0;
  const hasInstructions = recipe.recipeInstructions.length > 0;

  return (
    <div className="space-y-6">
      <RecipeHeader recipe={recipe} />

      <Separator />
      <RecipeMeta recipe={recipe} />

      {hasIngredients && (
        <>
          <Separator />
          <IngredientList ingredients={recipe.recipeIngredient} />
        </>
      )}

      {hasInstructions && (
        <>
          <Separator />
          <InstructionList instructions={recipe.recipeInstructions} />
        </>
      )}

      {recipe.comment.text && (
        <>
          <Separator />
          <RecipeNotes notes={recipe.comment.text} />
        </>
      )}

      {recipe.nutrition.description && (
        <>
          <Separator />
          <RecipeNutrition nutrition={recipe.nutrition.description} />
        </>
      )}
    </div>
  );
}
