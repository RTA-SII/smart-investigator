import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

/**
 * Served from the root of its own domain.
 *
 * GitHub Pages serves a project site from `/<repo>/`, which would need a base
 * path here — but this deploys to a custom domain instead, where the site is
 * the root. The `CNAME` in `public/` is what tells Pages that. If the custom
 * domain is ever dropped, `base` has to come back or every asset 404s.
 */
export default defineConfig(() => ({
  base: "/",
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
