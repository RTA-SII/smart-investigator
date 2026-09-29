import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

/**
 * Where the site is served from, which is not the same on both hosts.
 *
 * Cloudflare Pages serves it at the root of its own hostname, so `base` is
 * "/". GitHub Pages serves a project site from `/<repo>/`, so its workflow
 * sets `VITE_BASE` to the repository name — without it every asset 404s.
 *
 * The root default is deliberate: Cloudflare is the protected deployment and
 * the one that should be hard to get wrong. When GitHub Pages is retired this
 * whole knob goes away and `base` is simply "/".
 *
 * `npm run dev` always serves from the root, whatever is set.
 */
const BASE = process.env.VITE_BASE ?? "/"

export default defineConfig(({ command }) => ({
  base: command === "build" ? BASE : "/",
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
