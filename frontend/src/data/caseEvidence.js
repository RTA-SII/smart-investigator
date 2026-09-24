import roadView from "@/assets/evidence/rta-1991332-h2f3/forward-road-view.webp"
import inCab from "@/assets/evidence/rta-1991332-h2f3/in-cab-still.webp"
import tripRecording from "@/assets/evidence/rta-1991332-h2f3/trip-recording.webm"

/**
 * Real evidence media, attached to one case.
 *
 * Every other complaint draws on the shared frame pool in `evidenceFrames.js`,
 * which is deliberately empty — the tiles render the dark frame and telemetry
 * burn-in an operator sees while the camera store is catching up. This case
 * carries actual footage instead, so a demo has one complaint that can be
 * opened and worked with the evidence genuinely there.
 *
 * The files are stock road footage under open licences, not captures from
 * SMC. The repository is public; see `assets/evidence/README.md` for why
 * production recordings can never come in here, and `CREDITS.md` for what
 * each file is and who made it.
 *
 * Kept in a subfolder on purpose: the pool globs `evidence/*` one level deep,
 * so nesting these keeps them out of it and off every other complaint.
 */
const RECKLESS_DRIVING = "RTA-1991332-H2F3"

export const CASE_EVIDENCE = {
  [RECKLESS_DRIVING]: (receivedAt) => [
    {
      kind: "video",
      label: "Trip recording",
      time: receivedAt,
      frame: roadView,
      src: tripRecording,
      type: "video/webm",
    },
    {
      kind: "image",
      label: "In-cab camera still",
      time: receivedAt,
      frame: inCab,
    },
    {
      kind: "image",
      label: "Forward road view",
      time: receivedAt,
      frame: roadView,
    },
    {
      kind: "doc",
      label: "CRM complaint transcript",
      time: receivedAt,
      frame: null,
    },
  ],
}

/** The evidence for a case, where real media has been attached to it. */
export const caseEvidence = (id, receivedAt) =>
  CASE_EVIDENCE[id]?.(receivedAt) ?? null
