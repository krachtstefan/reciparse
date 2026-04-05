export const DEFAULT_THEME_COLOR = "oklch(1 0 0)" as const;
const DARK_THEME_COLOR = "oklch(0.13 0.028 261.692)" as const;
const THEME_STORAGE_KEY = "reciparse-theme" as const;

export type Theme = "light" | "dark";

export const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const syncThemeColorMetaTag = (): void => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMetaTag) {
    return;
  }

  const bodyBackgroundColor = window.getComputedStyle(
    document.body
  ).backgroundColor;
  if (!bodyBackgroundColor) {
    return;
  }

  themeColorMetaTag.setAttribute("content", bodyBackgroundColor);
};

export const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  syncThemeColorMetaTag();
};

export const getThemeInitializationScript = (): string => `(() => {
  const storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
  const theme = storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const isDark = theme === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = theme;

  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
  if (themeColorMetaTag) {
    themeColorMetaTag.setAttribute(
      "content",
      isDark ? "${DARK_THEME_COLOR}" : "${DEFAULT_THEME_COLOR}"
    );
  }
})();`;
