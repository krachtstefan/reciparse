import { useQuery } from "convex/react";
import { FileX, ScanText } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../../../convex/_generated/api";
import { CopyLinkButton } from "./copy-link-button";
import { RecipeDetail } from "./recipe-detail";
import { Skeleton } from "./skeleton";

type ExtractedPanelProps = {
  recipeId: string;
};

export function ExtractedPanel({ recipeId }: ExtractedPanelProps) {
  const recipe = useQuery(api.recipe.getRecipe, { recipeId });

  const isNotFound = recipe === null;

  const isSuccess = recipe?.status === "succeeded";
  const isFailed = recipe?.status === "failed";

  const isProcessing = !(isSuccess || isFailed);

  if (isNotFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Recipe</CardTitle>
          <CardAction>
            <CopyLinkButton />
          </CardAction>
        </CardHeader>
        <CardContent>
          <NotFoundPlaceholder />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Recipe</CardTitle>
        <CardAction>
          <CopyLinkButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isProcessing && <Skeleton />}

        {isSuccess && (
          <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
            <RecipeDetail recipe={recipe.recipeSchema.result} />
          </div>
        )}

        {isFailed && <FailedPlaceholder />}
      </CardContent>
    </Card>
  );
}

function NotFoundPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <FileX className="size-6 text-muted-foreground" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm">Recipe not found</p>
    </div>
  );
}

function FailedPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <ScanText className="size-6 text-destructive" />
      </div>
      <p className="mt-4 text-destructive text-sm">
        Failed to extract recipe from image.
      </p>
    </div>
  );
}
