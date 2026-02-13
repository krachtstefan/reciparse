import { Layout } from "../../layout";
import { ExtractedPanel } from "./extracted-panel";

type DetailPageProps = {
  recipeId: string;
};

export function DetailPage({ recipeId }: DetailPageProps) {
  return (
    <Layout>
      <ExtractedPanel recipeId={recipeId} />
    </Layout>
  );
}
