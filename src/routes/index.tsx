import { createFileRoute } from "@tanstack/react-router";
import { RecipeForm } from "@/components/recipe-form";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return <RecipeForm />;
}
