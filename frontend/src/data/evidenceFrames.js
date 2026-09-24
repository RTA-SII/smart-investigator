/**
 * Evidence frames.
 *
 * Two pools feed the evidence tiles. Anything in `assets/evidence/` is a
 * generic camera frame — the in-cab and forward views every complaint can
 * use. Anything in `assets/evidence/types/` shows a specific allegation, and
 * is only ever shown on complaints of that reason: a driver waving a fare
 * away belongs on a refusal, not on a harassment case.
 *
 * Naming decides everything, so adding imagery needs no code change here:
 *
 *   incab-*.webp                     generic in-cab camera still
 *   forward-*.webp                   generic forward road view
 *   types/<reason>-incab.webp        that reason, seen from inside the cab
 *   types/<reason>-forward.webp      that reason, seen through the screen
 *
 * `<reason>` is the complaint's `Reason / Purpose` in kebab case, with
 * `Refusal of Pick-up` shortened to `refusal-of-pickup`. A reason with no
 * imagery of its own falls back to the generic pool, which is the honest
 * result: the cameras recorded the trip, just nothing that names the
 * allegation.
 *
 * With both folders empty the tiles render SMC's dark frame with the
 * telemetry burn-in over it, which is what an operator sees while the camera
 * store is catching up.
 */

const load = (glob) =>
  Object.entries(glob)
    .map(([path, url]) => ({ name: path.split("/").pop().toLowerCase(), url }))
    .sort((a, b) => a.name.localeCompare(b.name))

const generic = load(
  import.meta.glob("@/assets/evidence/*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
  }),
)

const byReason = load(
  import.meta.glob("@/assets/evidence/types/*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
  }),
)

/** `Refusal of Pick-up` → `refusal-of-pickup`, to match the file names. */
const slug = (reason) =>
  String(reason ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const startsWith = (pool, prefix) =>
  pool.filter((f) => f.name.startsWith(prefix)).map((f) => f.url)

/** Which camera each evidence label is shot on. */
const CAMERA = {
  "In-cab camera still": "incab",
  "Forward road view": "forward",
  // The recording's poster frame is the forward view — it is the same camera.
  "Trip recording": "forward",
}

/**
 * The frame for one evidence tile.
 *
 * Reason-specific imagery wins the tile it was shot for; the generic pool
 * backs it. `seed` keeps the choice stable per complaint, so the same
 * complaint shows the same frames on every reload.
 *
 * The trip recording's poster takes the *next* frame rather than the same
 * one, because it sits directly beside the forward view and two tiles
 * showing an identical picture read as a bug rather than as two stills off
 * one camera.
 */
export function frameFor(label, seed, reason) {
  const camera = CAMERA[label]
  if (!camera) return null

  const specific = reason ? startsWith(byReason, `${slug(reason)}-${camera}`) : []
  const fallback = startsWith(generic, `${camera}-`)
  const preferred = specific.length ? specific : fallback
  if (!preferred.length && !generic.length) return null

  // Preferred frames first, then everything else that camera could show, so
  // the poster can move on to a second frame when one exists.
  const ordered = [...preferred, ...fallback.filter((u) => !preferred.includes(u))]
  const pool = ordered.length ? ordered : generic.map((f) => f.url)

  const i = Math.abs(seed) % preferred.length || 0
  if (label !== "Trip recording") return pool[i] ?? pool[0]

  return pool.length > 1 ? pool[(i + 1) % pool.length] : pool[i] ?? pool[0]
}

export const hasFrames = generic.length > 0 || byReason.length > 0
