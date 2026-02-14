import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/recipe/detail/detail-page";

export const Route = createFileRoute("/recipe/$recipeId")({
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipeId } = Route.useParams();

  return <DetailPage recipeId={recipeId} />;
}
