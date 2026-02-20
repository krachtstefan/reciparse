import type { SchemaOrgRecipeFields } from "convex/validators/recipe";

type RecipeJsonLdProps = {
  recipe: SchemaOrgRecipeFields;
};

type JsonLdHowToStep = {
  "@type": "HowToStep";
  text: string;
};

type JsonLdRecipe = {
  "@context": string;
  "@type": "Recipe";
  name: string;
  description: string;
  inLanguage?: string;
  image: string[];
  recipeYield: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  recipeIngredient: string[];
  recipeInstructions: JsonLdHowToStep[];
  comment: {
    "@type": "Comment";
    text: string;
  };
  nutrition: {
    "@type": "NutritionInformation";
    description: string;
  };
  url: string;
};

const serializeJsonLd = (value: JsonLdRecipe): string => {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
};

const toJsonLdRecipe = (recipe: SchemaOrgRecipeFields): JsonLdRecipe => {
  const jsonLdRecipe: JsonLdRecipe = {
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
    comment: {
      "@type": recipe.comment.type,
      text: recipe.comment.text,
    },
    nutrition: {
      "@type": recipe.nutrition.type,
      description: recipe.nutrition.description,
    },
    url: recipe.url,
  };

  if (recipe.inLanguage) {
    jsonLdRecipe.inLanguage = recipe.inLanguage;
  }

  return jsonLdRecipe;
};

export function RecipeJsonLd({ recipe }: RecipeJsonLdProps) {
  const jsonLd = toJsonLdRecipe(recipe);

  return <script type="application/ld+json">{serializeJsonLd(jsonLd)}</script>;
}
