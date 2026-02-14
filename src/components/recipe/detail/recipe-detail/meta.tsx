import { ChefHat, Clock, Flame, Users } from "lucide-react";
import type React from "react";
import type { MelaRecipeFields } from "../../../../../convex/helper";

type MetaCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function MetaCard({ icon, label, value }: MetaCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 p-3 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-foreground text-sm">{value}</span>
    </div>
  );
}

type RecipeMetaProps = {
  recipe: MelaRecipeFields;
};

export function RecipeMeta({ recipe }: RecipeMetaProps) {
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

  if (metaCards.length === 0) {
    return null;
  }

  return (
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
  );
}
