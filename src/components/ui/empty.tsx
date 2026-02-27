import type * as React from "react";
import { cn } from "@/lib/utils";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center",
        className
      )}
      data-slot="empty"
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      data-slot="empty-header"
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("font-medium text-base", className)}
      data-slot="empty-title"
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="empty-description"
      {...props}
    />
  );
}

export { Empty, EmptyDescription, EmptyHeader, EmptyTitle };
