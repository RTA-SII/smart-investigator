/**
 * Evidence frames.
 *
 * Anything dropped into `src/assets/evidence/` is picked up at build time and
 * dealt out across the complaint set — no code change needed to add or swap
 * captures. Naming decides which slot a frame can fill:
 *
 *   incab-*.jpg     in-cab camera stills
 *   road-*.jpg      forward road view
 *   video-*.jpg     poster frame for the trip recording
 *   *.jpg           anything else, used as a general fallback
 *
 * With the folder empty the evidence tiles render SMC's dark frame with the
 * telemetry burn-in over it, which is what an operator sees while the camera
 * store is catching up.
 */

const modules = import.meta.glob("@/assets/evidence/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
})

const byName = Object.entries(modules)
  .map(([path, url]) => ({ name: path.split("/").pop().toLowerCase(), url }))
  .sort((a, b) => a.name.localeCompare(b.name))

const pool = (prefix) => {
  const hit = byName.filter((f) => f.name.startsWith(prefix)).map((f) => f.url)
  return hit.length ? hit : byName.map((f) => f.url)
}

const POOLS = {
  "In-cab camera still": pool("incab-"),
  "Forward road view": pool("road-"),
  "Trip recording": pool("video-"),
}

/** Stable per complaint, so a given complaint always shows the same frames. */
export function frameFor(label, seed) {
  const p = POOLS[label]
  if (!p || !p.length) return null
  return p[seed % p.length]
}

export const hasFrames = byName.length > 0
