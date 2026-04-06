import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useUploadContext } from "@/components/recipe/upload/upload-context";
import { Button } from "@/components/ui/button";
import type { UploadImage } from "./types";

type UploadImageItemProps = {
  image: UploadImage;
  isFirst: boolean;
  isLast: boolean;
};

export function UploadImageItem({
  image,
  isFirst,
  isLast,
}: UploadImageItemProps) {
  const {
    actions: { moveImage, removeImage },
  } = useUploadContext();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex aspect-square w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
        <img
          alt={`Recipe page ${image.position}`}
          className="h-full w-full object-cover"
          height={80}
          src={image.previewUrl}
          width={80}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground text-sm">
          Image {image.position}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          {image.fileName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          aria-label={`Move image ${image.position} earlier`}
          disabled={isFirst}
          onClick={() => moveImage(image.id, -1)}
          size="icon-sm"
          variant="outline"
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          aria-label={`Move image ${image.position} later`}
          disabled={isLast}
          onClick={() => moveImage(image.id, 1)}
          size="icon-sm"
          variant="outline"
        >
          <ArrowDown className="size-4" />
        </Button>
        <Button
          aria-label={`Remove image ${image.position}`}
          onClick={() => removeImage(image.id)}
          size="icon-sm"
          variant="ghost"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
