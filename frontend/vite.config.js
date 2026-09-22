import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

/**
 * GitHub Pages serves a project site from `/<repo>/`, so `base` has to be the
 * repository name or every asset 404s. Only on build — `npm run dev` stays at
 * the root. The app uses a hash router, so deep links need no 404 fallback.
 *
 * If this ever moves to a custom domain or an organisation site, the site
 * becomes the root and `base` goes back to "/".
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
