import { UtensilsCrossed } from "lucide-react";
import { parseIngredients } from "./utils";

type IngredientGroup = {
  heading: string | null;
  items: string[];
};

type IngredientListProps = {
  ingredients: string;
};

export function IngredientList({ ingredients }: IngredientListProps) {
  const ingredientGroups = parseIngredients(ingredients);
  const hasMultipleGroups = ingredientGroups.length > 1;

  if (ingredientGroups.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
        <UtensilsCrossed className="h-4 w-4 text-primary" />
        Ingredients
      </h3>
      <div className="mt-3 space-y-4">
        {ingredientGroups.map((group) => (
          <IngredientGroupSection
            group={group}
            hasMultipleGroups={hasMultipleGroups}
            key={group.heading ?? "default"}
          />
        ))}
      </div>
    </div>
  );
}

type IngredientGroupSectionProps = {
  group: IngredientGroup;
  hasMultipleGroups: boolean;
};

function IngredientGroupSection({
  group,
  hasMultipleGroups,
}: IngredientGroupSectionProps) {
  return (
    <div>
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
  );
}
