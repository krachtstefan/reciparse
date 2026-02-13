import { Link } from "@tanstack/react-router";
import { ScanText } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="relative mb-8 text-center">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-balance font-serif text-3xl text-foreground sm:text-4xl">
          <Link className="hover:text-foreground" to="/">
            Reciparse
          </Link>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
          Upload a photo of any recipe from a cookbook, Instagram, or a
          screenshot and get the full recipe extracted and structured instantly.
        </p>
      </header>
      {children}
    </div>
  );
}
