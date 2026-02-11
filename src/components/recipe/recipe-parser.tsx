"use client";

import { useMutation, useQuery } from "convex/react";
import { RotateCcw, ScanText, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useUploadImage } from "../../api/use-upload-image";
import { RecipeOutput } from "./recipe-output";
import { RecipeSkeleton } from "./recipe-skeleton";
import { UploadDropzone } from "./upload-dropzone";

type ParseState = "idle" | "uploading" | "processing" | "done" | "failed";

export function RecipeParser() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [recipeId, setRecipeId] = useState<Id<"recipes"> | null>(null);

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const recipe = useQuery(
    api.recipe.getRecipe,
    recipeId ? { recipeId } : "skip"
  );

  const recipeStatus = recipe?.status;
  const melaRecipe = recipe?.melaRecipe;

  // Derive a single display state from local parseState + backend status.
  // Backend status takes priority once we have a recipeId.
  const isDone = recipeStatus === "succeeded" && melaRecipe !== undefined;
  const isFailed = recipeStatus === "failed" || parseState === "failed";
  const isProcessing =
    !(isDone || isFailed) &&
    (parseState === "uploading" || parseState === "processing");
  const isIdle = !(isProcessing || isDone || isFailed);

  const handleImageSelect = useCallback(
    (selectedFile: File, previewUrl: string) => {
      setPreview(previewUrl);
      setFile(selectedFile);
      setParseState("idle");
      setRecipeId(null);
    },
    []
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFile(null);
    setParseState("idle");
    setRecipeId(null);
  }, []);

  const handleParse = useCallback(async () => {
    if (!file) {
      return;
    }

    try {
      setParseState("uploading");

      const uploadUrl = await generateUploadUrl();
      const result = await uploadImageMutation.mutateAsync({
        uploadUrl,
        image: file,
      });
      const imageId = result.storageId;

      setParseState("processing");
      const id = await createRecipe({ imageId });
      setRecipeId(id);
    } catch (error) {
      console.error(error);
      setParseState("failed");
    }
  }, [file, generateUploadUrl, uploadImageMutation, createRecipe]);

  const handleReset = useCallback(() => {
    setPreview(null);
    setFile(null);
    setParseState("idle");
    setRecipeId(null);
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-balance font-serif text-3xl text-foreground sm:text-4xl">
          Recipe Lens
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          Upload a photo of any recipe from a cookbook, Instagram, or a
          screenshot and get the full recipe extracted and structured instantly.
        </p>
      </header>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Upload */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium text-foreground text-sm">
                  Source Image
                </h2>
                {preview && isDone && (
                  <Button
                    className="h-8 gap-1.5 text-muted-foreground text-xs hover:text-foreground"
                    onClick={handleReset}
                    size="sm"
                    variant="ghost"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    New image
                  </Button>
                )}
              </div>
              <UploadDropzone
                onClear={handleClear}
                onImageSelect={handleImageSelect}
                preview={preview}
              />
              {preview && isIdle && (
                <Button
                  className="mt-4 w-full gap-2"
                  onClick={handleParse}
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Extract Recipe
                </Button>
              )}
              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="font-medium text-primary text-sm">
                    {parseState === "uploading"
                      ? "Uploading image..."
                      : "Analyzing recipe..."}
                  </span>
                </div>
              )}
              {isFailed && (
                <div className="mt-4 space-y-2">
                  <p className="text-center text-destructive text-sm">
                    Something went wrong while processing the recipe.
                  </p>
                  <Button
                    className="w-full gap-2"
                    onClick={handleReset}
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips card -- only shown when no image */}
          {!preview && (
            <Card className="border-border bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-3 font-medium text-foreground text-sm">
                  Tips for best results
                </h3>
                <ul className="space-y-2">
                  {[
                    "Make sure the text is clearly readable in the image",
                    "Crop out unnecessary elements around the recipe",
                    "Works with cookbook pages, handwritten cards, and screenshots",
                    "Supports multiple languages",
                  ].map((tip) => (
                    <li
                      className="flex items-start gap-2 text-muted-foreground text-xs leading-relaxed"
                      key={tip}
                    >
                      <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Output */}
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

            {isIdle && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <ScanText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-muted-foreground text-sm">
                  Upload an image and click{" "}
                  <span className="font-medium text-foreground">
                    Extract Recipe
                  </span>{" "}
                  to see results here
                </p>
              </div>
            )}

            {isProcessing && <RecipeSkeleton />}

            {isDone && melaRecipe && (
              <div className="fade-in slide-in-from-bottom-2 animate-in duration-500">
                <RecipeOutput recipe={melaRecipe} />
              </div>
            )}

            {isFailed && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                  <ScanText className="h-6 w-6 text-destructive" />
                </div>
                <p className="mt-4 text-destructive text-sm">
                  Failed to extract recipe from image.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
