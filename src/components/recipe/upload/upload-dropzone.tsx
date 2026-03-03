import { ImageIcon, Upload, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type UploadDropzoneProps = {
  onImageSelect: (files: File[], previews: string[]) => void;
  previews: string[];
  onClear: () => void;
};

export function UploadDropzone({
  onImageSelect,
  previews,
  onClear,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = async (candidateFiles: FileList | File[]) => {
    const files = Array.from(candidateFiles).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length === 0) {
      return;
    }

    const previewResults = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageDataUrl = event.target?.result;
              if (typeof imageDataUrl !== "string") {
                reject(new Error("Unable to read selected image"));
                return;
              }
              resolve(imageDataUrl);
            };
            reader.onerror = () => {
              reject(new Error("Unable to read selected image"));
            };
            reader.readAsDataURL(file);
          })
      )
    );

    onImageSelect(files, previewResults);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      void handleFiles(fileList);
    }
  };

  if (previews.length > 0) {
    return (
      <div className="group relative">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {previews.map((preview, index) => (
            <div
              className="overflow-hidden rounded-lg border border-border bg-card"
              key={`${preview}-${index}`}
            >
              <img
                alt={`Uploaded recipe ${index + 1}`}
                className="h-auto max-h-[280px] w-full object-contain"
                height={280}
                src={preview}
                width={420}
              />
            </div>
          ))}
        </div>
        <Button
          aria-label="Remove images"
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
        multiple
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
          Drop your recipe image(s) here
        </p>
        <p className="mt-1 text-muted-foreground text-xs">
          or click to browse. Supports JPG, PNG, WEBP
        </p>
      </div>
    </label>
  );
}
