import { z } from "zod";

export const DEFAULT_THEME_COLOR = "oklch(1 0 0)" as const;
const DARK_THEME_COLOR = "oklch(0.13 0.028 261.692)" as const;
export const THEME_COOKIE_KEY = "reciparse-theme" as const;
const THEME_STORAGE_KEY = THEME_COOKIE_KEY;

export const LIGHT_THEME = "light" as const;
export const DARK_THEME = "dark" as const;
export const themeSchema = z.enum([LIGHT_THEME, DARK_THEME]);

export type Theme = z.infer<typeof themeSchema>;

const isTheme = (value: unknown): value is Theme => {
  return themeSchema.safeParse(value).success;
};

export const isDarkTheme = (theme: Theme): boolean => theme === DARK_THEME;

const getSystemTheme = (): Theme => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK_THEME
    : LIGHT_THEME;
};

const resolveThemePreference = (value: unknown): Theme => {
  return isTheme(value) ? value : getSystemTheme();
};

export const parseThemeCookie = (
  cookieHeader: string | null | undefined
): Theme | null => {
  if (!cookieHeader) {
    return null;
  }

  for (const cookieEntry of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookieEntry.trim().split("=");
    if (rawName !== THEME_COOKIE_KEY) {
      continue;
    }

    const cookieValue = rawValueParts.join("=");
    if (isTheme(cookieValue)) {
      return cookieValue;
    }
  }

  return null;
};

export const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return LIGHT_THEME;
  }

  const cookieTheme = parseThemeCookie(document.cookie);
  if (cookieTheme) {
    return cookieTheme;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return resolveThemePreference(storedTheme);
};

export const persistThemeLocally = (theme: Theme): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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

  document.documentElement.classList.toggle(DARK_THEME, isDarkTheme(theme));
  document.documentElement.style.colorScheme = theme;
  syncThemeColorMetaTag();
};

export const getThemeInitializationScript = (): string => `(() => {
  const lightTheme = "${LIGHT_THEME}";
  const darkTheme = "${DARK_THEME}";
  const storageKey = "${THEME_STORAGE_KEY}";
  const cookieValue = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith("${THEME_COOKIE_KEY}="))
    ?.slice(${THEME_COOKIE_KEY.length + 1});
  const storedTheme = window.localStorage.getItem(storageKey);
  const themePreference = cookieValue === darkTheme || cookieValue === lightTheme
    ? cookieValue
    : storedTheme === darkTheme || storedTheme === lightTheme
      ? storedTheme
      : null;
  const theme = themePreference
    ? themePreference
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? darkTheme
      : lightTheme;
  const isDark = theme === darkTheme;
  const root = document.documentElement;
  root.classList.toggle(darkTheme, isDark);
  root.style.colorScheme = theme;

  const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
  if (themeColorMetaTag) {
    themeColorMetaTag.setAttribute(
      "content",
      isDark ? "${DARK_THEME_COLOR}" : "${DEFAULT_THEME_COLOR}"
    );
  }
})();`;
