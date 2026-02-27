import { ErrorStateTemplate } from "./error-state-template";

export function RecipeError() {
  return (
    <ErrorStateTemplate
      description="We hit a problem while loading this recipe. Please try again in a moment."
      title="Something went wrong"
    />
  );
}
