import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_RECIPE_UPLOAD_IMAGES } from "../../../../shared/recipe";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
};

export function useUploadSelection() {
  const nextIdRef = useRef(0);
  const itemsRef = useRef<UploadItem[]>([]);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const addImages = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      return;
    }

    setItems((currentItems) => {
      const nextCount = currentItems.length + imageFiles.length;
      if (nextCount > MAX_RECIPE_UPLOAD_IMAGES) {
        setValidationMessage(
          `You can upload up to ${MAX_RECIPE_UPLOAD_IMAGES} images per recipe.`
        );
        return currentItems;
      }

      setValidationMessage(null);

      return [
        ...currentItems,
        ...imageFiles.map((file) => ({
          id: `upload-${nextIdRef.current++}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
    });
  }, []);

  const removeImage = useCallback((itemId: string) => {
    setItems((currentItems) => {
      const itemToRemove = currentItems.find((item) => item.id === itemId);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }

      return currentItems.filter((item) => item.id !== itemId);
    });
    setValidationMessage(null);
  }, []);

  const moveImage = useCallback((itemId: string, direction: -1 | 1) => {
    setItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.id === itemId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= currentItems.length) {
        return currentItems;
      }

      const nextItems = [...currentItems];
      const [item] = nextItems.splice(index, 1);
      nextItems.splice(nextIndex, 0, item);
      return nextItems;
    });
  }, []);

  const clear = useCallback(() => {
    setItems((currentItems) => {
      for (const item of currentItems) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return [];
    });
    setValidationMessage(null);
  }, []);

  const images = useMemo(
    () =>
      items.map((item, index) => ({
        id: item.id,
        previewUrl: item.previewUrl,
        fileName: item.file.name,
        position: index + 1,
      })),
    [items]
  );

  const imageCount = items.length;

  return {
    files: items.map((item) => item.file),
    selection: {
      images,
      imageCount,
      hasImages: imageCount > 0,
      canAddMore: imageCount < MAX_RECIPE_UPLOAD_IMAGES,
      validationMessage,
    },
    actions: {
      addImages,
      moveImage,
      removeImage,
      clear,
    },
  };
}
