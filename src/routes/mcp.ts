import { createFileRoute } from "@tanstack/react-router";
import { forwardMcpRequest } from "@/lib/server/mcp";

export const Route = createFileRoute("/mcp")({
  server: {
    handlers: {
      POST: forwardMcpRequest,
      GET: forwardMcpRequest,
      DELETE: forwardMcpRequest,
      OPTIONS: forwardMcpRequest,
    },
  },
});
