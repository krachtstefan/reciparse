import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  setResponseHeaders,
} from "@tanstack/react-start/server";
import {
  parseThemeCookie,
  THEME_COOKIE_KEY,
  type Theme,
  themeSchema,
} from "@/lib/theme";

const serializeThemeCookie = (theme: Theme): string => {
  const secureAttribute =
    process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${THEME_COOKIE_KEY}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${secureAttribute}`;
};

export const readThemeCookie = createServerFn({ method: "GET" }).handler(() => {
  return parseThemeCookie(getRequestHeader("Cookie"));
});

export const writeThemeCookie = createServerFn({ method: "POST" })
  .inputValidator(themeSchema)
  .handler(({ data }) => {
    setResponseHeaders(
      new Headers({
        "Set-Cookie": serializeThemeCookie(data),
      })
    );

    return data;
  });
