import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

/**
 * `base` is the repository name on GitHub Pages, which serves the site from
 * a subpath — without it every asset 404s. Only on build: `npm run dev` stays
 * at the root. The app uses a hash router, so deep links need no 404 fallback.
 */
const REPO = "/rta-smartinvestigationinitiative-demo/"

export default defineConfig(({ command }) => ({
  base: command === "build" ? REPO : "/",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3100,
  },
  // Vitest transforms test files outside the react plugin's path, so the JSX
  // runtime has to be stated here or `.jsx` under test compiles classic and
  // throws "React is not defined".
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}))
