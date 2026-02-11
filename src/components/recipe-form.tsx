
import { useEffect, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { api } from "../../convex/_generated/api";
import { useUploadImage } from "../api/use-upload-image";
import { Button } from "./ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useMutation } from "convex/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

type RecipeFormProps = {
  onSuccess?: () => void;
};

type RecipeFormValues = {
  image: File | null;
};

const recipeFormSchema = z.object({
  image: z.instanceof(File, { message: "Image is required" }),
});

function RecipeImageField({
  field,
  isBusy,
  inputRef,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: FieldApi is too complex to type manually
  field: any;

  isBusy: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!field.state.value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(field.state.value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [field.state.value]);

  return (
    <Field>
      <FieldLabel htmlFor="recipe-image">Recipe Image</FieldLabel>
      {preview ? (
        <div className="relative overflow-hidden rounded-md border border-input">
          <img
            alt="Recipe preview"
            className="h-48 w-full object-cover"
            height={192}
            src={preview}
            width={300}
          />
          <Button
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm"
            onClick={() => {
              field.handleChange(null);
              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            size="icon"
            type="button"
            variant="destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-md border border-input border-dashed p-8 text-center transition-colors hover:bg-muted/50"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              inputRef.current?.click();
            }
          }}
          type="button"
        >
          <div className="rounded-full bg-muted p-4">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">Click to upload</p>
            <p className="text-muted-foreground text-xs">
              SVG, PNG, JPG or GIF
            </p>
          </div>
        </button>
      )}

      <Input
        accept="image/*"
        className="hidden"
        disabled={isBusy}
        id="recipe-image"
        onChange={(event) =>
          field.handleChange(event.target.files?.[0] ?? null)
        }
        ref={inputRef}
        type="file"
      />
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

export function RecipeForm({ onSuccess }: RecipeFormProps) {
  const generateUploadUrl = useMutation(api.recipe.generateUploadUrl);
  const createRecipe = useMutation(api.recipe.createRecipe);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useUploadImage();

  const defaultValues: RecipeFormValues = {
    image: null,
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: recipeFormSchema,
    },
    onSubmit: async ({ value }) => {
      if (!value.image) {
        return;
      }

      const uploadUrl = await generateUploadUrl();
      const result = await uploadImageMutation.mutateAsync({
        uploadUrl,
        image: value.image,
      });
      const imageId = result.storageId;

      await createRecipe({ imageId });
      form.reset();
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      onSuccess?.();
    },
  });

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>New Recipe</CardTitle>
        <CardDescription>
          Upload an image of a recipe to get started.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await form.handleSubmit();
        }}
      >
        <CardContent className="space-y-4">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ isSubmitting }) => {
              const isBusy = isSubmitting || uploadImageMutation.isPending;

              return (
                <form.Field name="image">
                  {(field) => (
                    <RecipeImageField
                      field={field}
                      inputRef={imageInputRef}
                      isBusy={isBusy}
                    />
                  )}
                </form.Field>
              );
            }}
          </form.Subscribe>
        </CardContent>
        <CardFooter>
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => {
              const isBusy = isSubmitting || uploadImageMutation.isPending;
              return (
                <Button
                  className="w-full"
                  disabled={!canSubmit || isBusy}
                  type="submit"
                >
                  {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isBusy ? "Adding..." : "Add Recipe"}
                </Button>
              );
            }}
          </form.Subscribe>
        </CardFooter>
      </form>
    </Card>
  );
}
