import { describe, expect, it } from "vitest";
import { formatDuration } from "../../../convex/lib/duration";

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
  });

  it("defaults to English locale", () => {
    expect(formatDuration("PT30M")).toBe("30 min");
  });
});
