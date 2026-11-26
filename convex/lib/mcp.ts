import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import { listInput, readInput, recipeInput, versionedInput } from "./contracts";
import { bearerChallenge, oauthConfig, verifyAccessToken } from "./oauth";

const bearerPattern = /^Bearer ([A-Za-z0-9._~+/-]+=*)$/i;
const credentialNamePattern =
  /token|auth|key|secret|password|credential|code|session/i;
const credentialValuePattern = /^Bearer\s|^eyJ[\w-]*\.[\w-]+\./i;
const publicError = z.object({ code: z.string(), message: z.string() });

function applicationError(error: unknown) {
  if (error instanceof z.ZodError) {
    return { code: "INVALID_INPUT", message: "Check the tool's input schema." };
  }
  if (error instanceof ConvexError) {
    let data: unknown = error.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = null;
      }
    }
    const parsed = publicError.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
  }
  return {
    code: "INTERNAL_ERROR",
    message:
      "The operation failed. Read or list recipes before retrying a write.",
  };
}

function createServer(ctx: ActionCtx, ownerId: string, resource: string) {
  const websiteOrigin = new URL(resource).origin;
  const server = new McpServer(
    { name: "reciparse", version: "1.0.0" },
    {
      instructions:
        "Reciparse stores recipes and gives each a shareable website page. " +
        "Use your own vision or browsing to extract a recipe from user-provided photos, URLs, or text, then create_recipe to save it. " +
        "Preserve the source language, quantities and steps. Leave unknown fields empty; do not invent missing details or nutrition. " +
        "Creating a recipe publishes a page readable by anyone with its link. Explain this when saving sensitive content. " +
        "Only this account's recipes can be listed, read, updated or deleted through these tools. " +
        "The same WorkOS account shares recipes across connected clients. Show websiteUrl after saving. " +
        "Updates replace the complete recipe. Read first and retain fields the user did not ask to change. " +
        "Use the returned version as expectedVersion; reread after VERSION_CONFLICT. " +
        "Creation is not idempotent: after a lost response, list recipes before repeating it. " +
        "Lists are newest-first with up to 50 items; pass nextCursor unchanged until null.",
    }
  );

  function withLink<T extends { recipeId: string }>(result: T) {
    return {
      ...result,
      websiteUrl: `${websiteOrigin}/recipe/${encodeURIComponent(result.recipeId)}`,
    };
  }

  function register(
    name: string,
    description: string,
    inputSchema: z.ZodObject,
    readOnly: boolean,
    execute: (input: unknown) => Promise<Record<string, unknown>>
  ) {
    server.registerTool(
      name,
      {
        description,
        inputSchema,
        annotations: {
          readOnlyHint: readOnly,
          destructiveHint: name === "update_recipe" || name === "delete_recipe",
          idempotentHint: readOnly,
          openWorldHint: false,
        },
      },
      async (input) => {
        try {
          const result = await execute(input);
          return {
            content: [{ type: "text", text: JSON.stringify(result) }],
            structuredContent: result,
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: applicationError(error) }),
              },
            ],
          };
        }
      }
    );
  }

  register(
    "create_recipe",
    "Save a structured recipe to your account and publish a shareable website page. Extract source content using your own vision/browsing first. No server AI call or image upload. Unknown optional fields may be omitted. This is not idempotent; list recipes after a lost response before repeating.",
    recipeInput,
    false,
    async (input) =>
      withLink(
        await ctx.runMutation(internal.recipes.create, { ownerId, input })
      )
  );
  register(
    "list_recipes",
    "List your saved recipes, newest first. Returns summaries, versions, website links and nextCursor. Pass nextCursor unchanged to continue.",
    listInput,
    true,
    async (input) => {
      const result = await ctx.runQuery(internal.recipes.list, {
        ownerId,
        input,
      });
      return { ...result, items: result.items.map(withLink) };
    }
  );
  register(
    "read_recipe",
    "Read one recipe from your account, including all stored schema.org fields, current version and shareable websiteUrl.",
    readInput,
    true,
    async (input) =>
      withLink(await ctx.runQuery(internal.recipes.read, { ownerId, input }))
  );
  register(
    "update_recipe",
    "Replace your recipe's complete content and update its public page. Read first, preserve unchanged fields, and pass its current version. VERSION_CONFLICT requires rereading before retrying.",
    versionedInput.extend({ recipe: recipeInput }),
    false,
    async (input) =>
      withLink(
        await ctx.runMutation(internal.recipes.update, { ownerId, input })
      )
  );
  register(
    "delete_recipe",
    "Permanently delete your recipe and its shareable page at expectedVersion. Read first; VERSION_CONFLICT requires rereading.",
    versionedInput,
    false,
    (input) => ctx.runMutation(internal.recipes.remove, { ownerId, input })
  );
  return server;
}

function isWebOrigin(value: string) {
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return (
      url.origin === value &&
      (url.protocol === "https:" || (url.protocol === "http:" && local))
    );
  } catch {
    return false;
  }
}

function requestHeaders(origin: string | null) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Expose-Headers", "WWW-Authenticate");
  }
  return headers;
}

export async function handleMcp(ctx: ActionCtx, request: Request) {
  const origin = request.headers.get("origin");
  const allowed = (process.env.MCP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim());
  if (origin !== null && !(isWebOrigin(origin) && allowed.includes(origin))) {
    return Response.json(
      { error: "Origin is not allowed." },
      { status: 403, headers: requestHeaders(null) }
    );
  }
  const headers = requestHeaders(origin);
  const respond = (status: number, error: string) =>
    Response.json({ error }, { status, headers });
  if (request.method === "OPTIONS") {
    headers.set("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type, Accept, MCP-Protocol-Version"
    );
    return new Response(null, { status: 204, headers });
  }
  for (const [name, value] of new URL(request.url).searchParams) {
    if (
      credentialNamePattern.test(name) ||
      credentialValuePattern.test(value)
    ) {
      return respond(400, "Use the Authorization header, not URL parameters.");
    }
  }
  const config = oauthConfig();
  const authorization = request.headers.get("authorization");
  const token = bearerPattern.exec(authorization ?? "")?.[1];
  const ownerId =
    config && token ? await verifyAccessToken(config, token) : null;
  if (!(config && ownerId)) {
    headers.set(
      "WWW-Authenticate",
      bearerChallenge(config, authorization !== null)
    );
    return respond(401, "Sign in with your Reciparse account.");
  }
  if (request.method !== "POST") {
    headers.set("Allow", "POST, OPTIONS");
    return respond(405, "This stateless endpoint accepts POST requests.");
  }
  const server = createServer(ctx, ownerId, config.resource);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    maxRequestBodySize: 65_536,
  });
  try {
    await server.connect(transport);
    const safeHeaders = new Headers(request.headers);
    safeHeaders.delete("authorization");
    const response = await transport.handleRequest(
      new Request(request, { headers: safeHeaders })
    );
    for (const [name, value] of headers) {
      response.headers.set(name, value);
    }
    return response;
  } catch {
    return respond(500, "MCP request failed. Read before repeating a write.");
  } finally {
    await server.close();
  }
}
