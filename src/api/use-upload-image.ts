import { useMutation } from "@tanstack/react-query";
import type { Id } from "convex/_generated/dataModel";

type UploadImageVariables = {
  uploadUrl: string;
  image: File;
};

type UploadImageResponse = {
  storageId: Id<"_storage">;
};

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
      return result.json() as Promise<UploadImageResponse>;
    },
  });
}
