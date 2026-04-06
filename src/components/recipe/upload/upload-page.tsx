import { LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout";
import {
  UploadProvider,
  useUploadContext,
} from "@/components/recipe/upload/upload-context";
import { UploadDropzone } from "@/components/recipe/upload/upload-dropzone/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIPS = [
  "Make sure the text is clearly readable in the image",
  "Upload images where the text reads horizontally",
  "Works with cookbook pages, handwritten cards, and screenshots",
  "Make sure the image(s) only show one recipe",
] as const;

export function UploadPage() {
  return (
    <UploadProvider>
      <UploadPageContent />
    </UploadProvider>
  );
}

function UploadPageContent() {
  const {
    selection: { hasImages, validationMessage },
    upload: { isProcessing, isFailed },
    actions: { parse },
  } = useUploadContext();

  const showTips = !hasImages;
  const showButton = hasImages && !isFailed;

  return (
    <Layout>
      <Card>
        <CardHeader>
          <CardTitle>Upload Recipe Images</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDropzone />

          {hasImages && (
            <p className="mt-4 text-center text-muted-foreground text-xs">
              Make sure the images are ordered the way the recipe should be
              read.
            </p>
          )}

          {validationMessage && (
            <p className="mt-3 text-destructive text-sm">{validationMessage}</p>
          )}

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
                    <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-primary/60" />
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
              onClick={parse}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Uploading images...
                </>
              ) : (
                <>
                  <Sparkles />
                  Extract Recipe
                </>
              )}
            </Button>
          )}

          {isFailed && <FailedIndicator />}
        </CardContent>
      </Card>
    </Layout>
  );
}

function FailedIndicator() {
  const {
    actions: { clear },
  } = useUploadContext();

  return (
    <div className="mt-4 space-y-2">
      <p className="text-center text-destructive text-sm">
        Something went wrong while processing the recipe.
      </p>
      <Button className="w-full gap-2" onClick={clear} variant="outline">
        <RotateCcw className="size-4" />
        Try Again
      </Button>
    </div>
  );
}
