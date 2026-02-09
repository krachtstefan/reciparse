import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";
import { z } from "zod";

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
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": image.type },
        body: image,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const response = await result.json();
      return uploadImageResponseSchema.parse(response);
    },
  });
}
