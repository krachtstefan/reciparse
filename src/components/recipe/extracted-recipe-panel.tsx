"use client";

import { Download, ScanText } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipeOutput } from "./recipe-output";
import { RecipeSkeleton } from "./recipe-skeleton";
import { downloadMelaRecipe } from "./utils/recipe-download";
import { useRecipeParser } from "./utils/use-recipe-parser";

type ExtractedRecipePanelProps = {
  recipeId?: string;
};

export function ExtractedRecipePanel({ recipeId }: ExtractedRecipePanelProps) {
  const { melaRecipe, isIdle, isProcessing, isDone, isFailed } =
    useRecipeParser(recipeId);

  const handleDownload = useCallback(() => {
    if (!melaRecipe) {
      return;
    }

    downloadMelaRecipe(melaRecipe);
  }, [melaRecipe]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Recipe</CardTitle>
        {isDone && (
          <CardAction>
            <Button
              className="h-7 gap-1.5 text-xs"
              onClick={handleDownload}
              size="sm"
              variant="outline"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
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
