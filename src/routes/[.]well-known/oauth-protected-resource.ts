import { createFileRoute } from "@tanstack/react-router";
import { protectedResourceResponse } from "@/lib/server/mcp";

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: protectedResourceResponse,
      HEAD: protectedResourceResponse,
      OPTIONS: protectedResourceResponse,
    },
  },
});
