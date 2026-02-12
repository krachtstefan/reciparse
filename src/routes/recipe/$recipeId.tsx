import { createFileRoute } from "@tanstack/react-router";
import { RecipeParser } from "@/components/recipe/recipe-parser";
export const Route = createFileRoute("/recipe/$recipeId")({
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipeId } = Route.useParams();

  return <RecipeParser recipeId={recipeId} />;
}
