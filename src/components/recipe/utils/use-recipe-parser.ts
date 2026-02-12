import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { useUploadImage } from "../../../api/use-upload-image";

type ParseState = "idle" | "uploading" | "processing" | "failed";

export function useRecipeParser(routeRecipeId?: string) {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const activeRecipeId = routeRecipeId ?? null;
  const isDetailPage = routeRecipeId !== undefined;

  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const uploadImageMutation = useUploadImage();

  const recipe = useQuery(
    api.recipe.getRecipe,
    activeRecipeId ? { recipeId: activeRecipeId } : "skip"
  );

  const recipeStatus = recipe?.status;
  const melaRecipe = recipe?.melaRecipe;

  // Derive a single display state from local parseState + backend status.
  // Backend status takes priority once we have a recipeId.
  const isDone = recipeStatus === "succeeded" && melaRecipe !== undefined;
  const isFailed =
    recipeStatus === "failed" || (!activeRecipeId && parseState === "failed");
  const isBackendProcessing =
    activeRecipeId !== null && !isDone && recipeStatus !== "failed";
  const isLocalProcessing =
    activeRecipeId === null &&
    (parseState === "uploading" || parseState === "processing");
  const isProcessing = isBackendProcessing || isLocalProcessing;
  const isIdle = !(isProcessing || isDone || isFailed);

  const displayPreview = isDetailPage ? (recipe?.imageUrl ?? null) : preview;

  const handleImageSelect = useCallback(
    (selectedFile: File, previewUrl: string) => {
      if (isDetailPage) {
        return;
      }
      setPreview(previewUrl);
      setFile(selectedFile);
      setParseState("idle");
    },
    [isDetailPage]
  );

  const handleClear = useCallback(() => {
    if (isDetailPage) {
      return;
    }
    setPreview(null);
    setFile(null);
    setParseState("idle");
  }, [isDetailPage]);

  const handleParse = useCallback(async () => {
    if (isDetailPage) {
      return;
    }
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

      setParseState("processing");
      const id = await createRecipe({ imageId });
      await navigate({
        to: "/recipe/$recipeId",
        params: { recipeId: id },
      });
    } catch (error) {
      console.error(error);
      setParseState("failed");
    }
  }, [
    createRecipe,
    file,
    generateUploadUrl,
    isDetailPage,
    navigate,
    uploadImageMutation,
  ]);

  const handleReset = useCallback(() => {
    if (isDetailPage) {
      return;
    }
    setPreview(null);
    setFile(null);
    setParseState("idle");
  }, [isDetailPage]);

  const displayParseState = isDetailPage ? "processing" : parseState;

  return {
    preview: displayPreview,
    parseState: displayParseState,
    melaRecipe,
    isIdle,
    isProcessing,
    isDone,
    isFailed,
    isReadOnly: isDetailPage,
    handleImageSelect,
    handleClear,
    handleParse,
    handleReset,
  };
}
