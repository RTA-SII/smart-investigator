import { cn } from "@/lib/cn"

/**
 * SMC's chart tooltip, measured off the portal: the page ground rather than
 * white, an 8px radius on a 5%-black hairline, 12px type, and a rounded
 * swatch bar — not a dot — against each series.
 */
export function ChartTip({ label, rows, className }) {
  return (
    <div
      className={cn(
        "pointer-events-none z-50 grid min-w-32 items-start gap-1.5 rounded-lg",
        "border border-[rgb(0_0_0/0.05)] bg-[var(--background)] px-2.5 py-1.5",
        "text-xs shadow-[0_12px_28px_rgb(0_0_0/0.18)]",
        className,
      )}
    >
      <p className="font-medium text-[var(--foreground)]">{label}</p>
      <ul className="grid gap-1">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-1 shrink-0 rounded-[2px]"
              style={{ background: r.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[var(--muted-foreground)]">
              {r.name}
            </span>
            <span className="shrink-0 font-mono font-medium tabular-nums">
              {typeof r.value === "number" ? r.value.toLocaleString("en-US") : r.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Recharts adapter — same surface, fed by its tooltip payload. */
export function RechartsTip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <ChartTip
      label={label}
      rows={payload.map((p) => ({
        name: p.name,
        value: unit ? `${p.value}${unit}` : p.value,
        color: p.color ?? p.fill,
      }))}
    />
  )
}
