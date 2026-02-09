import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { RecipeForm } from "../components/recipe-form";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const recipes = useQuery(api.recipe.getRecipes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 rounded-xl border border-slate-700 bg-slate-800/40 p-6">
          <h2 className="mb-4 font-semibold text-2xl text-white">Recipes</h2>

          <RecipeForm />

          {recipes ? (
            <ul className="grid gap-2 text-white">
              {recipes.map((recipe) => (
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
                  <span>{recipe.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Loading recipes...</p>
          )}
        </div>
      </section>
    </div>
  );
}
