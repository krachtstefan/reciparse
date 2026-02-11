import { ScanText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecipeOutput } from "./recipe-output";
import { RecipeSkeleton } from "./recipe-skeleton";

type MelaRecipe = {
  id: string;
  title: string;
  text: string;
  images: string[];
  categories: string[];
  yield: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: string;
  instructions: string;
  notes: string;
  nutrition: string;
  link: string;
};

type ExtractedRecipePanelProps = {
  melaRecipe: MelaRecipe | undefined;
  isIdle: boolean;
  isProcessing: boolean;
  isDone: boolean;
  isFailed: boolean;
};

export function ExtractedRecipePanel({
  melaRecipe,
  isIdle,
  isProcessing,
  isDone,
  isFailed,
}: ExtractedRecipePanelProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground text-sm">
            Extracted Recipe
          </h2>
          {isDone && (
            <span className="flex items-center gap-1 font-medium text-green-600 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
              Complete
            </span>
          )}
        </div>

        {isIdle && <IdlePlaceholder />}

        {isProcessing && <RecipeSkeleton />}

        {isDone && melaRecipe && (
          <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
            <RecipeOutput recipe={melaRecipe} />
          </div>
        )}

        {isFailed && <FailedPlaceholder />}
      </CardContent>
    </Card>
  );
}

function IdlePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ScanText className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        Upload an image and click{" "}
        <span className="font-medium text-foreground">Extract Recipe</span> to
        see results here
      </p>
    </div>
  );
}

function FailedPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <ScanText className="h-6 w-6 text-destructive" />
      </div>
      <p className="mt-4 text-destructive text-sm">
        Failed to extract recipe from image.
      </p>
    </div>
  );
}
