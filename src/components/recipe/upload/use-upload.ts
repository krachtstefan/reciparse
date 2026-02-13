import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUploadImage } from "../../../api/use-upload-image";

type UploadStatus = "idle" | "uploading" | "failed";

export function useUpload() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const handleImageSelect = useCallback(
    (selectedFile: File, previewUrl: string) => {
      setPreview(previewUrl);
      setFile(selectedFile);
      setUploadStatus("idle");
    },
    []
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFile(null);
    setUploadStatus("idle");
  }, []);

  const handleParse = useCallback(async () => {
    if (!file) {
      return;
    }

    try {
      setUploadStatus("uploading");

      const uploadUrl = await generateUploadUrl();
      const result = await uploadImageMutation.mutateAsync({
        uploadUrl,
        image: file,
      });
      const imageId = result.storageId;

      const id = await createRecipe({ imageId });
      await navigate({
        to: "/recipe/$recipeId",
        params: { recipeId: id },
      });
    } catch (error) {
      console.error(error);
      setUploadStatus("failed");
    }
  }, [createRecipe, file, generateUploadUrl, navigate, uploadImageMutation]);

  const isIdle = uploadStatus === "idle";
  const isProcessing = uploadStatus === "uploading";
  const isFailed = uploadStatus === "failed";

  return {
    preview,
    isIdle,
    isProcessing,
    isFailed,
    handleImageSelect,
    handleClear,
    handleParse,
  };
}
