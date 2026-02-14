import { ImageIcon, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type UploadDropzoneProps = {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
  onClear: () => void;
};

export function UploadDropzone({
  onImageSelect,
  preview,
  onClear,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result;
      if (typeof imageDataUrl !== "string") {
        return;
      }
      onImageSelect(file, imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  if (preview) {
    return (
      <div className="group relative">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <img
            alt="Uploaded recipe"
            className="h-auto max-h-[400px] w-full object-contain"
            height={400}
            src={preview}
            width={600}
          />
        </div>
        <Button
          aria-label="Remove image"
          className="absolute top-3 right-3 rounded-full bg-card text-card-foreground opacity-0 shadow-md transition-opacity hover:bg-secondary group-hover:opacity-100"
          onClick={onClear}
          size="icon"
          variant="secondary"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: label wraps a file input; drag events are required for drop zone
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-all ${
        isDragOver
          ? "scale-[1.01] border-primary bg-primary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        accept="image/*"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onChange={handleInputChange}
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
          Drop your recipe image here
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          or click to browse. Supports JPG, PNG, WEBP
        </p>
      </div>
    </label>
  );
}
