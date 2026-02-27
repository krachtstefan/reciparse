import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound, useParams } from "@tanstack/react-router";
import { LoaderCircle, ScanText } from "lucide-react";
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
import { RecipeSkeleton } from "./recipe-skeleton";

export function ExtractedPanel() {
  const { recipeId } = useParams({ from: "/recipe/$recipeId" });
  const { data: recipe } = useSuspenseQuery(
    convexQuery(api.recipe.getRecipe, { recipeId })
  );

  if (!recipe) {
    throw notFound();
  }

  const recipeStatus = recipe.recipeSchema.result.status;
  const isFailed = recipeStatus === "failed";
  const isProcessing = recipeStatus === "pending";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Recipe</CardTitle>
        <CardAction>
          <CopyLinkButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        {isProcessing && <PendingPlaceholder />}

        {recipe?.recipeSchema.result.status === "success" && (
          <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
            <RecipeDetail recipe={recipe.recipeSchema.result} />
          </div>
        )}

        {isFailed && <FailedPlaceholder />}
      </CardContent>
    </Card>
  );
}

export function ExtractedPanelSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extracted Recipe</CardTitle>
        <CardAction>
          <CopyLinkButton />
        </CardAction>
      </CardHeader>
      <CardContent>
        <RecipeSkeleton />
      </CardContent>
    </Card>
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

function PendingPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
      <p className="mt-4 text-muted-foreground text-sm">
        We are extracting your recipe details...
      </p>
    </div>
  );
}
