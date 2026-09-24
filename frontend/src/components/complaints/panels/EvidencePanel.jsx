import { Camera, Download, FileText, Play } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { longStamp } from "@/lib/format"

const TAG_TONE = {
  image: "var(--destructive)",
  video: "var(--tone-info)",
  doc: "var(--primary)",
}

/**
 * Evidence tiles, laid out as SMC lays them out: four across, gap-3, each an
 * aspect box with the frame cover-fitted under a tag chip, captioned in small
 * caps below.
 *
 * `frame` carries the still; where a capture is unavailable the telemetry
 * burn-in still renders over a dark frame, which is what the operator sees
 * when the camera store is lagging.
 */
export function EvidencePanel({ complaint }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[rgb(23_28_143/0.1)] text-[var(--primary)]">
            <Camera className="size-4" />
          </span>
          <div className="min-w-0">
            <CardTitle>Evidence</CardTitle>
            <p className="truncate text-sm text-[var(--muted-foreground)]">
              {summarise(complaint.evidence)}
            </p>
          </div>
        </div>
        <Button size="sm">
          <Download />
          Download All Evidence
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
        {complaint.evidence.map((e) => (
          <figure key={e.label} className="flex min-w-0 flex-col">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0d1117]">
              {e.frame ? (
                <img
                  src={e.frame}
                  alt={e.label}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  {e.kind === "doc" ? (
                    <FileText className="size-7 text-white/30" />
                  ) : (
                    <Camera className="size-7 text-white/30" />
                  )}
                </div>
              )}

              {e.kind === "video" && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid size-11 place-items-center rounded-full bg-black/55">
                    <Play className="size-5 fill-white text-white" />
                  </span>
                </span>
              )}

              {e.kind !== "doc" && <Burnin complaint={complaint} />}

              <span
                className="absolute top-2 end-2 rounded px-2 py-0.5 text-[10px] font-bold tracking-[0.5px] text-white uppercase"
                style={{ background: TAG_TONE[e.kind] }}
              >
                {e.kind}
              </span>
            </div>

            <figcaption className="mt-2 min-w-0">
              <p className="truncate text-[11px] font-bold tracking-[0.3px] uppercase">
                {e.label}
              </p>
              <p className="truncate text-[11px] text-[var(--muted-foreground)]">
                {longStamp(e.time).split(" · ")[1]}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </Card>
  )
}

/** The telemetry the camera burns into the bottom of every capture. */
function Burnin({ complaint }) {
  const t = new Date(complaint.receivedAt)
  const hhmmss = [t.getHours(), t.getMinutes(), t.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":")

  return (
    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-x-2 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-4 pb-1 font-mono text-[8px] leading-tight text-[#7fe3ff]">
      <span>{hhmmss}</span>
      <span>{complaint.sideNumber}</span>
      <span>25.2048N</span>
      <span>55.2708E</span>
      <span>{34 + (complaint.ai.confidence % 27)}km/h</span>
    </span>
  )
}

function summarise(evidence) {
  const counts = evidence.reduce((a, e) => ({ ...a, [e.kind]: (a[e.kind] ?? 0) + 1 }), {})
  const parts = Object.entries(counts).map(
    ([kind, n]) => `${n} ${kind}${n > 1 ? "s" : ""}`,
  )
  return `${evidence.length} items · ${parts.join(" · ")}`
}
