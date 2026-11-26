import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

function backend() {
  return new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
}

export async function forwardMcpRequest({ request }: { request: Request }) {
  try {
    const backendUrl = new URL(
      "/mcp",
      await backend().query(api.mcp.httpActionsUrl)
    );
    backendUrl.search = new URL(request.url).search;
    const headers = new Headers();
    for (const name of [
      "accept",
      "authorization",
      "content-type",
      "origin",
      "mcp-protocol-version",
      "mcp-session-id",
      "last-event-id",
    ]) {
      const value = request.headers.get(name);
      if (value !== null) {
        headers.set(name, value);
      }
    }
    const response = await fetch(
      new Request(new Request(backendUrl, request), {
        headers,
        redirect: "error",
      })
    );
    const downstream = new Response(response.body, response);
    downstream.headers.delete("content-encoding");
    downstream.headers.delete("content-length");
    return downstream;
  } catch {
    return Response.json(
      { error: "MCP backend unavailable. Read before repeating a write." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function protectedResourceResponse({
  request,
}: {
  request: Request;
}) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "MCP-Protocol-Version");
    return new Response(null, { status: 204, headers });
  }
  try {
    const metadata = await backend().query(api.mcp.protectedResource);
    const response = Response.json(
      metadata ?? { error: "OAuth is not configured." },
      { status: metadata ? 200 : 404, headers }
    );
    return request.method === "HEAD" ? new Response(null, response) : response;
  } catch {
    return new Response(null, { status: 502, headers });
  }
}
