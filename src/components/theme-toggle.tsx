import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyTheme,
  DARK_THEME,
  getPreferredTheme,
  isDarkTheme,
  LIGHT_THEME,
  type Theme,
} from "@/lib/theme";
import { writeThemeCookie } from "@/lib/theme.server";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    applyTheme(theme);
    writeThemeCookie({ data: theme }).catch(() => undefined);
  }, [theme]);

  const isDark = isDarkTheme(theme);

  return (
    <Button
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="rounded-full"
      onClick={() => setTheme(isDark ? LIGHT_THEME : DARK_THEME)}
      size="icon"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="outline"
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}
