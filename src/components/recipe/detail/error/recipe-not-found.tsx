import { Layout } from "@/components/layout";
import { ErrorStateTemplate } from "./error-state-template";

export function RecipeNotFound() {
  return (
    <Layout>
      <ErrorStateTemplate
        description="The recipe you are looking for does not exist."
        title="Recipe not found"
      />
    </Layout>
  );
}
