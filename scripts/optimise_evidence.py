"""
Turn evidence source images into the web-sized files the app ships.

The originals are ~2 MB PNGs. This repository deploys to GitHub Pages, and
eleven of those is 22 MB of page weight for tiles that render about 220 px
wide — so they are resized and re-encoded as WebP, which costs roughly a
tenth of that with no visible difference at tile size.

    python scripts/optimise_evidence.py "<source folder>"

Source names decide where each file lands. A name containing a complaint type
goes to `types/` and is used only on complaints of that type; anything else is
a generic camera frame and joins the pool every other complaint draws from.
Add a new image by dropping it in the source folder and re-running — nothing
here needs editing unless RTA adds a complaint type.
"""

import os
import re
import sys
from PIL import Image

DEST = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "src", "assets", "evidence",
)

MAX_WIDTH = 1280
QUALITY = 80

# Source name (lowercased, matched loosely) → published name. The `incab`
# and `forward` suffixes say which camera the frame belongs to, which is what
# the app keys off when it fills the two image slots.
NAMING = [
    (r"in ?cab camera still 1", "incab-1"),
    (r"in ?cab camera still 2", "incab-2"),
    (r"forward view 1", "forward-1"),
    # The published stem must be the reason in kebab case exactly as the app
    # slugs it, or the image silently falls back to the generic pool.
    (r"reckless driving", "types/reckless-driving-forward"),
    (r"extending route", "types/extending-route-to-increase-fare-incab"),
    (r"physical harassment", "types/physical-harassment-incab"),
    (r"staff conduct inside", "types/staff-conduct-incab"),
    (r"staff conduct", "types/staff-conduct-forward"),
    (r"refusal of pick-?up +dashcam", "types/refusal-of-pick-up-incab"),
    (r"refusal of pick-?up 1", "types/refusal-of-pick-up-forward-1"),
    (r"refusal of pick-?up 2", "types/refusal-of-pick-up-forward-2"),
]


def published_name(filename):
    stem = os.path.splitext(filename)[0].lower().strip()
    for pattern, name in NAMING:
        if re.search(pattern, stem):
            return name
    return None


def main(src_dir):
    if not os.path.isdir(src_dir):
        sys.exit(f"No such folder: {src_dir}")

    total_in = total_out = 0
    unmatched = []

    for filename in sorted(os.listdir(src_dir)):
        if not filename.lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
            continue

        name = published_name(filename)
        if not name:
            unmatched.append(filename)
            continue

        src = os.path.join(src_dir, filename)
        out = os.path.join(DEST, name + ".webp")
        os.makedirs(os.path.dirname(out), exist_ok=True)

        im = Image.open(src).convert("RGB")
        if im.width > MAX_WIDTH:
            im = im.resize(
                (MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS
            )
        im.save(out, "WEBP", quality=QUALITY, method=6)

        total_in += os.path.getsize(src)
        total_out += os.path.getsize(out)
        print(f"  {name + '.webp':44} {im.width}x{im.height}  {os.path.getsize(out) // 1024:4d} KB")

    print(f"\n{total_in / 1e6:.1f} MB in -> {total_out / 1e6:.1f} MB out")
    for filename in unmatched:
        print(f"  ! no naming rule matched, skipped: {filename}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
