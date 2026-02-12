import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetailPage } from "@/components/recipe/recipe-detail-page";

export const Route = createFileRoute("/recipe/$recipeId")({
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipeId } = Route.useParams();

  return <RecipeDetailPage recipeId={recipeId} />;
}
