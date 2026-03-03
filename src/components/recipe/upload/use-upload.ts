import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUploadImage } from "../../../api/use-upload-image";

type UploadStatus = "idle" | "uploading" | "failed";

export function useUpload() {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const handleImageSelect = useCallback(
    (selectedFiles: File[], previewUrls: string[]) => {
      setPreviews(previewUrls);
      setFiles(selectedFiles);
      setUploadStatus("idle");
    },
    []
  );

  const handleClear = useCallback(() => {
    setPreviews([]);
    setFiles([]);
    setUploadStatus("idle");
  }, []);

  const handleParse = useCallback(async () => {
    if (files.length === 0) {
      return;
    }

    try {
      setUploadStatus("uploading");

      const imageIds = await Promise.all(
        files.map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const result = await uploadImageMutation.mutateAsync({
            uploadUrl,
            image: file,
          });
          return result.storageId;
        })
      );

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

  const isIdle = uploadStatus === "idle";
  const isProcessing = uploadStatus === "uploading";
  const isFailed = uploadStatus === "failed";

  return {
    previews,
    isIdle,
    isProcessing,
    isFailed,
    handleImageSelect,
    handleClear,
    handleParse,
  };
}
