import type { SchemaOrgRecipeFields } from "convex/validators/recipe";

type RecipeHeaderProps = {
  recipe: SchemaOrgRecipeFields;
};

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  return (
    <div>
      <h2 className="text-balance font-serif text-2xl text-foreground">
        {recipe.name}
      </h2>
      {recipe.description && (
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          {recipe.description}
        </p>
      )}
    </div>
  );
}
