"use client";

import { ChefHat, Clock, Flame, Users, UtensilsCrossed } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface Recipe {
  title: string;
  description: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cuisine: string;
  tags: string[];
  ingredients: {
    group: string;
    items: string[];
  }[];
  instructions: {
    step: number;
    text: string;
  }[];
  notes: string | null;
}

interface RecipeOutputProps {
  recipe: Recipe;
}

export function RecipeOutput({ recipe }: RecipeOutputProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-balance font-serif text-2xl text-foreground">
          {recipe.title}
        </h2>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          {recipe.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <Badge
              className="font-normal text-xs"
              key={tag}
              variant="secondary"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard
          icon={<Clock className="h-4 w-4" />}
          label="Prep"
          value={recipe.prepTime}
        />
        <MetaCard
          icon={<Flame className="h-4 w-4" />}
          label="Cook"
          value={recipe.cookTime}
        />
        <MetaCard
          icon={<Users className="h-4 w-4" />}
          label="Servings"
          value={String(recipe.servings)}
        />
        <MetaCard
          icon={<ChefHat className="h-4 w-4" />}
          label="Difficulty"
          value={recipe.difficulty}
        />
      </div>

      <Separator />

      {/* Ingredients */}
      <div>
        <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          Ingredients
        </h3>
        <div className="mt-3 space-y-4">
          {recipe.ingredients.map((group) => (
            <div key={group.group}>
              {recipe.ingredients.length > 1 && (
                <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {group.group}
                </p>
              )}
              <ul className="space-y-1.5">
                {group.items.map((item, i) => (
                  <li
                    className="flex items-start gap-2 text-foreground text-sm leading-relaxed"
                    key={i}
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

      <Separator />

      {/* Instructions */}
      <div>
        <h3 className="flex items-center gap-2 font-serif text-foreground text-lg">
          <ChefHat className="h-4 w-4 text-primary" />
          Instructions
        </h3>
        <ol className="mt-3 space-y-4">
          {recipe.instructions.map((step) => (
            <li className="flex gap-3" key={step.step}>
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs">
                {step.step}
              </span>
              <p className="pt-0.5 text-foreground text-sm leading-relaxed">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Notes */}
      {recipe.notes && (
        <>
          <Separator />
          <div className="rounded-lg bg-muted/60 p-4">
            <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Notes
            </p>
            <p className="text-foreground text-sm leading-relaxed">
              {recipe.notes}
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
