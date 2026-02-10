import { describe, expect, it } from "vitest";
import { sanitizeHeadline } from "./helper";

describe("sanitizeHeadline", () => {
  it("trims whitespace and collapses spaces", () => {
    expect(sanitizeHeadline("  Lemon   Pasta   ")).toBe("Lemon Pasta");
  });

  it("removes wrapping quotes", () => {
    expect(sanitizeHeadline('"Spicy Noodles"')).toBe("Spicy Noodles");
    expect(sanitizeHeadline("'Spicy Noodles'")).toBe("Spicy Noodles");
  });

  it("strips trailing punctuation", () => {
    expect(sanitizeHeadline("Creamy Soup...")).toBe("Creamy Soup");
    expect(sanitizeHeadline("Bright Salad?!")).toBe("Bright Salad");
  });

  it("throws for headlines that are too short", () => {
    expect(() => sanitizeHeadline("Pie")).toThrow(
      "Generated headline is too short"
    );
  });

  it("throws for headlines that are too long", () => {
    const longHeadline = "a".repeat(81);
    expect(() => sanitizeHeadline(longHeadline)).toThrow(
      "Generated headline is too long"
    );
  });
});
