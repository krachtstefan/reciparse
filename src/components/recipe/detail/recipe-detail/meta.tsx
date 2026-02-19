import { ChefHat, Clock, Flame, Users } from "lucide-react";
import type React from "react";
import type { SchemaOrgRecipeFields } from "../../../../../convex/helper";

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
  recipe: SchemaOrgRecipeFields;
};

export function RecipeMeta({ recipe }: RecipeMetaProps) {
  const metaCards = [
    {
      icon: <Clock className="size-4" />,
      label: "Prep",
      value: recipe.prepTime || "-",
    },
    {
      icon: <Flame className="size-4" />,
      label: "Cook",
      value: recipe.cookTime || "-",
    },
    {
      icon: <Users className="size-4" />,
      label: "Yield",
      value: recipe.recipeYield || "-",
    },
    {
      icon: <ChefHat className="size-4" />,
      label: "Total",
      value: recipe.totalTime || "-",
    },
  ];

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
