import { ChefHat, Clock, Flame, Users, UtensilsCrossed } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type MelaRecipe = {
  status: "success";
  id: string;
  title: string;
  text: string;
  images: string[];
  categories: string[];
  yield: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: string;
  instructions: string;
  notes: string;
  nutrition: string;
  link: string;
};

type OutputProps = {
  recipe: MelaRecipe;
};

type IngredientGroup = {
  heading: string | null;
  items: string[];
};

function parseIngredients(raw: string): IngredientGroup[] {
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

function parseInstructions(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "");
}

export function Output({ recipe }: OutputProps) {
  const ingredientGroups = parseIngredients(recipe.ingredients);
  const steps = parseInstructions(recipe.instructions);
  const hasMultipleGroups = ingredientGroups.length > 1;

  const metaCards = [
    recipe.prepTime && {
      icon: <Clock className="h-4 w-4" />,
      label: "Prep",
      value: recipe.prepTime,
    },
    recipe.cookTime && {
      icon: <Flame className="h-4 w-4" />,
      label: "Cook",
      value: recipe.cookTime,
    },
    recipe.yield && {
      icon: <Users className="h-4 w-4" />,
      label: "Yield",
      value: recipe.yield,
    },
    recipe.totalTime && {
      icon: <ChefHat className="h-4 w-4" />,
      label: "Total",
      value: recipe.totalTime,
    },
  ].filter(Boolean) as {
    icon: React.ReactNode;
    label: string;
    value: string;
  }[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-balance font-serif text-2xl text-foreground">
          {recipe.title}
        </h2>
        {recipe.text && (
          <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
            {recipe.text}
          </p>
        )}
        {recipe.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recipe.categories.map((cat) => (
              <Badge
                className="font-normal text-xs"
                key={cat}
                variant="secondary"
              >
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Meta grid */}
      {metaCards.length > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {metaCards.map((card) => (
              <MetaCard
                icon={card.icon}
                key={card.label}
                label={card.label}
                value={card.value}
              />
            ))}
          </div>
        </>
      )}

      <Separator />

      {/* Ingredients */}
      {ingredientGroups.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            Ingredients
          </h3>
          <div className="mt-3 space-y-4">
            {ingredientGroups.map((group) => (
              <div key={group.heading ?? "default"}>
                {hasMultipleGroups && group.heading && (
                  <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {group.heading}
                  </p>
                )}
                <ul className="space-y-1.5">
                  {group.items.map((item) => (
                    <li
                      className="flex items-start gap-2 text-foreground text-sm leading-relaxed"
                      key={item}
                    >
                      <span className="mt-2 block h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Instructions */}
      {steps.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
            <ChefHat className="h-4 w-4 text-primary" />
            Instructions
          </h3>
          <ol className="mt-3 space-y-4">
            {steps.map((text, index) => (
              <li className="flex gap-3" key={text}>
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                  {index + 1}
                </span>
                <p className="pt-0.5 text-foreground text-sm leading-relaxed">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Notes */}
      {recipe.notes && (
        <>
          <Separator />
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Notes
            </p>
            <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
              {recipe.notes}
            </p>
          </div>
        </>
      )}

      {/* Nutrition */}
      {recipe.nutrition && (
        <>
          <Separator />
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Nutrition
            </p>
            <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
              {recipe.nutrition}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 p-3 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-foreground text-sm">{value}</span>
    </div>
  );
}
