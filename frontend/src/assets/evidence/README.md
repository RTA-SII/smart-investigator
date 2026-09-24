# Evidence frames

Drop capture stills here and they are picked up automatically at build time —
no code change required. Naming decides the slot:

| Pattern      | Used for                          |
|--------------|-----------------------------------|
| `incab-*`    | In-cab camera still               |
| `road-*`     | Forward road view                 |
| `video-*`    | Poster frame for the trip recording |
| anything else| general fallback                  |

Accepted: `.jpg` `.jpeg` `.png` `.webp`. Frames are dealt out deterministically,
so a given complaint always shows the same ones.

With this folder empty, the evidence tiles render the dark frame plus telemetry
burn-in — what an operator sees while the camera store is catching up.

## Do not add production captures

**This repository is public and deploys to GitHub Pages.**

Frames exported from SMC are real CCTV of identifiable drivers, tied to named
individuals and live violation records. Dropping them in here would publish
personal data to the open internet, outside the system of record. Do not.

If the demo genuinely needs evidence imagery, use synthetic or consented
stills — or make the repository private first.
