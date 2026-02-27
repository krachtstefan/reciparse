import { ErrorStateTemplate } from "./error-state-template";

export function RecipeNotFound() {
  return (
    <ErrorStateTemplate
      description="The recipe you are looking for does not exist."
      title="Recipe not found"
    />
  );
}
