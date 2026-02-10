import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const DEFAULT_MODEL = "openai/gpt-4o-mini";
export const HEADLINE_MIN_LENGTH = 5;
export const HEADLINE_MAX_LENGTH = 80;

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});
