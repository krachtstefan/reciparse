import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { RecipeForm } from "../components/recipe-form";

export const Route = createFileRoute("/")({ component: App });

type MelaRecipe = NonNullable<Doc<"recipes">["melaRecipe"]>;

const downloadMelaRecipe = (title: string, melaRecipe: MelaRecipe) => {
  const fileNameBase = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const fileName = `${fileNameBase || "recipe"}.melarecipe`;
  const blob = new Blob([JSON.stringify(melaRecipe, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

function App() {
  const recipes = useQuery(api.recipe.getRecipes);
  let recipeContent = <p className="text-gray-400">Loading recipes...</p>;

  if (recipes) {
    if (recipes.length > 0) {
      recipeContent = (
        <ul className="grid gap-2 text-white">
          {recipes.map((recipe) => {
            const melaRecipe = recipe.melaRecipe;

            return (
              <li
                className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-2"
                key={recipe.id}
              >
                {recipe.imageUrl ? (
                  <img
                    alt={recipe.title}
                    className="h-12 w-12 rounded object-cover"
                    height={48}
                    src={recipe.imageUrl}
                    width={48}
                  />
                ) : null}
                <span className="flex-1">{recipe.title}</span>
                {recipe.status === "succeeded" && melaRecipe ? (
                  <button
                    className="rounded-md border border-slate-600 px-3 py-1 font-semibold text-slate-100 text-xs transition hover:border-slate-400 hover:text-white"
                    onClick={() => {
                      downloadMelaRecipe(recipe.title, melaRecipe);
                    }}
                    type="button"
                  >
                    Download
                  </button>
                ) : (
                  <span className="font-semibold text-slate-300 text-xs uppercase tracking-wide">
                    {recipe.status.replaceAll("_", " ")}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      );
    } else {
      recipeContent = (
        <div className="rounded-lg border border-slate-700 border-dashed px-4 py-6 text-center">
          <p className="text-slate-300 text-sm">No recipes yet.</p>
          <p className="mt-2 text-slate-400 text-xs">
            Upload an image to generate your first Mela recipe.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-xl border border-slate-700 bg-slate-800/40 p-6">
          <h2 className="mb-4 font-semibold text-2xl text-white">Recipes</h2>

          <RecipeForm />

          {recipeContent}
        </div>
      </section>
    </div>
  );
}
