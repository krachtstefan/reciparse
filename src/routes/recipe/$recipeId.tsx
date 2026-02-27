import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { DetailPage } from "@/components/recipe/detail/detail-page";
import { RecipeError } from "@/components/recipe/detail/error/recipe-error";
import { RecipeNotFound } from "@/components/recipe/detail/error/recipe-not-found";
import { api } from "../../../convex/_generated/api";
import type { SerializedRecipe } from "../../../convex/helper";

export const Route = createFileRoute("/recipe/$recipeId")({
  loader: async (opts) => {
    const { recipeId } = opts.params;
    const recipe = await opts.context.queryClient.ensureQueryData(
      convexQuery(api.recipe.getRecipe, { recipeId })
    );
    if (!recipe) {
      throw notFound();
    }

    if (recipe.recipeSchema.status === "success") {
      return { recipe: recipe.recipeSchema };
    }

    throw redirect({
      to: "/processing/$recipeId",
      params: { recipeId },
    });
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const recipeJsonLd = toRecipeJsonLd(loaderData.recipe);
    const escapedRecipeJsonLd = escapeJsonForHtmlScript(recipeJsonLd);

    return {
      scripts: [
        {
          type: "application/ld+json",
          children: escapedRecipeJsonLd,
        },
      ],
    };
  },
  component: DetailPage,
  errorComponent: RecipeError,
  notFoundComponent: RecipeNotFound,
});

type SuccessRecipeResult = Extract<
  SerializedRecipe["recipeSchema"],
  { status: "success" }
>;

function toRecipeJsonLd(recipe: SuccessRecipeResult) {
  return {
    "@context": recipe.context,
    "@type": recipe.type,
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    recipeYield: recipe.recipeYield,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    recipeIngredient: recipe.recipeIngredient,
    recipeInstructions: recipe.recipeInstructions.map((instruction) => ({
      "@type": instruction.type,
      text: instruction.text,
    })),
  };
}

export function escapeJsonForHtmlScript(data: unknown): string {
  return JSON.stringify(data)
    .replaceAll("</script", "<\\/script")
    .replaceAll("<!--", "<\\!--")
    .replaceAll("-->", "--\\>");
}
