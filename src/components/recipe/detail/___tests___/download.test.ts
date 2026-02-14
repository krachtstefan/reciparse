import { describe, expect, it } from "vitest";
import { getMelaRecipeFilename } from "../download";

describe("getMelaRecipeFilename", () => {
  it("creates a slugged filename from the title", () => {
    expect(getMelaRecipeFilename("Best Pancakes")).toBe(
      "best-pancakes.melarecipe"
    );
  });

  it("strips non-alphanumeric characters", () => {
    expect(getMelaRecipeFilename("Mom's #1 Soup!!!")).toBe(
      "mom-s-1-soup.melarecipe"
    );
  });

  it("transliterates umlaute to ascii", () => {
    expect(getMelaRecipeFilename("Käsebrötchen")).toBe(
      "kasebrotchen.melarecipe"
    );
  });

  it("drops emojis from the slug", () => {
    expect(getMelaRecipeFilename("Party 🎉 Cake")).toBe(
      "party-cake.melarecipe"
    );
  });

  it("replaces eszett with ss", () => {
    expect(getMelaRecipeFilename("Spaß")).toBe("spass.melarecipe");
  });

  it("falls back to recipe when title is empty", () => {
    expect(getMelaRecipeFilename(" ")).toBe("recipe.melarecipe");
  });

  it("falls back to recipe when title is missing", () => {
    expect(getMelaRecipeFilename()).toBe("recipe.melarecipe");
  });
});
