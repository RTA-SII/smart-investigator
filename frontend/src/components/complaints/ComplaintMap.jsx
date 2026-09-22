import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin } from "lucide-react"
import { LOCATIONS, PRIORITY_TONE } from "@/data/catalog"

const TONE = {
  critical: "var(--tone-critical)",
  high: "var(--tone-high)",
  medium: "var(--tone-medium)",
  low: "var(--tone-low)",
}

/**
 * Complaint density by area. A schematic rather than a real basemap — the
 * POC has no tile provider, and the question this view answers ("where is
 * the volume") is a ranking question, not a cartographic one.
 */
export function ComplaintMap({ rows }) {
  const navigate = useNavigate()

  const areas = useMemo(() => {
    const counts = LOCATIONS.map((name) => {
      const hits = rows.filter((c) => c.location === name)
      return {
        name,
        total: hits.length,
        worst:
          hits.find((c) => c.priority === "Critical") ??
          hits.find((c) => c.priority === "High") ??
          hits[0],
      }
    }).filter((a) => a.total > 0)
    return counts.sort((a, b) => b.total - a.total)
  }, [rows])

  const max = areas[0]?.total ?? 1

  if (!areas.length) {
    return (
      <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        No complaints match these filters
      </p>
    )
  }

  return (
    <div className="p-5">
      <p className="mb-4 text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
        Complaint density by area
      </p>
      <ul className="space-y-2">
        {areas.map((a) => {
          const tone = TONE[PRIORITY_TONE[a.worst.priority]] ?? TONE.low
          return (
            <li key={a.name}>
              <button
                type="button"
                onClick={() => navigate(`/complaints/${a.worst.id}`)}
                className="flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-[rgb(23_28_143/0.04)]"
              >
                <MapPin className="size-4 shrink-0" style={{ color: tone }} />
                <span className="w-44 shrink-0 truncate text-sm font-semibold">
                  {a.name}
                </span>
                <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgb(0_0_0/0.06)]">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${(a.total / max) * 100}%`, background: tone }}
                  />
                </span>
                <span className="w-10 shrink-0 text-end text-sm font-bold tabular-nums">
                  {a.total}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
