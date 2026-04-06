import type React from "react";
import { useState } from "react";
import { useUploadContext } from "@/components/recipe/upload/upload-context";
import { Button } from "@/components/ui/button";
import { UploadImageItem } from "./upload-image-item";
import { UploadPicker } from "./upload-picker";

export function UploadDropzone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const {
    selection: { images, canAddMore },
    actions: { addImages, clear },
  } = useUploadContext();

  const handleFiles = (fileList: FileList | File[]) => {
    addImages(Array.from(fileList));
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files.length > 0) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <UploadPicker
        canAddMore={canAddMore}
        isDragOver={isDragOver}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={canAddMore ? handleDrop : undefined}
        onInputChange={handleInputChange}
      />

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-foreground text-sm">
              Selected images
            </p>
            <Button onClick={clear} size="sm" variant="outline">
              Clear all
            </Button>
          </div>

          <div className="space-y-3">
            {images.map((image, index) => (
              <UploadImageItem
                image={image}
                isFirst={index === 0}
                isLast={index === images.length - 1}
                key={image.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
