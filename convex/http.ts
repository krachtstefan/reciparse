import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { handleMcp } from "./lib/mcp";

const http = httpRouter();
for (const method of ["POST", "GET", "DELETE", "OPTIONS"] as const) {
  http.route({ path: "/mcp", method, handler: httpAction(handleMcp) });
}
export default http;
