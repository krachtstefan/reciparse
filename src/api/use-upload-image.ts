import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";
import { z } from "zod";
import { resizeImage } from "./resize-image";

type UploadImageVariables = {
  uploadUrl: string;
  image: File;
};

const uploadImageResponseSchema = z.object({
  storageId: z.custom<Id<"_storage">>((value) => typeof value === "string", {
    message: "storageId must be a string",
  }),
});

export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ uploadUrl, image }: UploadImageVariables) => {
      const resized = await resizeImage(image);

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": resized.type },
        body: resized,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const response = await result.json();
      return uploadImageResponseSchema.parse(response);
    },
  });
}
