import type { IngredientGroup } from "./types";

export function parseIngredients(raw: string): IngredientGroup[] {
  const lines = raw.split("\n").filter((l) => l.trim() !== "");
  const groups: IngredientGroup[] = [];
  let current: IngredientGroup = { heading: null, items: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      if (current.items.length > 0 || current.heading) {
        groups.push(current);
      }
      current = { heading: trimmed.slice(2).trim(), items: [] };
    } else {
      current.items.push(trimmed);
    }
  }

  if (current.items.length > 0 || current.heading) {
    groups.push(current);
  }

  return groups;
}

export function parseInstructions(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
}
