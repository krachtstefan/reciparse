import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUploadImage } from "../../../api/use-upload-image";

type ParseState = "idle" | "uploading" | "failed";

export function useUploadRecipe() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseState>("idle");

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const handleImageSelect = useCallback(
    (selectedFile: File, previewUrl: string) => {
      setPreview(previewUrl);
      setFile(selectedFile);
      setParseState("idle");
    },
    []
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setFile(null);
    setParseState("idle");
  }, []);

  const handleParse = useCallback(async () => {
    if (!file) {
      return;
    }

    try {
      setParseState("uploading");

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
      setParseState("failed");
    }
  }, [createRecipe, file, generateUploadUrl, navigate, uploadImageMutation]);

  const isIdle = parseState === "idle";
  const isProcessing = parseState === "uploading";
  const isFailed = parseState === "failed";

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
