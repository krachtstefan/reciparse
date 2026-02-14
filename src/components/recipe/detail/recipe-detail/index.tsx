import { Separator } from "@/components/ui/separator";
import type { MelaRecipeFields } from "../../../../../convex/helper";
import { RecipeHeader } from "./header";
import { IngredientList } from "./ingredients";
import { InstructionList } from "./instructions";
import { RecipeMeta } from "./meta";
import { RecipeNotes } from "./notes";
import { RecipeNutrition } from "./nutrition";

type RecipeDetailProps = {
  recipe: MelaRecipeFields;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const hasMeta =
    recipe.prepTime || recipe.cookTime || recipe.yield || recipe.totalTime;
  const hasIngredients = recipe.ingredients;
  const hasInstructions = recipe.instructions;

  return (
    <div className="space-y-6">
      <RecipeHeader recipe={recipe} />

      {hasMeta && (
        <>
          <Separator />
          <RecipeMeta recipe={recipe} />
        </>
      )}

      {hasIngredients && (
        <>
          <Separator />
          <IngredientList ingredients={recipe.ingredients} />
        </>
      )}

      {hasInstructions && (
        <>
          <Separator />
          <InstructionList instructions={recipe.instructions} />
        </>
      )}

      {recipe.notes && (
        <>
          <Separator />
          <RecipeNotes notes={recipe.notes} />
        </>
      )}

      {recipe.nutrition && (
        <>
          <Separator />
          <RecipeNutrition nutrition={recipe.nutrition} />
        </>
      )}
    </div>
  );
}
