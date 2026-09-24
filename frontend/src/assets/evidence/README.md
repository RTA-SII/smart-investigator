# Evidence frames

Two pools fill the evidence tiles, and **naming decides everything** — adding
imagery needs no code change.

| File | Used for |
|---|---|
| `incab-*` | in-cab camera still, any complaint |
| `forward-*` | forward road view, any complaint |
| `types/<reason>-incab` | that reason only, seen from inside the cab |
| `types/<reason>-forward` | that reason only, seen through the screen |

`<reason>` is the complaint's `Reason / Purpose` in kebab case — lowercase,
non-alphanumerics collapsed to hyphens. `Refusal of Pick-up` becomes
`refusal-of-pick-up`, `Extending Route To Increase Fare` becomes
`extending-route-to-increase-fare`. Get this wrong and the image is simply
never shown: it falls back to the generic pool with no error.

Several frames per slot is fine — number them (`-forward-1`, `-forward-2`).
They are dealt out deterministically, so a given complaint always shows the
same ones, and the trip recording's poster takes a different frame from the
forward view wherever a second one exists.

A reason with no imagery of its own falls back to the generic pool, which is
the honest result: the cameras recorded the trip, just nothing that names the
allegation. With both folders empty the tiles render the dark frame plus
telemetry burn-in — what an operator sees while the camera store is catching
up.

Accepted: `.jpg` `.jpeg` `.png` `.webp`.

## Adding images

Don't commit originals — they are megabytes each, and this repository deploys
to GitHub Pages. Run them through the optimiser, which resizes to 1280 px wide
and re-encodes as WebP (about a tenth of the weight, no visible difference at
tile size):

```bash
python scripts/optimise_evidence.py "<folder of source images>"
```

Its `NAMING` table maps source filenames to published names. Add a line there
for a new complaint reason; it prints anything it could not match rather than
guessing.

## Do not add production captures

**This repository is public and deploys to GitHub Pages.**

Frames exported from SMC are real CCTV of identifiable drivers, tied to named
individuals and live violation records. Dropping them in here would publish
personal data to the open internet, outside the system of record. Do not.

If the demo genuinely needs evidence imagery, use synthetic or consented
stills — or make the repository private first.
