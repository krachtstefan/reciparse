import { ImageIcon, Upload } from "lucide-react";
import type React from "react";
import { MAX_RECIPE_UPLOAD_IMAGES } from "../../../../../shared/recipe";

type UploadPickerProps = {
  canAddMore: boolean;
  isDragOver: boolean;
  onDragLeave: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function UploadPicker({
  canAddMore,
  isDragOver,
  onDragLeave,
  onDragOver,
  onDrop,
  onInputChange,
}: UploadPickerProps) {
  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: label wraps a file input; drag events are required for drop zone
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-all ${
        isDragOver
          ? "scale-[1.01] border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      } ${canAddMore ? "" : "cursor-not-allowed opacity-60"}`}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        accept="image/*"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        disabled={!canAddMore}
        multiple
        onChange={onInputChange}
        type="file"
      />
      <div
        className={`flex size-14 items-center justify-center rounded-full transition-colors ${
          isDragOver ? "bg-primary/10" : "bg-muted"
        }`}
      >
        {isDragOver ? (
          <Upload className="size-6 text-primary" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-foreground text-sm">
          {canAddMore
            ? "Drop your recipe images here"
            : `You have reached the ${MAX_RECIPE_UPLOAD_IMAGES}-image limit`}
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          {canAddMore
            ? "or click to browse. Supports JPG, PNG, WEBP"
            : "Remove an image to add another one."}
        </p>
      </div>
    </label>
  );
}
