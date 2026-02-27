import { Layout } from "@/components/layout";
import { ErrorStateTemplate } from "./error-state-template";

export function RecipeError() {
  return (
    <Layout>
      <ErrorStateTemplate
        description="We hit a problem while loading this recipe. Please try again in a moment."
        title="Something went wrong"
      />
    </Layout>
  );
}
