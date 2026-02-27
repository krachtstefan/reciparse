import { describe, expect, it } from "vitest";
import { escapeJsonForHtmlScript } from "../$recipeId";

describe("escapeJsonForHtmlScript", () => {
  it("returns plain JSON when no dangerous sequences are present", () => {
    const data = {
      name: "Pasta",
      description: "Simple recipe",
      steps: ["Boil water", "Cook pasta"],
    };

    expect(escapeJsonForHtmlScript(data)).toBe(JSON.stringify(data));
  });

  it("escapes closing script tags", () => {
    const data = {
      name: "</script><script>alert('xss')</script>",
    };

    expect(escapeJsonForHtmlScript(data)).toBe(
      '{"name":"<\\/script><script>alert(\'xss\')<\\/script>"}'
    );
  });

  it("escapes HTML comment tokens", () => {
    const data = {
      note: "<!-- comment -->",
    };

    expect(escapeJsonForHtmlScript(data)).toBe(
      '{"note":"<\\!-- comment --\\>"}'
    );
  });
});
