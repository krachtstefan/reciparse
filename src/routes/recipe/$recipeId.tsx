import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { DetailPage } from "@/components/recipe/detail/detail-page";
import { RecipeNotFound } from "@/components/recipe/detail/recipe-not-found";
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

    if (recipe.recipeSchema.result.status === "success") {
      return { recipe: recipe.recipeSchema.result };
    }

    throw new Error("todo: redirect back to the intermediate pagej");
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const recipeJsonLd = toRecipeJsonLd(loaderData.recipe);

    return {
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(recipeJsonLd),
        },
      ],
    };
  },
  component: DetailPage,
  notFoundComponent: RecipeNotFound,
});

type SuccessRecipeResult = Extract<
  SerializedRecipe["recipeSchema"]["result"],
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
