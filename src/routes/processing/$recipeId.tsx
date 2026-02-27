import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Suspense } from "react";
import { Layout } from "@/components/layout";
import { ErrorStateTemplate } from "@/components/recipe/detail/error/error-state-template";
import { RecipeError } from "@/components/recipe/detail/error/recipe-error";
import { RecipeSkeleton } from "@/components/recipe/detail/recipe-skeleton";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/processing/$recipeId")({
  component: RecipeStatusRoute,
  errorComponent: RecipeError,
});

function RecipeStatusRoute() {
  const { recipeId } = Route.useParams();

  return (
    <Layout>
      <Suspense fallback={<RecipeSkeleton />}>
        <RecipeStatusContent recipeId={recipeId} />
      </Suspense>
    </Layout>
  );
}

function RecipeStatusContent({ recipeId }: { recipeId: string }) {
  const { data: recipe } = useSuspenseQuery(
    convexQuery(api.recipe.getRecipe, { recipeId })
  );

  if (!recipe) {
    return (
      <ErrorStateTemplate
        description="This recipe could not be found."
        title="Recipe not found"
      />
    );
  }

  const result = recipe.recipeSchema.result;

  if (result.status === "success") {
    return <Navigate params={{ recipeId }} replace to="/recipe/$recipeId" />;
  }

  if (result.status === "pending") {
    return <RecipeSkeleton />;
  }

  return (
    <ErrorStateTemplate
      description={result.reason}
      title="We couldn't generate this recipe"
    />
  );
}
