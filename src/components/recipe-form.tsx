import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { type FormEvent, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useUploadImage } from "../api/use-upload-image";

type RecipeFormProps = {
  onSuccess?: () => void;
};

export function RecipeForm({ onSuccess }: RecipeFormProps) {
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);

  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadImage();
  const isSubmitting = uploadImageMutation.isPending;

  async function handleCreateRecipe(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    let imageId: Id<"_storage"> | undefined;

    if (selectedImage) {
      const uploadUrl = await generateUploadUrl();
      const result = await uploadImageMutation.mutateAsync({
        uploadUrl,
        image: selectedImage,
      });
      imageId = result.storageId;
    }

    await createRecipe({ title: title.trim(), imageId });
    setTitle("");
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    onSuccess?.();
  }

  return (
    <form
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={handleCreateRecipe}
    >
      <div className="flex flex-1 flex-col gap-1">
        <label
          className="font-medium text-gray-300 text-sm"
          htmlFor="recipe-title"
        >
          Title
        </label>
        <input
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
          disabled={isSubmitting}
          id="recipe-title"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe title"
          type="text"
          value={title}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <label
          className="font-medium text-gray-300 text-sm"
          htmlFor="recipe-image"
        >
          Image (optional)
        </label>
        <input
          accept="image/*"
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:font-medium file:text-sm file:text-white focus:border-cyan-500 focus:outline-none"
          disabled={isSubmitting}
          id="recipe-image"
          onChange={(e) => setSelectedImage(e.target.files?.[0] ?? null)}
          ref={imageInputRef}
          type="file"
        />
      </div>
      <button
        className="rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isSubmitting || !title.trim()}
        type="submit"
      >
        {isSubmitting ? "Adding..." : "Add Recipe"}
      </button>
    </form>
  );
}
