import { createFileRoute } from "@tanstack/react-router";
import { UploadPage } from "@/components/recipe/upload-page";

export const Route = createFileRoute("/")({
  component: UploadPage,
});
