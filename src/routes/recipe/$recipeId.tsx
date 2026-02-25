import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/recipe/detail/detail-page";
import { api } from "../../../convex/_generated/api";
import type { SerializedRecipe } from "../../../convex/helper";

export const Route = createFileRoute("/recipe/$recipeId")({
  loader: async (opts) => {
    const { recipeId } = opts.params;
    const recipe = await opts.context.queryClient.ensureQueryData(
      convexQuery(api.recipe.getRecipe, { recipeId })
    );

    return {
      recipe,
    };
  },
  head: ({ loaderData }) => {
    const recipeJsonLd = toRecipeJsonLd(loaderData?.recipe);

    if (!recipeJsonLd) {
      return {};
    }

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
});

function toRecipeJsonLd(recipe: SerializedRecipe | null | undefined) {
  const successRecipe =
    recipe?.recipeSchema.result.status === "success"
      ? recipe.recipeSchema.result
      : null;

  if (!successRecipe) {
    return null;
  }

  return {
    "@context": successRecipe.context,
    "@type": successRecipe.type,
    name: successRecipe.name,
    description: successRecipe.description,
    image: successRecipe.image,
    recipeYield: successRecipe.recipeYield,
    prepTime: successRecipe.prepTime,
    cookTime: successRecipe.cookTime,
    totalTime: successRecipe.totalTime,
    recipeIngredient: successRecipe.recipeIngredient,
    recipeInstructions: successRecipe.recipeInstructions.map((instruction) => ({
      "@type": instruction.type,
      text: instruction.text,
    })),
  };
}
