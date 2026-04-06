import { useNavigate } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUploadImage } from "../../../api/use-upload-image";
import { useUploadSelection } from "./use-upload-selection";

type UploadStatus = "idle" | "uploading" | "failed";

export function useUpload() {
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const { files, selection, actions: selectionActions } = useUploadSelection();

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const handleParse = useCallback(async () => {
    if (files.length === 0) {
      return;
    }

    try {
      setUploadStatus("uploading");

      const imageIds: Id<"_storage">[] = [];

      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const result = await uploadImageMutation.mutateAsync({
          uploadUrl,
          image: file,
        });

        imageIds.push(result.storageId);
      }

      const id = await createRecipe({ imageIds });
      await navigate({
        to: "/processing/$recipeId",
        params: { recipeId: id },
      });
    } catch (error) {
      console.error(error);
      setUploadStatus("failed");
    }
  }, [createRecipe, files, generateUploadUrl, navigate, uploadImageMutation]);

  const addImages = useCallback(
    (selectedFiles: File[]) => {
      selectionActions.addImages(selectedFiles);
      setUploadStatus("idle");
    },
    [selectionActions]
  );

  const moveImage = useCallback(
    (itemId: string, direction: -1 | 1) => {
      selectionActions.moveImage(itemId, direction);
      setUploadStatus("idle");
    },
    [selectionActions]
  );

  const removeImage = useCallback(
    (itemId: string) => {
      selectionActions.removeImage(itemId);
      setUploadStatus("idle");
    },
    [selectionActions]
  );

  const clear = useCallback(() => {
    selectionActions.clear();
    setUploadStatus("idle");
  }, [selectionActions]);

  const isIdle = uploadStatus === "idle";
  const isProcessing = uploadStatus === "uploading";
  const isFailed = uploadStatus === "failed";

  return {
    selection,
    upload: {
      isIdle,
      isProcessing,
      isFailed,
    },
    actions: {
      addImages,
      moveImage,
      removeImage,
      clear,
      parse: handleParse,
    },
  };
}
