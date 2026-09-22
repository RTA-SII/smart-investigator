/**
 * The seeded pseudo-random generator behind every generated dataset.
 *
 * A linear congruential generator — not a good one, but deterministic and
 * identical on every reload, which is the whole point: the queue, the KPIs
 * and the charts have to agree with one another each time the demo opens.
 */
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** One item out of `arr`, chosen by the generator `r`. */
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
