import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { applyTheme, getPreferredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <Button
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="outline"
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
