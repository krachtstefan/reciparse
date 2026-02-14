import { useQuery } from "convex/react";
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
import { api } from "../../../../convex/_generated/api";
import { downloadMelaRecipe } from "./download";
import { Output } from "./output";
import { Skeleton } from "./skeleton";

type ExtractedPanelProps = {
  recipeId: string;
};

export function ExtractedPanel({ recipeId }: ExtractedPanelProps) {
  const recipe = useQuery(api.recipe.getRecipe, { recipeId });

  const isSuccess = recipe?.status === "succeeded";
  const isFailed = recipe?.status === "failed";

  const isProcessing = !(isSuccess || isFailed);

  const handleDownload = useCallback(() => {
    if (recipe?.status !== "succeeded") {
      return;
    }

    downloadMelaRecipe(recipe.melaRecipe.result);
  }, [recipe]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Recipe</CardTitle>
        {isSuccess && (
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
        {isProcessing && <Skeleton />}

        {isSuccess && (
          <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
            <Output recipe={recipe.melaRecipe.result} />
          </div>
        )}

        {isFailed && <FailedPlaceholder />}
      </CardContent>
    </Card>
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
