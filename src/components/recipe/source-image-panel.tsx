import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadDropzone } from "./upload-dropzone";

type SourceImagePanelProps = {
  preview: string | null;
  parseState: string;
  isIdle: boolean;
  isProcessing: boolean;
  isDone: boolean;
  isFailed: boolean;
  onImageSelect: (file: File, previewUrl: string) => void;
  onClear: () => void;
  onParse: () => void;
  onReset: () => void;
};

export function SourceImagePanel({
  preview,
  parseState,
  isIdle,
  isProcessing,
  isDone,
  isFailed,
  onImageSelect,
  onClear,
  onParse,
  onReset,
}: SourceImagePanelProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium text-foreground text-sm">Source Image</h2>
          {preview && isDone && (
            <Button
              className="h-8 gap-1.5 text-muted-foreground text-xs hover:text-foreground"
              onClick={onReset}
              size="sm"
              variant="ghost"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New image
            </Button>
          )}
        </div>

        <UploadDropzone
          onClear={onClear}
          onImageSelect={onImageSelect}
          preview={preview}
        />

        {preview && isIdle && (
          <Button className="mt-4 w-full gap-2" onClick={onParse} size="lg">
            <Sparkles className="h-4 w-4" />
            Extract Recipe
          </Button>
        )}

        {isProcessing && <ProcessingIndicator parseState={parseState} />}

        {isFailed && <FailedIndicator onReset={onReset} />}
      </CardContent>
    </Card>
  );
}

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
