type RecipeNutritionProps = {
  nutrition: string;
};

export function RecipeNutrition({ nutrition }: RecipeNutritionProps) {
  return (
    <div className="rounded-lg bg-muted/60 p-4">
      <p className="mb-1.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
        Nutrition
      </p>
      <p className="whitespace-pre-line text-foreground text-sm leading-relaxed">
        {nutrition}
      </p>
    </div>
  );
}
