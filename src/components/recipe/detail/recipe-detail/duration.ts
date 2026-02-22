import { DurationFormat } from "@formatjs/intl-durationformat";

// ISO 8601 duration regex: P[nD][T[nH][nM]]
// Only matches durations composed of days, hours, and minutes.
// Rejects strings containing unsupported components (years, months, weeks, seconds).
const ISO_DURATION_RE =
  /^P(?!\d+Y)(?!\d+M)(?!\d+W)(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?!\d+S))?$/;

type ParsedDuration = {
  days: number;
  hours: number;
  minutes: number;
};

export const parseISO8601Duration = (iso: string): ParsedDuration | null => {
  const match = ISO_DURATION_RE.exec(iso);
  if (!match) {
    return null;
  }
  const [, days, hours, minutes] = match;
  return {
    days: Number(days ?? 0),
    hours: Number(hours ?? 0),
    minutes: Number(minutes ?? 0),
  };
};

const resolveLocale = (locale: string): string => {
  try {
    return Intl.getCanonicalLocales(locale)[0] ?? "en";
  } catch {
    return "en";
  }
};

export function formatDuration(iso8601Duration: string, locale = "en"): string {
  const parsed = parseISO8601Duration(iso8601Duration);
  if (!parsed) {
    return iso8601Duration;
  }

  const { days, hours, minutes } = parsed;
  if (days === 0 && hours === 0 && minutes === 0) {
    return iso8601Duration;
  }

  const safeLocale = resolveLocale(locale);

  try {
    const formatter = new DurationFormat(safeLocale, { style: "short" });
    return formatter.format({ days, hours, minutes });
  } catch {
    return iso8601Duration;
  }
}
