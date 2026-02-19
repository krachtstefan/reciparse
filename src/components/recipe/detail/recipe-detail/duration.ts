import { Temporal } from "@js-temporal/polyfill";

export function formatDuration(iso8601Duration: string, locale = "en"): string {
  try {
    const duration = Temporal.Duration.from(iso8601Duration);
    return duration.toLocaleString(locale);
  } catch {
    return iso8601Duration;
  }
}
