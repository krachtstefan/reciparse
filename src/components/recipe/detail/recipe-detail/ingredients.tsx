import { UtensilsCrossed } from "lucide-react";

type IngredientListProps = {
  ingredients: string[];
};

export function IngredientList({ ingredients }: IngredientListProps) {
  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
        <UtensilsCrossed className="size-4 text-primary" />
        Ingredients
      </h3>
      <ul className="mt-3 space-y-1.5">
        {ingredients.map((item) => (
          <li
            className="flex items-start gap-2 text-foreground text-sm leading-relaxed"
            key={item}
          >
            <span className="mt-2 block size-1 flex-shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
