import { Separator } from "@/components/ui/separator";
import { Skeleton as UISkeleton } from "@/components/ui/skeleton";

const META_CARD_KEYS = ["prep", "cook", "yield", "total"] as const;
const INGREDIENT_KEYS = ["i1", "i2", "i3", "i4", "i5", "i6"] as const;
const STEP_KEYS = ["s1", "s2", "s3", "s4"] as const;

export function Skeleton() {
  return (
    <div className="fade-in animate-in space-y-6 duration-300">
      {/* Title */}
      <div>
        <UISkeleton className="h-7 w-3/4" />
        <UISkeleton className="mt-2 h-4 w-full" />
        <UISkeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-3 flex gap-1.5">
          <UISkeleton className="h-5 w-16 rounded-full" />
          <UISkeleton className="h-5 w-20 rounded-full" />
          <UISkeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      <Separator />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {META_CARD_KEYS.map((key) => (
          <UISkeleton className="h-20 rounded-lg" key={key} />
        ))}
      </div>

      <Separator />

      {/* Ingredients */}
      <div>
        <UISkeleton className="h-6 w-32" />
        <div className="mt-3 space-y-2">
          {INGREDIENT_KEYS.map((key, i) => (
            <UISkeleton
              className="h-4"
              key={key}
              style={{ width: `${75 + i * 4}%` }}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Instructions */}
      <div>
        <UISkeleton className="h-6 w-32" />
        <div className="mt-3 space-y-4">
          {STEP_KEYS.map((key) => (
            <div className="flex gap-3" key={key}>
              <UISkeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <UISkeleton className="h-4 w-full" />
                <UISkeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
