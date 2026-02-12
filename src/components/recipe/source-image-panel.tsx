"use client";

import { Link } from "@tanstack/react-router";
import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadDropzone } from "./upload-dropzone";
import { useRecipeParser } from "./utils/use-recipe-parser";

type SourceImagePanelProps = {
  recipeId?: string;
};

export function SourceImagePanel({ recipeId }: SourceImagePanelProps) {
  const {
    preview,
    parseState,
    isIdle,
    isProcessing,
    isDone,
    isFailed,
    isReadOnly,
    handleImageSelect,
    handleClear,
    handleParse,
    handleReset,
  } = useRecipeParser(recipeId);
  const showTips = !(preview || isReadOnly);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Image</CardTitle>
        {isReadOnly ? (
          <CardAction>
            <Button
              className="h-8 gap-1.5 text-xs"
              render={<Link to="/" />}
              size="sm"
              variant="outline"
            >
              New recipe
            </Button>
          </CardAction>
        ) : (
          preview &&
          isDone && (
            <CardAction>
              <Button
                className="h-8 gap-1.5 text-muted-foreground text-xs hover:text-foreground"
                onClick={handleReset}
                size="sm"
                variant="ghost"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New image
              </Button>
            </CardAction>
          )
        )}
      </CardHeader>
      <CardContent>
        <UploadDropzone
          isReadOnly={isReadOnly}
          onClear={handleClear}
          onImageSelect={handleImageSelect}
          preview={preview}
        />

        {showTips && (
          <div className="mt-4 rounded-lg bg-muted/40 p-4">
            <h3 className="mb-3 font-medium text-foreground text-sm">
              Tips for best results
            </h3>
            <ul className="space-y-2">
              {TIPS.map((tip) => (
                <li
                  className="flex items-start gap-2 text-muted-foreground text-xs leading-relaxed"
                  key={tip}
                >
                  <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {preview && isIdle && !isReadOnly && (
          <Button className="mt-4 w-full gap-2" onClick={handleParse} size="lg">
            <Sparkles className="h-4 w-4" />
            Extract Recipe
          </Button>
        )}

        {isProcessing && <ProcessingIndicator parseState={parseState} />}

        {isFailed && !isReadOnly && <FailedIndicator onReset={handleReset} />}
      </CardContent>
    </Card>
  );
}

const TIPS = [
  "Make sure the text is clearly readable in the image",
  "Crop out unnecessary elements around the recipe",
  "Works with cookbook pages, handwritten cards, and screenshots",
  "Supports multiple languages",
] as const;

function ProcessingIndicator({ parseState }: { parseState: string }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-3">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="font-medium text-primary text-sm">
        {parseState === "uploading"
          ? "Uploading image..."
          : "Analyzing recipe..."}
      </span>
    </div>
  );
}

function FailedIndicator({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-center text-destructive text-sm">
        Something went wrong while processing the recipe.
      </p>
      <Button className="w-full gap-2" onClick={onReset} variant="outline">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
