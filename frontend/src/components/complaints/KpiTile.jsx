import { TrendingDown, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Meter } from "@/components/ui/Meter"
import { InfoTip } from "@/components/ui/InfoTip"

/**
 * The portal's KPI tile — measured at rounded-xl with 12px/10px padding, and a
 * very small type scale: value 18px/700, delta and caption 9px. Six sit across
 * a desktop row, so the tile has to stay tight.
 */
export function KpiTile({ label, value, delta, deltaUp, caption, meter, tone, icon: Icon, hint }) {
  return (
    <Card glint surface="dash-tile" className="px-3 py-2.5">
      <div className="relative flex items-start justify-between gap-1.5">
        <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
          {label}
        </p>
        <span className="flex shrink-0 items-center gap-1">
          {hint && <InfoTip label={hint} />}
          {/* The icon carries its own colour — no tinted box behind it. */}
          {Icon && <Icon className="size-3.5 shrink-0" style={{ color: tone }} />}
        </span>
      </div>

      <p className="relative mt-1.5 text-lg leading-tight font-bold">{value}</p>

      <p className="relative mt-0.5 flex items-center gap-1 text-[9px]">
        {delta != null && (
          <span
            className="flex shrink-0 items-center gap-0.5 font-medium"
            style={{ color: deltaUp ? "#ef4444" : "#16a34a" }}
          >
            {deltaUp ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
            {delta}
          </span>
        )}
        <span className="truncate text-[var(--muted-foreground)]">{caption}</span>
      </p>

      <Meter className="relative mt-2" value={meter} tone={tone} />
    </Card>
  )
}
