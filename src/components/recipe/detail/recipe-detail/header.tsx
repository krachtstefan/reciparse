import { Badge } from "@/components/ui/badge";
import type { MelaRecipeFields } from "../../../../../convex/helper";

type RecipeHeaderProps = {
  recipe: MelaRecipeFields;
};

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  return (
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
  );
}
