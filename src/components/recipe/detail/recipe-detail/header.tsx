import type { SchemaOrgRecipeFields } from "convex/validators/recipe";

type RecipeHeaderProps = {
  recipe: SchemaOrgRecipeFields;
};

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  const imageUrls = Array.from(
    new Set(recipe.image.filter((url) => Boolean(url)))
  );
  const hasImages = imageUrls.length > 0;

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

      {hasImages && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {imageUrls.map((imageUrl) => (
            <div
              className="overflow-hidden rounded-lg border border-border bg-muted/30"
              key={imageUrl}
            >
              <img
                alt={recipe.name ? `${recipe.name} image` : "Recipe image"}
                className="h-auto max-h-[360px] w-full object-contain"
                height={900}
                loading="lazy"
                src={imageUrl}
                width={1200}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
