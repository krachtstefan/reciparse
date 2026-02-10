import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const DEFAULT_MODEL = "openai/gpt-4o-mini";
export const HEADLINE_MIN_LENGTH = 5;
export const HEADLINE_MAX_LENGTH = 80;

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

export const sanitizeHeadline = (headline: string): string => {
  const trimmed = headline.trim();
  const unquoted = trimmed.replace(/^["']|["']$/g, "");
  const collapsed = unquoted.replace(/\s+/g, " ").replace(/[.!?]+$/g, "");

  if (collapsed.length < HEADLINE_MIN_LENGTH) {
    throw new Error("Generated headline is too short");
  }

  if (collapsed.length > HEADLINE_MAX_LENGTH) {
    throw new Error("Generated headline is too long");
  }

  return collapsed;
};
