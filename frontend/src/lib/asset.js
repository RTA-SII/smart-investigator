/**
 * A path into `public/`, resolved against the deployed base.
 *
 * Vite rewrites asset URLs it can see — `url()` in CSS, imported modules —
 * but a raw string in JSX is invisible to it. On GitHub Pages the app is
 * served from a repository subpath, so `"/rta-logo.svg"` would 404. Anything
 * out of `public/` referenced from JS has to go through here.
 */
export const asset = (path) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`
