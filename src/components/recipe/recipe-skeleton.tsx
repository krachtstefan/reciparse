import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeSkeleton() {
  return (
    <div className="fade-in animate-in space-y-6 duration-300">
      {/* Title */}
      <div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-2/3" />
        <div className="mt-3 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>

      <Separator />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className="h-20 rounded-lg" key={i} />
        ))}
      </div>

      <Separator />

      {/* Ingredients */}
      <div>
        <Skeleton className="h-6 w-32" />
        <div className="mt-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              className="h-4 w-full"
              key={i}
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Instructions */}
      <div>
        <Skeleton className="h-6 w-32" />
        <div className="mt-3 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="flex gap-3" key={i}>
              <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
