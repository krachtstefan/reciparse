import { LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout";
import { UploadDropzone } from "@/components/recipe/upload/upload-dropzone";
import { useUpload } from "@/components/recipe/upload/use-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIPS = [
  "Make sure the text is clearly readable in the image",
  "Works with cookbook pages, handwritten cards, and screenshots",
  "Make sure the image(s) only show one recipe",
] as const;

export function UploadPage() {
  const {
    preview,
    isProcessing,
    isFailed,
    handleImageSelect,
    handleClear,
    handleParse,
  } = useUpload();

  const showTips = !preview;
  const showButton = preview && !isFailed;

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Upload Recipe Image</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDropzone
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

          {showButton && (
            <Button
              className="mt-4 w-full gap-2"
              disabled={isProcessing}
              onClick={handleParse}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Uploading image...
                </>
              ) : (
                <>
                  <Sparkles />
                  Extract Recipe
                </>
              )}
            </Button>
          )}

          {isFailed && <FailedIndicator onClear={handleClear} />}
        </CardContent>
      </Card>
    </Layout>
  );
}

function FailedIndicator({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-4 space-y-2">
      <p className="text-center text-destructive text-sm">
        Something went wrong while processing the recipe.
      </p>
      <Button className="w-full gap-2" onClick={onClear} variant="outline">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
