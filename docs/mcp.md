# Reciparse MCP

The website serves a stateless Streamable HTTP endpoint at `/mcp`. A TanStack
server route forwards it to the paired Convex HTTP action. WorkOS AuthKit handles
OAuth login, consent, PKCE, registration and refresh. Convex verifies access
tokens with the environment's JWKS, exact issuer, resource audience and expiry.

This follows wledraw's transport and authentication approach. The application
model stays small: recipes use the existing schema.org fields and website pages.
MCP-created recipes add a WorkOS owner ID and a monotonically increasing version.
Existing anonymous photo uploads continue to work.

## Tools

| Tool | Purpose |
| --- | --- |
| `create_recipe` | Save structured recipe content and return its public website link. |
| `list_recipes` | List this account's recipes, newest first, with cursor pagination. |
| `read_recipe` | Read the full recipe and current version. |
| `update_recipe` | Replace recipe content at `expectedVersion`. |
| `delete_recipe` | Delete the recipe and public page at `expectedVersion`. |

The assistant extracts recipe content from the user's photos, text or a website
using its own tools, then saves it here. There is no second server-side AI call,
image transfer protocol, job queue or draft/publish workflow for MCP. The existing
website photo-extraction workflow still uses Convex Workflow and OpenRouter.

Recipe pages are public to anyone with their link. Ownership restricts the MCP
collection, edits and deletion; it does not make the website page private.
Anonymous recipes cannot be claimed or edited through MCP. Owner IDs and access
tokens are never returned in tool results or public recipe responses.

Input uses `name`, `description`, `inLanguage`, `recipeYield`, `prepTime`,
`cookTime`, `totalTime`, `recipeIngredient`, `recipeInstructions`, `notes` and
`nutrition`. Ingredients and instructions are arrays of strings. Optional strings
default to empty. Durations use ISO 8601, such as `PT30M`; language uses a BCP 47
tag, such as `de`. Do not invent unknown nutritional information or source details.
Read results contain the stored schema.org structure: instruction objects have
`text`, notes are in `comment.text`, nutrition is in `nutrition.description`.

Updates replace all editable content. Read first and preserve fields that should
remain. `VERSION_CONFLICT` means another client has changed the recipe; reread
before retrying. Creation is not idempotent: after a lost response, list recipes
before repeating it. Deletion is permanent.

Pagination defaults to 20, accepts 1–50, and returns `nextCursor`. Pass it unchanged
until null. Tool errors return `isError: true` with a JSON error code and message.
Unexpected errors do not expose internal exception text.

## Configure WorkOS

Use the **Reciparse** project, independently of LEDraw. Configure each environment:

1. Enable Magic Auth and disable Email + Password, passkeys, SSO and social
   providers. Magic Auth sends a six-digit email code, not a clickable link.
2. Enable OAuth client registration for MCP clients, including DCR and CIMD.
3. Register the exact website `/mcp` URL as a resource indicator. Make it the
   default resource for clients that omit the `resource` parameter.
4. Use the WorkOS-hosted AuthKit domain. No paid custom domain is needed.

MCP needs no WorkOS API key, website cookie secret, or website login callback.
The OAuth client owns its callback. Issued access tokens remain valid until
expiry after a client disconnects.

## Configure Convex and Vercel

Set on each paired **Convex deployment**:

| Variable | Value |
| --- | --- |
| `AUTHKIT_DOMAIN` | That environment's HTTPS AuthKit origin |
| `MCP_RESOURCE_URL` | The exact HTTPS website `/mcp` URL |
| `MCP_ALLOWED_ORIGINS` | Optional comma-separated exact browser origins |

Without valid issuer and resource configuration, authentication fails closed.
No static-token fallback exists. Requests with an Origin header are denied
unless explicitly allowed; ordinary native clients need no Origin setting.
Credentials in query parameters are rejected. POST bodies are limited to 64 KiB.
GET and DELETE return 405 after authentication; no server sessions or listening
SSE streams are kept.

Vercel continues to need `VITE_CONVEX_URL` for the matching backend. The server
queries that backend's `CONVEX_SITE_URL`; there is no new duplicated HTTP origin
setting. Never put secrets in `VITE_` variables.

Deploy the backend:

```sh
pnpm exec convex dev --once --tail-logs disable
```

Use the existing Vercel/Convex production deployment flow for production.
Previews must use a staging WorkOS environment and a separate Convex deployment.
Register a stable branch alias as their audience, not a changing deployment URL.

Public OAuth metadata is served at both:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-protected-resource/mcp`

Unauthenticated `/mcp` requests return a 401 Bearer challenge pointing at the
metadata. Both metadata routes allow cross-origin discovery and disable caching.
Recipe links derive from the configured resource origin, never a caller header.

## Connect and verify

Add the deployed website's `/mcp` URL to an OAuth-capable remote MCP client.
Complete WorkOS email-code sign-in and consent. Use the same email in other
clients to access the same collection.

```sh
pnpm check
pnpm build
```

Automated tests cover actual signed JWT validation with a local test JWKS,
wrong audiences, expiry, forged signatures, agent-token rejection, HTTP MCP
initialization/discovery/tool execution, origin/body limits, account isolation,
pagination, stale writes, and public recipe compatibility.

For live acceptance, connect through the deployed website with two accounts.
Create a recipe, open its website link, reconnect and read it, update it, verify
a stale update fails, then delete it and check that the link returns 404.
The second account must not list, read through MCP, edit or delete the first
account's recipes. Also verify the existing website photo-upload flow.

Do not treat local JWT tests as proof of WorkOS login, consent or refresh.

## Preview acceptance, 2026-11-27

The branch `feat/mcp-server` was deployed to:

https://reciparse-git-feat-mcp-server-stefan-krachts-projects.vercel.app/mcp

The live MCP SDK client passed WorkOS discovery, dynamic registration, email-code
sign-in, consent, PKCE and token exchange, then initialized the hosted MCP server.
It created a recipe, checked its public page, listed and read it, updated it,
confirmed a stale delete returned `VERSION_CONFLICT`, and deleted it. The public
page then returned 404. No test recipe was retained.

Staging settings were reread: Magic Auth enabled; password, passkeys, enterprise
SSO and all social providers disabled. The preview uses the separate Reciparse
WorkOS staging environment and branch-specific Convex backend.

Local checks passed all 43 tests, lint, types and dependency checks. The production
build passed after upgrading TanStack Start to address Vercel's security block.
Live refresh, a second-account isolation check and the existing photo-upload
workflow were not exercised by this acceptance run.

Production has not been changed. Before promoting, configure the Reciparse
WorkOS production environment with the same email-only methods and registration
settings, register `https://recipe.stefan.wtf/mcp`, and set its issuer and resource
on the production Convex deployment. Repeat live acceptance against production
after deploying.
