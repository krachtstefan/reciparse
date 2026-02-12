import { ExtractedRecipePanel } from "./extracted-recipe-panel";
import { RecipeHeader } from "./recipe-header";

type RecipeDetailPageProps = {
  recipeId: string;
};

export function RecipeDetailPage({ recipeId }: RecipeDetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <RecipeHeader />
      <ExtractedRecipePanel recipeId={recipeId} />
    </div>
  );
}
