import { useForm } from "@tanstack/react-form";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRef } from "react";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { useUploadImage } from "../api/use-upload-image";

type RecipeFormProps = {
  onSuccess?: () => void;
};

type RecipeFormValues = {
  title: string;
  image: File | null;
};

const recipeFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  image: z.instanceof(File).nullable(),
});

export function RecipeForm({ onSuccess }: RecipeFormProps) {
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadImage();

  const defaultValues: RecipeFormValues = {
    title: "",
    image: null,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: recipeFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim()) {
        return;
      }

      let imageId: Id<"_storage"> | undefined;

      if (value.image) {
        const uploadUrl = await generateUploadUrl();
        const result = await uploadImageMutation.mutateAsync({
          uploadUrl,
          image: value.image,
        });
        imageId = result.storageId;
      }

      await createRecipe({ title: value.title.trim(), imageId });
      form.reset();
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      onSuccess?.();
    },
  });

  return (
    <form
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();
        await form.handleSubmit();
      }}
    >
      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {({ canSubmit, isSubmitting }) => {
          const isBusy = isSubmitting || uploadImageMutation.isPending;

          return (
            <>
              <div className="flex flex-1 flex-col gap-1">
                <label
                  className="font-medium text-gray-300 text-sm"
                  htmlFor="recipe-title"
                >
                  Title
                </label>
                <form.Field name="title">
                  {(field) => (
                    <input
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
                      disabled={isBusy}
                      id="recipe-title"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Recipe title"
                      type="text"
                      value={field.state.value}
                    />
                  )}
                </form.Field>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label
                  className="font-medium text-gray-300 text-sm"
                  htmlFor="recipe-image"
                >
                  Image (optional)
                </label>
                <form.Field name="image">
                  {(field) => (
                    <input
                      accept="image/*"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-600 file:px-3 file:py-1 file:font-medium file:text-sm file:text-white focus:border-cyan-500 focus:outline-none"
                      disabled={isBusy}
                      id="recipe-image"
                      onChange={(event) =>
                        field.handleChange(event.target.files?.[0] ?? null)
                      }
                      ref={imageInputRef}
                      type="file"
                    />
                  )}
                </form.Field>
              </div>
              <button
                className="rounded-lg bg-cyan-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSubmit || isBusy}
                type="submit"
              >
                {isBusy ? "Adding..." : "Add Recipe"}
              </button>
            </>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
