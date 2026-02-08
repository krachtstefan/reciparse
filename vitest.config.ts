import { fileURLToPath, URL } from "node:url";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Keep Vitest config minimal to avoid Vite plugins holding open handles.
const config = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
  ],
});

export default config;
