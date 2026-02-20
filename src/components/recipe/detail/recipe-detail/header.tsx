import type { SchemaOrgRecipeFields } from "convex/validators/recipe";
import { ConditionalWrapper } from "@/components/conditional-wrapper";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type RecipeHeaderProps = {
  recipe: SchemaOrgRecipeFields;
};

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  const imageUrls = Array.from(
    new Set(recipe.image.filter((url) => Boolean(url)))
  );
  const hasImages = imageUrls.length > 0;
  const hasMultipleImages = imageUrls.length > 1;

  const imageChildren = (
    <>
      {imageUrls.map((imageUrl) => (
        <ConditionalWrapper
          condition={hasMultipleImages}
          key={imageUrl}
          wrapper={(children) => <CarouselItem>{children}</CarouselItem>}
        >
          <RecipeImage
            className={cn(hasMultipleImages && "mx-12")}
            imageUrl={imageUrl}
            recipeName={recipe.name}
          />
        </ConditionalWrapper>
      ))}
    </>
  );

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
        <ConditionalWrapper
          condition={hasMultipleImages}
          wrapper={(children) => (
            <Carousel className="mx-12 mt-5">
              <CarouselContent>{children}</CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        >
          {imageChildren}
        </ConditionalWrapper>
      )}
    </div>
  );
}

type RecipeImageProps = {
  imageUrl: string;
  recipeName: string;
  className?: string;
};

function RecipeImage({ imageUrl, recipeName, className }: RecipeImageProps) {
  return (
    <div
      className={cn(
        "mt-5 aspect-square overflow-hidden rounded-xl border border-border bg-muted/30",
        className
      )}
    >
      {/** biome-ignore lint/correctness/useImageSize: size is unknown */}
      <img
        alt={recipeName ? `${recipeName} image` : "Recipe image"}
        className="h-full w-full object-contain"
        loading="lazy"
        src={imageUrl}
      />
    </div>
  );
}
