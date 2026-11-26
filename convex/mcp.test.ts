import { convexTest } from "convex-test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { oauthConfig } from "./lib/oauth";
import schema from "./schema";

const keys = vi.hoisted(() => ({ jwk: {} as JWK }));
vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();
  return {
    ...original,
    createRemoteJWKSet: () => original.createLocalJWKSet({ keys: [keys.jwk] }),
  };
});

const modules = import.meta.glob("./**/*.ts");
const ownerId = "user_alice";
const recipe = {
  name: "Tomato soup",
  recipeIngredient: ["2 tomatoes"],
  recipeInstructions: ["Simmer the tomatoes."],
};
let privateKey: CryptoKey;

beforeAll(async () => {
  const pair = await generateKeyPair("RS256");
  privateKey = pair.privateKey;
  keys.jwk = {
    ...(await exportJWK(pair.publicKey)),
    kid: "test",
    alg: "RS256",
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
});

async function accessToken(
  subject = ownerId,
  audience = "https://recipes.example/mcp",
  expiry = "5m",
  extra: Record<string, unknown> = {}
) {
  return await new SignJWT(extra)
    .setProtectedHeader({ alg: "RS256", kid: "test" })
    .setSubject(subject)
    .setIssuer("https://recipes.authkit.app")
    .setAudience(audience)
    .setExpirationTime(expiry)
    .sign(privateKey);
}

function setup() {
  vi.stubEnv("AUTHKIT_DOMAIN", "https://recipes.authkit.app");
  vi.stubEnv("MCP_RESOURCE_URL", "https://recipes.example/mcp");
  vi.stubEnv("MCP_ALLOWED_ORIGINS", "");
  return convexTest(schema, modules);
}

it("isolates accounts and protects anonymous legacy recipes from edits", async () => {
  const t = setup();
  const created = await t.mutation(internal.recipes.create, {
    ownerId,
    input: recipe,
  });
  const legacy = await t.run((ctx) =>
    ctx.db.insert("recipes", {
      imageIds: [],
      recipeSchema: created.recipe,
    })
  );
  expect(
    await t.query(internal.recipes.list, { ownerId: "user_bob", input: {} })
  ).toEqual({ items: [], nextCursor: null });
  for (const recipeId of [created.recipeId, legacy]) {
    await expect(
      t.query(internal.recipes.read, {
        ownerId: "user_bob",
        input: { recipeId },
      })
    ).rejects.toThrow("NOT_FOUND");
    await expect(
      t.mutation(internal.recipes.remove, {
        ownerId: "user_bob",
        input: { recipeId, expectedVersion: 1 },
      })
    ).rejects.toThrow("NOT_FOUND");
  }
  const publicRecipe = await t.query(api.recipe.getRecipe, {
    recipeId: created.recipeId,
  });
  expect(publicRecipe?.recipeSchema).toMatchObject({
    status: "success",
    name: recipe.name,
  });
  expect(publicRecipe).not.toHaveProperty("ownerId");
});

it("rejects stale writes and deletion and leaves the winning recipe intact", async () => {
  const t = setup();
  const { recipeId } = await t.mutation(internal.recipes.create, {
    ownerId,
    input: recipe,
  });
  await t.mutation(internal.recipes.update, {
    ownerId,
    input: {
      recipeId,
      expectedVersion: 1,
      recipe: { ...recipe, name: "Soup" },
    },
  });
  await expect(
    t.mutation(internal.recipes.update, {
      ownerId,
      input: { recipeId, expectedVersion: 1, recipe },
    })
  ).rejects.toThrow("VERSION_CONFLICT");
  await expect(
    t.mutation(internal.recipes.remove, {
      ownerId,
      input: { recipeId, expectedVersion: 1 },
    })
  ).rejects.toThrow("VERSION_CONFLICT");
  expect(
    await t.query(internal.recipes.read, { ownerId, input: { recipeId } })
  ).toMatchObject({ version: 2, recipe: { name: "Soup" } });
  await t.mutation(internal.recipes.remove, {
    ownerId,
    input: { recipeId, expectedVersion: 2 },
  });
  expect(await t.query(api.recipe.getRecipe, { recipeId })).toBeNull();
});

it("paginates only the current account and rejects invalid stored input", async () => {
  const t = setup();
  for (const name of ["First", "Second", "Third"]) {
    await t.mutation(internal.recipes.create, {
      ownerId,
      input: { ...recipe, name },
    });
  }
  const first = await t.query(internal.recipes.list, {
    ownerId,
    input: { limit: 2 },
  });
  expect(first.items.map((item) => item.name)).toEqual(["Third", "Second"]);
  const second = await t.query(internal.recipes.list, {
    ownerId,
    input: { limit: 2, cursor: first.nextCursor },
  });
  expect(second.items.map((item) => item.name)).toEqual(["First"]);
  expect(second.nextCursor).toBeNull();
  await expect(
    t.mutation(internal.recipes.create, {
      ownerId,
      input: { ...recipe, prepTime: "tomorrow" },
    })
  ).rejects.toThrow();
});

it("fails closed and advertises the configured OAuth resource", async () => {
  const t = setup();
  const response = await t.fetch("/mcp");
  expect(response.status).toBe(401);
  expect(response.headers.get("www-authenticate")).toContain(
    "https://recipes.example/.well-known/oauth-protected-resource/mcp"
  );
  vi.stubEnv("AUTHKIT_DOMAIN", "");
  expect(oauthConfig()).toBeNull();
  expect(await t.query(api.mcp.protectedResource, {})).toBeNull();
});

it("rejects wrong audiences, expired tokens, agents and forged signatures", async () => {
  const t = setup();
  const forgedPair = await generateKeyPair("RS256");
  const forged = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: "test" })
    .setSubject(ownerId)
    .setIssuer("https://recipes.authkit.app")
    .setAudience("https://recipes.example/mcp")
    .setExpirationTime("5m")
    .sign(forgedPair.privateKey);
  const invalidTokens = [
    await accessToken(ownerId, "https://led.example/mcp"),
    await accessToken(ownerId, undefined, "-1s"),
    await accessToken(ownerId, undefined, undefined, {
      sub_profile: "ai_agent",
    }),
    forged,
  ];
  for (const token of invalidTokens) {
    const response = await t.fetch("/mcp", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain("invalid_token");
  }
});

it("serves stateless MCP discovery and recipe tools through HTTP", async () => {
  const t = setup();
  const token = await accessToken();
  const rpc = async (method: string, params: unknown) => {
    const response = await t.fetch("/mcp", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("mcp-session-id")).toBeNull();
    return await response.json();
  };
  const initialized = await rpc("initialize", {
    protocolVersion: "2025-03-26",
    capabilities: {},
    clientInfo: { name: "test", version: "1" },
  });
  expect(initialized.result.serverInfo.name).toBe("reciparse");
  const tools = await rpc("tools/list", {});
  expect(tools.result.tools.map((tool: { name: string }) => tool.name)).toEqual(
    [
      "create_recipe",
      "list_recipes",
      "read_recipe",
      "update_recipe",
      "delete_recipe",
    ]
  );
  const created = await rpc("tools/call", {
    name: "create_recipe",
    arguments: recipe,
  });
  expect(created.result.isError).not.toBe(true);
  const { recipeId } = created.result.structuredContent;
  expect(created.result.structuredContent.websiteUrl).toBe(
    `https://recipes.example/recipe/${encodeURIComponent(recipeId)}`
  );
  const read = await rpc("tools/call", {
    name: "read_recipe",
    arguments: { recipeId },
  });
  expect(read.result.structuredContent.recipe.name).toBe(recipe.name);
  const conflict = await rpc("tools/call", {
    name: "delete_recipe",
    arguments: { recipeId, expectedVersion: 2 },
  });
  expect(conflict.result.isError).toBe(true);
  expect(JSON.parse(conflict.result.content[0].text).error.code).toBe(
    "VERSION_CONFLICT"
  );
});

it("rejects untrusted origins, URL credentials and oversized requests", async () => {
  const t = setup();
  expect(
    (await t.fetch("/mcp", { headers: { Origin: "https://evil.example" } }))
      .status
  ).toBe(403);
  expect((await t.fetch("/mcp?token=secret")).status).toBe(400);
  const token = await accessToken();
  expect(
    (await t.fetch("/mcp", { headers: { Authorization: `Bearer ${token}` } }))
      .status
  ).toBe(405);
  const response = await t.fetch("/mcp", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ padding: "x".repeat(70_000) }),
  });
  expect(response.status).toBe(413);
});
