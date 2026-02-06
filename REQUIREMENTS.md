# Reciparse - Requirements Document

## Overview

Reciparse is a multi-tenant MCP (Model Context Protocol) server and web application that accepts input images (photos of recipes, labels, packaging, etc.), analyzes the visual content and any text within them, and produces structured output files that conform to a configurable recipe specification.

Tenants can interact with the system in two ways:
1. **MCP Server** - AI assistants (Claude, Cursor, etc.) call Reciparse tools directly
2. **Web UI** - Users upload images and manage their tenant through a browser

---

## Core Concepts

### Tenant
A self-contained workspace identified by an API key. Each tenant owns:
- A unique API key (with monthly rate limits)
- Recipe specifications (the schema/format their output files must conform to)
- Processing history (input images, analysis results, output files)
- Configuration (preferred AI model, output format preferences)

Tenants are created on-demand via the MCP server or web UI. No user authentication is required at this stage -- the API key is the sole identity and access credential.

### Recipe Spec
A tenant-provided schema that defines the structure and format of the output file. Recipe specs will be delivered separately and loaded per-tenant. The system uses the spec to transform raw image analysis into conformant structured output.

### Processing Pipeline
```
Input Image -> Vision AI Analysis -> Structured Extraction -> Recipe Spec Conformance -> Output File
```

---

## Architecture

### Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | TanStack Start | Full-stack SSR, server functions, API routes |
| Runtime | Node.js >= 22 | Already configured |
| Build | Vite 7 | Already configured |
| AI | Vercel AI SDK (`ai`) | Core dependency for all LLM interactions |
| MCP | `@modelcontextprotocol/server` | TypeScript SDK for MCP server implementation |
| Backend | Convex | Reactive database, serverless functions, file storage |
| Styling | Tailwind CSS v4 | Already configured |
| Testing | Vitest + Testing Library | Already configured |

### Why Convex

Convex replaces three separate concerns (PostgreSQL, Drizzle ORM, S3) with a single backend:
- **Database**: Document-based with end-to-end TypeScript type safety, schema validation, and indexes
- **File Storage**: Built-in `ctx.storage` API for uploads/downloads with URL generation
- **Server Functions**: Queries (reads), mutations (writes), and actions (external API calls like AI SDK)
- **Real-time**: Automatic reactive updates -- job status changes push to the web UI instantly
- **No migrations**: Schema changes are applied automatically via `npx convex dev`

### Project Structure (Target)

```
convex/                             # Convex backend (deployed separately)
├── schema.ts                       # Database schema (tenants, recipeSpecs, jobs)
├── tenants.ts                      # Tenant mutations & queries
├── recipeSpecs.ts                  # Recipe spec mutations & queries
├── jobs.ts                         # Job mutations & queries
├── ai.ts                           # Actions: vision analysis, spec transformation (calls AI SDK)
├── storage.ts                      # Mutations: file upload URL generation, file serving
├── http.ts                         # HTTP routes (SSE transport for MCP)
└── _generated/                     # Auto-generated types and API references

src/
├── mcp/                            # MCP server implementation
│   ├── server.ts                   # McpServer setup and tool registration
│   ├── tools/
│   │   ├── analyze-image.ts        # Core tool: analyze an input image
│   │   ├── create-tenant.ts        # Tool: create a new tenant
│   │   ├── get-tenant.ts           # Tool: retrieve tenant info
│   │   ├── list-jobs.ts            # Tool: list processing jobs
│   │   └── set-recipe-spec.ts      # Tool: configure a recipe spec
│   └── transport.ts                # Stdio + SSE transport adapters
├── lib/
│   ├── convex.ts                   # Convex client setup for server-side use
│   └── types.ts                    # Shared type definitions
├── routes/
│   ├── __root.tsx                  # Root layout
│   ├── index.tsx                   # Landing page / marketing
│   ├── setup.tsx                   # MCP server setup instructions
│   ├── app.tsx                     # Main app UI (upload, history, results)
│   └── api/
│       └── mcp.ts                  # SSE transport endpoint for MCP
├── components/
│   ├── image-upload.tsx            # Drag-and-drop image upload
│   ├── processing-status.tsx       # Job progress indicator (real-time via Convex)
│   ├── result-viewer.tsx           # Display processed output
│   ├── setup-guide.tsx             # MCP setup instructions component
│   └── tenant-dashboard.tsx        # Tenant overview and config
└── styles.css
```

---

## Functional Requirements

### FR-1: Tenant Management

**FR-1.1: Create Tenant**
- System generates a unique API key on tenant creation
- Tenants can be created via MCP tool call or web UI
- Each tenant gets a default monthly processing limit (configurable via env)
- Returns: tenant ID, API key, creation timestamp

**FR-1.2: Retrieve Tenant**
- Look up tenant by API key
- Returns: tenant metadata, usage stats, current rate limit status

**FR-1.3: Rate Limiting**
- Each API key has a monthly processing quota
- Quota resets on the 1st of each month
- Requests exceeding quota return a clear error with reset date
- Rate limit is enforced at the API/MCP layer before any AI processing

### FR-2: Recipe Spec Management

**FR-2.1: Set Recipe Spec**
- Tenant provides a recipe spec (JSON schema or structured definition)
- Spec is validated on upload and stored per-tenant
- A tenant can have multiple named specs (e.g., "nutrition-label", "recipe-card")
- Specs can be updated and versioned

**FR-2.2: List Recipe Specs**
- Return all specs belonging to a tenant

**FR-2.3: Default Spec**
- If no spec is provided, the system uses a sensible default extraction format
- Default produces: title, ingredients (name, quantity, unit), instructions (ordered steps), metadata (servings, prep time, cook time, etc.)

### FR-3: Image Analysis & Processing

**FR-3.1: Accept Input Image**
- Supported formats: JPEG, PNG, WebP, HEIC
- Maximum file size: 20MB
- Images accepted via: MCP tool (base64 or URL), web UI (file upload), API endpoint (multipart form)
- Input images are stored via Convex file storage (`ctx.storage`)

**FR-3.2: Analyze Image**
- Use Vercel AI SDK with a vision-capable model (e.g., GPT-4o, Claude Sonnet)
- Extract all visible text (OCR-like behavior via vision model)
- Identify and classify content: recipe title, ingredients, quantities, instructions, nutritional info, etc.
- Return raw analysis as structured intermediate format

**FR-3.3: Transform to Recipe Spec**
- Take the raw analysis and the tenant's active recipe spec
- Use AI SDK to produce a structured output conforming to the spec
- Validate output against the spec schema
- Return the conformant structured data

**FR-3.4: Generate Output File**
- Serialize the structured data to the requested format (JSON by default)
- Store output file via Convex file storage
- Return download URL (via `ctx.storage.getUrl`) or file content

**FR-3.5: Processing Jobs**
- Each image submission creates a "job" record in the database
- Job states: `pending` -> `analyzing` -> `transforming` -> `complete` | `failed`
- Jobs store: input image reference, raw analysis, transformed output, timing, error details
- Jobs are queryable by tenant (list, get by ID)

### FR-4: MCP Server

**FR-4.1: Server Identity**
- Name: `reciparse`
- Version: from package.json
- Capabilities: tools

**FR-4.2: Tools**

| Tool | Description | Input | Output |
|---|---|---|---|
| `create_tenant` | Create a new tenant workspace | `{ name?: string }` | `{ tenantId, apiKey }` |
| `analyze_image` | Process an image against a recipe spec | `{ apiKey, image (base64/URL), specName? }` | `{ jobId, status, result? }` |
| `get_job` | Get processing job status/result | `{ apiKey, jobId }` | `{ job }` |
| `list_jobs` | List processing jobs for a tenant | `{ apiKey, limit?, offset? }` | `{ jobs[] }` |
| `set_recipe_spec` | Upload/update a recipe spec | `{ apiKey, name, spec }` | `{ specId }` |
| `list_recipe_specs` | List tenant's recipe specs | `{ apiKey }` | `{ specs[] }` |
| `get_tenant` | Get tenant info and usage | `{ apiKey }` | `{ tenant }` |

**FR-4.3: Transports**
- **Stdio**: For local MCP clients (Claude Desktop, Cursor, etc.)
- **SSE (Streamable HTTP)**: For remote/web-based MCP clients, exposed via API route

**FR-4.4: Error Handling**
- Invalid API key: clear error message
- Rate limit exceeded: error with quota details and reset date
- Invalid image: error with supported formats
- Spec validation failure: error with details on what failed
- AI processing failure: error with retry guidance

### FR-5: Web UI

**FR-5.1: Landing Page** (`/`)
- Brief product description
- Call to action to get started
- Link to setup guide

**FR-5.2: Setup Guide** (`/setup`)
- Step-by-step instructions for connecting Reciparse as an MCP server
- Configuration snippets for: Claude Desktop, Cursor, Windsurf, generic MCP client
- Copy-to-clipboard for config JSON
- Explains how to create a tenant and get an API key

**FR-5.3: App Interface** (`/app`)
- **Tenant Context**: Enter API key to access tenant workspace
- **Image Upload**: Drag-and-drop or file picker for image upload
- **Spec Selector**: Choose which recipe spec to use for processing
- **Processing View**: Shows real-time job status during processing
- **Results View**: Display structured output, download as file
- **History**: List of past processing jobs with status and results

---

## Non-Functional Requirements

### NFR-1: Performance
- Image analysis should complete within 30 seconds for typical recipe images
- Web UI should be responsive and show processing progress
- MCP tool calls should return immediately with a job ID for long-running operations (or stream progress)

### NFR-2: Reliability
- Failed AI calls should be retried once before marking as failed
- All processing state is persisted to Convex (crash recovery)
- Convex handles file storage durability and encryption

### NFR-3: Observability
- Log all API/MCP requests with tenant ID, tool name, and duration
- Log AI SDK usage (model, tokens, cost estimate)
- Track rate limit consumption per tenant

### NFR-4: Security
- API keys are hashed before storage (store only prefix + hash)
- Convex queries/mutations enforce tenant-scoping (no cross-tenant access)
- Input validation on all MCP tool inputs and API endpoints
- No secrets in client-side code

### NFR-5: Developer Experience
- `pnpm dev` starts the web UI, `npx convex dev` runs the Convex backend (concurrent via script)
- MCP server testable via `npx @modelcontextprotocol/inspector`
- Clear error messages for misconfiguration
- Convex environment variables managed via `npx convex env` (dashboard or CLI)

---

## Data Model (Convex Schema)

Defined in `convex/schema.ts` using Convex's `defineSchema` and `defineTable` with `v` validators.

### tenants
| Field | Type | Notes |
|---|---|---|
| name | `v.optional(v.string())` | Optional display name |
| apiKeyPrefix | `v.string()` | First 8 chars of API key (for identification) |
| apiKeyHash | `v.string()` | Hashed API key |
| monthlyLimit | `v.number()` | Max processing jobs per month |
| currentMonthUsage | `v.number()` | Jobs processed this month |
| usageResetAt | `v.number()` | Timestamp: when usage counter resets |

**Indexes**: `by_apiKeyPrefix` on `["apiKeyPrefix"]`

### recipeSpecs
| Field | Type | Notes |
|---|---|---|
| tenantId | `v.id("tenants")` | Reference to tenants table |
| name | `v.string()` | Spec identifier (e.g., "nutrition-label") |
| version | `v.number()` | Auto-incrementing version |
| schema | `v.any()` | The spec definition (JSON object) |
| isDefault | `v.boolean()` | Whether this is the tenant's default spec |

**Indexes**: `by_tenantId` on `["tenantId"]`

### jobs
| Field | Type | Notes |
|---|---|---|
| tenantId | `v.id("tenants")` | Reference to tenants table |
| specId | `v.optional(v.id("recipeSpecs"))` | Reference to spec used (nullable) |
| status | `v.union(v.literal("pending"), ...)` | pending, analyzing, transforming, complete, failed |
| inputImageId | `v.optional(v.id("_storage"))` | Convex storage ID for input image |
| rawAnalysis | `v.optional(v.any())` | Raw vision model output |
| transformedOutput | `v.optional(v.any())` | Spec-conformant structured output |
| outputFileId | `v.optional(v.id("_storage"))` | Convex storage ID for output file |
| error | `v.optional(v.string())` | Error details if failed |
| modelUsed | `v.optional(v.string())` | AI model identifier |
| tokensUsed | `v.optional(v.number())` | Total tokens consumed |
| processingTimeMs | `v.optional(v.number())` | End-to-end processing duration |

**Indexes**: `by_tenantId` on `["tenantId"]`, `by_tenantId_status` on `["tenantId", "status"]`

### Convex Schema Example

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tenants: defineTable({
    name: v.optional(v.string()),
    apiKeyPrefix: v.string(),
    apiKeyHash: v.string(),
    monthlyLimit: v.number(),
    currentMonthUsage: v.number(),
    usageResetAt: v.number(),
  }).index("by_apiKeyPrefix", ["apiKeyPrefix"]),

  recipeSpecs: defineTable({
    tenantId: v.id("tenants"),
    name: v.string(),
    version: v.number(),
    schema: v.any(),
    isDefault: v.boolean(),
  }).index("by_tenantId", ["tenantId"]),

  jobs: defineTable({
    tenantId: v.id("tenants"),
    specId: v.optional(v.id("recipeSpecs")),
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("transforming"),
      v.literal("complete"),
      v.literal("failed"),
    ),
    inputImageId: v.optional(v.id("_storage")),
    rawAnalysis: v.optional(v.any()),
    transformedOutput: v.optional(v.any()),
    outputFileId: v.optional(v.id("_storage")),
    error: v.optional(v.string()),
    modelUsed: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    processingTimeMs: v.optional(v.number()),
  })
    .index("by_tenantId", ["tenantId"])
    .index("by_tenantId_status", ["tenantId", "status"]),
});
```

---

## Environment Variables

### TanStack Start (`.env`)

```bash
# Convex
CONVEX_URL=https://your-project.convex.cloud    # Set automatically by `npx convex dev`
```

### Convex Backend (set via `npx convex env set` or dashboard)

```bash
# AI (set on Convex dashboard/CLI, used in actions)
AI_PROVIDER=openai                  # openai | anthropic
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=gpt-4o                     # Default vision model

# Rate Limiting
DEFAULT_MONTHLY_LIMIT=100           # Default jobs per month per tenant
```

Note: Convex manages its own database and file storage -- no `DATABASE_URL` or S3 config needed. AI API keys are stored as Convex environment variables so they're available in actions (server-side only, never exposed to the client).

---

## Implementation Phases

### Phase 1: Foundation
- Initialize Convex project (`npx convex init`) and define schema in `convex/schema.ts`
- Implement tenant mutations/queries in `convex/tenants.ts` (create, get by API key, get by ID)
- Implement API key generation and hashing (in a Convex action or utility)
- Implement rate limiting logic in `convex/tenants.ts` (check, increment, reset)
- Set up Convex environment variables (AI keys, rate limit defaults)
- Set up Convex client for server-side use in MCP tools (`src/lib/convex.ts`)

### Phase 2: AI Processing Core
- Integrate Vercel AI SDK with vision model in a Convex action (`convex/ai.ts`)
- Implement image analysis action (accepts storage ID, calls vision model, returns structured data)
- Implement recipe spec mutations/queries in `convex/recipeSpecs.ts`
- Implement structured transformation action (raw analysis -> spec-conformant output)
- Implement job lifecycle mutations in `convex/jobs.ts` (create, update status, complete, fail)
- Implement file upload/download utilities in `convex/storage.ts` (generate upload URL, get file URL)
- Wire up the orchestrator: upload image -> create job -> analyze -> transform -> store output -> complete job

### Phase 3: MCP Server
- Set up `McpServer` with `@modelcontextprotocol/server`
- Register all tools (create_tenant, analyze_image, get_job, etc.)
- Tools call Convex mutations/actions via the server-side Convex client
- Implement stdio transport for local clients
- Implement SSE transport via API route for remote clients
- Test with MCP Inspector and Claude Desktop

### Phase 4: Web UI
- Replace scaffolded demo content with Reciparse UI
- Set up ConvexProvider in the app root for real-time queries
- Build landing page
- Build setup guide with config snippets
- Build image upload interface (using Convex file upload flow)
- Build processing status viewer (real-time via Convex `useQuery`)
- Build results viewer and job history (real-time via Convex)

### Phase 5: Polish & Production
- Add input validation and error handling throughout
- Add retry logic for AI calls
- Add observability (structured logging in actions)
- Write tests for core business logic
- Document Convex env setup and deployment
- CI/CD pipeline updates

---

## Dependencies to Add

```bash
# Convex (database, file storage, server functions)
pnpm add convex

# AI
pnpm add ai @ai-sdk/openai @ai-sdk/anthropic

# MCP
pnpm add @modelcontextprotocol/server zod

# Utilities
pnpm add nanoid
```

Note: Convex replaces `drizzle-orm`, `postgres`, `drizzle-kit`, `@aws-sdk/client-s3`, and `@aws-sdk/s3-request-presigner`. The AI SDK packages are used inside Convex actions (server-side).

---

## Open Questions

1. **Recipe Spec Format**: What does the recipe spec schema look like? (To be delivered separately)
2. **Output Formats**: Should the system support formats beyond JSON (e.g., YAML, CSV, XML)?
3. **Batch Processing**: Should the MCP server support processing multiple images in a single call?
4. **Webhooks**: Should tenants be notified when a job completes (useful for async MCP workflows)?
5. **Model Selection**: Should tenants be able to choose their preferred AI model, or is it system-wide?
