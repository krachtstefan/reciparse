import { createFileRoute } from "@tanstack/react-router";
import { RecipeParser } from "@/components/recipe/recipe-parser";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return <RecipeParser />;
}
