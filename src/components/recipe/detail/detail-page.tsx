import { Header } from "../../header";
import { ExtractedPanel } from "./extracted-panel";

type DetailPageProps = {
  recipeId: string;
};

export function DetailPage({ recipeId }: DetailPageProps) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <Header />
      <ExtractedPanel recipeId={recipeId} />
    </div>
  );
}
