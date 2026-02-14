import { describe, expect, it } from "vitest";
import { parseIngredients, parseInstructions } from "../recipe-detail/utils";

describe("parseIngredients", () => {
  it("parses simple ingredient list without headings", () => {
    const input = "2 cups flour\n1 tsp salt\n3 eggs";
    const result = parseIngredients(input);

    expect(result).toHaveLength(1);
    expect(result[0].heading).toBeNull();
    expect(result[0].items).toEqual(["2 cups flour", "1 tsp salt", "3 eggs"]);
  });

  it("parses ingredients with headings", () => {
    const input =
      "# For the dough\n2 cups flour\n1 tsp salt\n# For the filling\n3 eggs\n1 cup cheese";
    const result = parseIngredients(input);

    expect(result).toHaveLength(2);
    expect(result[0].heading).toBe("For the dough");
    expect(result[0].items).toEqual(["2 cups flour", "1 tsp salt"]);
    expect(result[1].heading).toBe("For the filling");
    expect(result[1].items).toEqual(["3 eggs", "1 cup cheese"]);
  });

  it("handles empty lines", () => {
    const input = "2 cups flour\n\n1 tsp salt\n\n3 eggs";
    const result = parseIngredients(input);

    expect(result).toHaveLength(1);
    expect(result[0].items).toEqual(["2 cups flour", "1 tsp salt", "3 eggs"]);
  });

  it("handles leading/trailing whitespace", () => {
    const input = "  2 cups flour  \n  1 tsp salt  ";
    const result = parseIngredients(input);

    expect(result[0].items).toEqual(["2 cups flour", "1 tsp salt"]);
  });

  it("returns empty array for empty string", () => {
    const result = parseIngredients("");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for whitespace-only string", () => {
    const result = parseIngredients("   \n\n   ");
    expect(result).toHaveLength(0);
  });

  it("handles heading with no items", () => {
    const input = "# Heading with no items\n# Another heading\n1 cup sugar";
    const result = parseIngredients(input);

    expect(result).toHaveLength(2);
    expect(result[0].heading).toBe("Heading with no items");
    expect(result[0].items).toHaveLength(0);
    expect(result[1].heading).toBe("Another heading");
    expect(result[1].items).toEqual(["1 cup sugar"]);
  });

  it("handles single item without heading", () => {
    const result = parseIngredients("1 egg");

    expect(result).toHaveLength(1);
    expect(result[0].heading).toBeNull();
    expect(result[0].items).toEqual(["1 egg"]);
  });

  it("handles heading only", () => {
    const result = parseIngredients("# Just a heading");

    expect(result).toHaveLength(1);
    expect(result[0].heading).toBe("Just a heading");
    expect(result[0].items).toHaveLength(0);
  });
});

describe("parseInstructions", () => {
  it("parses simple instruction list", () => {
    const input = "Preheat oven to 350°F\nMix ingredients\nBake for 30 minutes";
    const result = parseInstructions(input);

    expect(result).toEqual([
      "Preheat oven to 350°F",
      "Mix ingredients",
      "Bake for 30 minutes",
    ]);
  });

  it("handles empty lines", () => {
    const input = "Step 1\n\nStep 2\n\nStep 3";
    const result = parseInstructions(input);

    expect(result).toEqual(["Step 1", "Step 2", "Step 3"]);
  });

  it("trims whitespace from lines", () => {
    const input = "  Step 1  \n  Step 2  ";
    const result = parseInstructions(input);

    expect(result).toEqual(["Step 1", "Step 2"]);
  });

  it("returns empty array for empty string", () => {
    const result = parseInstructions("");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for whitespace-only string", () => {
    const result = parseInstructions("   \n\n   ");
    expect(result).toHaveLength(0);
  });

  it("handles single instruction", () => {
    const result = parseInstructions("Bake at 350°F");
    expect(result).toEqual(["Bake at 350°F"]);
  });

  it("handles instruction with extra whitespace", () => {
    const result = parseInstructions("Mix   ingredients   well");
    expect(result).toEqual(["Mix   ingredients   well"]);
  });
});
