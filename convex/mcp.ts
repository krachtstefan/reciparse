import { query } from "./_generated/server";
import { oauthConfig, resourceMetadata } from "./lib/oauth";

export const httpActionsUrl = query({
  args: {},
  handler: () => {
    const url = process.env.CONVEX_SITE_URL;
    if (!url) {
      throw new Error("The backend HTTP Actions URL is unavailable.");
    }
    return url;
  },
});

export const protectedResource = query({
  args: {},
  handler: () => {
    const config = oauthConfig();
    return config ? resourceMetadata(config) : null;
  },
});
