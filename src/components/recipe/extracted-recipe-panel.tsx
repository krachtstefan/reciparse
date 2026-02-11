import { Download, ScanText } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
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
  const handleDownload = useCallback(() => {
    if (!melaRecipe) {
      return;
    }

    const json = JSON.stringify(melaRecipe, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const slug = melaRecipe.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `${slug || "recipe"}.melarecipe`;

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [melaRecipe]);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground text-sm">
            Extracted Recipe
          </h2>
          {isDone && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-medium text-green-600 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                Complete
              </span>
              <Button
                className="h-7 gap-1.5 text-xs"
                onClick={handleDownload}
                size="sm"
                variant="outline"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
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
