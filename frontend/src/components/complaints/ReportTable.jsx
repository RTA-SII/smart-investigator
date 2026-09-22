import { InfoTip } from "@/components/ui/InfoTip"
import { useT } from "@/i18n"
import { usePaged } from "@/lib/paging"
import { Pagination } from "@/components/ui/Pagination"
import { cn } from "@/lib/cn"

/**
 * SMC's grouped report table. Columns sit under coloured bands — each band a
 * 13% tint of its own hue with a 2px left rule in the same colour — so a wide
 * table still reads as a few related blocks.
 */
export const BAND = {
  volume: "#009cde",
  speed: "#ff8200",
  quality: "#9b59b6",
  outcome: "#0072bc",
}

export function ReportTable({ groups, columns, rows, renderCell }) {
  const t = useT()
  const paged = usePaged(rows)
  return (
    <>
      <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {groups.map((g, i) => (
              <th
                key={i}
                colSpan={g.span}
                className={cn(
                  "px-3 py-2 text-center text-sm font-bold uppercase",
                  !g.tone && "bg-transparent",
                )}
                style={
                  g.tone && {
                    color: BAND[g.tone],
                    backgroundColor: `color-mix(in oklab, ${BAND[g.tone]} 13%, transparent)`,
                    borderLeft: `2px solid ${BAND[g.tone]}`,
                  }
                }
              >
                <span className="inline-flex items-center gap-1.5 [&_svg]:size-3.5">
                  {g.icon}
                  {t(g.label)}
                </span>
              </th>
            ))}
          </tr>
          <tr className="border-b border-[rgb(0_0_0/0.1)] dark:border-[var(--border)]">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "px-3 py-2.5 text-[10px] font-semibold tracking-[0.5px] whitespace-nowrap uppercase",
                  "text-[var(--muted-foreground)]",
                  c.align === "right" ? "text-right" : "text-left",
                )}
                style={
                  c.startsGroup && {
                    borderLeft: `2px solid ${BAND[c.startsGroup]}`,
                  }
                }
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    c.align === "right" && "flex-row-reverse",
                  )}
                >
                  {t(c.label)}
                  {c.hint && <InfoTip label={t(c.hint)} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.page.map((r, ri) => (
            <tr
              key={r.id ?? r.name ?? ri}
              className={cn(
                "border-b border-[rgb(0_0_0/0.05)] dark:border-[rgb(255_255_255/0.06)]",
                "transition-colors duration-150",
                "hover:bg-[rgb(23_28_143/0.04)] dark:hover:bg-[rgb(139_141_199/0.08)]",
              )}
            >
              {columns.map((c, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-3 py-3 align-middle whitespace-nowrap",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                  style={
                    c.startsGroup && {
                      borderLeft: `2px solid color-mix(in oklab, ${BAND[c.startsGroup]} 30%, transparent)`,
                    }
                  }
                >
                  {renderCell(r, c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <Pagination paged={paged} />
    </>
  )
}

/** A percentage with SMC's thin progress rule underneath it. */
export function RateCell({ value, tone }) {
  const colour =
    tone ?? (value >= 70 ? "var(--tone-low)" : value >= 40 ? "var(--tone-high)" : "var(--tone-critical)")
  return (
    <span className="inline-block min-w-[52px]">
      <span className="block text-sm font-semibold" style={{ color: colour }}>
        {value}%
      </span>
      <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-[rgb(0_0_0/0.08)]">
        <span
          className="block h-full rounded-full"
          style={{ width: `${value}%`, background: colour }}
        />
      </span>
    </span>
  )
}
