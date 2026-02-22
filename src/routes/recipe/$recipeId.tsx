import { createFileRoute } from "@tanstack/react-router";
import { DetailPage } from "@/components/recipe/detail/detail-page";

const dummyRecipeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "Classic Tomato Pasta",
  description: "A quick and simple weeknight tomato pasta recipe.",
  image: ["https://example.com/images/classic-tomato-pasta.jpg"],
  recipeYield: "2 servings",
  prepTime: "PT10M",
  cookTime: "PT20M",
  totalTime: "PT30M",
  recipeIngredient: [
    "200g dried pasta",
    "2 tbsp olive oil",
    "2 garlic cloves",
    "400g canned tomatoes",
    "Salt",
    "Black pepper",
  ],
  recipeInstructions: [
    {
      "@type": "HowToStep",
      text: "Boil pasta in salted water until al dente.",
    },
    {
      "@type": "HowToStep",
      text: "Saute garlic in olive oil, add tomatoes, and simmer.",
    },
    {
      "@type": "HowToStep",
      text: "Combine pasta with sauce and season to taste.",
    },
  ],
} as const;

export const Route = createFileRoute("/recipe/$recipeId")({
  head: () => ({
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(dummyRecipeJsonLd),
      },
    ],
  }),
  component: RecipeDetail,
});

function RecipeDetail() {
  const { recipeId } = Route.useParams();

  return <DetailPage recipeId={recipeId} />;
}
