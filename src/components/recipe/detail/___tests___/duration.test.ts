import { describe, expect, it } from "vitest";
import {
  formatDuration,
  parseISO8601Duration,
} from "../recipe-detail/duration";

describe("formatDuration", () => {
  it("formats minutes", () => {
    expect(formatDuration("PT30M")).toBe("30 min");
  });

  it("formats hours", () => {
    expect(formatDuration("PT1H")).toBe("1 hr");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration("PT1H30M")).toBe("1 hr, 30 min");
  });

  it("formats days and hours", () => {
    expect(formatDuration("P1DT2H")).toBe("1 day, 2 hr");
  });

  it("formats complex duration", () => {
    expect(formatDuration("P1DT5H30M")).toBe("1 day, 5 hr, 30 min");
  });

  it("returns original string on invalid input", () => {
    expect(formatDuration("invalid")).toBe("invalid");
  });

  it("uses specified locale", () => {
    expect(formatDuration("PT1H30M", "es")).toBe("1 h y 30 min");
    expect(formatDuration("PT1H30M", "fr")).toBe("1\u202fh et 30\xa0min");
    expect(formatDuration("PT1H30M", "de")).toBe("1 Std., 30 Min.");
  });

  it("supports full BCP 47 locale codes with region", () => {
    // Test en-US - it should format successfully
    expect(formatDuration("PT1H30M", "en-US")).toBe("1 hr, 30 min");
  });

  it("defaults to English locale", () => {
    expect(formatDuration("PT30M")).toBe("30 min");
  });
});

describe("parseISO8601Duration", () => {
  it("parses minutes only", () => {
    expect(parseISO8601Duration("PT30M")).toEqual({
      days: 0,
      hours: 0,
      minutes: 30,
    });
  });

  it("parses hours only", () => {
    expect(parseISO8601Duration("PT2H")).toEqual({
      days: 0,
      hours: 2,
      minutes: 0,
    });
  });

  it("parses days only", () => {
    expect(parseISO8601Duration("P3D")).toEqual({
      days: 3,
      hours: 0,
      minutes: 0,
    });
  });

  it("parses hours and minutes", () => {
    expect(parseISO8601Duration("PT1H30M")).toEqual({
      days: 0,
      hours: 1,
      minutes: 30,
    });
  });

  it("parses days and hours", () => {
    expect(parseISO8601Duration("P1DT2H")).toEqual({
      days: 1,
      hours: 2,
      minutes: 0,
    });
  });

  it("parses all components", () => {
    expect(parseISO8601Duration("P1DT5H30M")).toEqual({
      days: 1,
      hours: 5,
      minutes: 30,
    });
  });

  it("returns null for invalid input", () => {
    expect(parseISO8601Duration("invalid")).toBeNull();
    expect(parseISO8601Duration("1H30M")).toBeNull();
    expect(parseISO8601Duration("")).toBeNull();
  });

  it("returns null for unsupported components (years, months, seconds)", () => {
    expect(parseISO8601Duration("P1Y")).toBeNull();
    expect(parseISO8601Duration("P1M")).toBeNull();
    expect(parseISO8601Duration("PT30S")).toBeNull();
  });
});
