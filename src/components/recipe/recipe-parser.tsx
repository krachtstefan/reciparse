"use client";

import { useMutation } from "convex/react";
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  ScanText,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "../../../convex/_generated/api";
import { useUploadImage } from "../../api/use-upload-image";
import { UploadDropzone } from "./upload-dropzone";

type ParseState = "idle" | "loading" | "done";

export function RecipeParser() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseState>("idle");

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const handleImageSelect = useCallback(
    (selectedFile: File, previewUrl: string) => {
      setPreview(previewUrl);
      setFile(selectedFile);
      setParseState("idle");
    },
    []
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFile(null);
    setParseState("idle");
  }, []);

  const handleParse = useCallback(async () => {
    if (!file) return;

    try {
      setParseState("loading");

      const uploadUrl = await generateUploadUrl();
      const result = await uploadImageMutation.mutateAsync({
        uploadUrl,
        image: file,
      });
      const imageId = result.storageId;

      await createRecipe({ imageId });

      setParseState("done");
    } catch (error) {
      console.error(error);
      setParseState("idle");
    }
  }, [file, generateUploadUrl, uploadImageMutation, createRecipe]);

  const handleReset = useCallback(() => {
    setPreview(null);
    setFile(null);
    setParseState("idle");
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
                {preview && parseState === "done" && (
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
              {preview && parseState === "idle" && (
                <Button
                  className="mt-4 w-full gap-2"
                  onClick={handleParse}
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  Extract Recipe
                </Button>
              )}
              {parseState === "loading" && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="font-medium text-primary text-sm">
                    Uploading and processing...
                  </span>
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
          <CardContent className="h-full min-h-[400px] p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium text-foreground text-sm">
                Extracted Recipe
              </h2>
              {parseState === "done" && (
                <span className="flex items-center gap-1 font-medium text-green-600 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                  Submitted
                </span>
              )}
            </div>

            {parseState === "idle" && (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
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

            {parseState === "loading" && (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">
                  Sending recipe to the kitchen...
                </p>
              </div>
            )}

            {parseState === "done" && (
              <div className="fade-in slide-in-from-bottom-2 flex h-full animate-in flex-col items-center justify-center py-16 text-center duration-500">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 font-medium font-serif text-foreground text-xl">
                  Recipe Received!
                </h3>
                <p className="mx-auto max-w-xs text-muted-foreground text-sm">
                  Your recipe has been uploaded and is being processed. It will
                  appear in your recipe book shortly.
                </p>
                <Button
                  className="mt-6"
                  onClick={handleReset}
                  variant="outline"
                >
                  Upload Another
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
