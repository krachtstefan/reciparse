import { Card, CardContent } from "@/components/ui/card";

const TIPS = [
  "Make sure the text is clearly readable in the image",
  "Crop out unnecessary elements around the recipe",
  "Works with cookbook pages, handwritten cards, and screenshots",
  "Supports multiple languages",
] as const;

export function TipsCard() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-3 font-medium text-foreground text-sm">
          Tips for best results
        </h3>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li
              className="flex items-start gap-2 text-muted-foreground text-xs leading-relaxed"
              key={tip}
            >
              <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-primary/60" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
