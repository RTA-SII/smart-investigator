import { useMemo } from "react"
import { Card } from "@/components/ui/Card"
import { MODES } from "@/data/catalog"
import { MODE_TONE, modeIcon } from "./modeIcons"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * The transport-mode summary strip, as SMC puts it above My Alerts.
 *
 * Each tile is a button: clicking it filters the list below to that mode and
 * clicking the selected one clears the filter, which is exactly how SMC's
 * behaves. The counts are always of the whole set, not the filtered view —
 * otherwise selecting a mode would zero every other tile and there would be
 * no way to see where else the work is.
 */
export function ModeTiles({ rows, value = [], onChange }) {
  const t = useT()

  const tiles = useMemo(
    () =>
      MODES.map((mode) => {
        const hits = rows.filter((c) => c.mode === mode)
        return {
          mode,
          total: hits.length,
          open: hits.filter((c) => c.stage !== "Closed").length,
          closed: hits.filter((c) => c.stage === "Closed").length,
        }
      }),
    [rows],
  )

  const toggle = (mode) =>
    onChange(value.includes(mode) ? value.filter((m) => m !== mode) : [mode])

  return (
    <div className="mb-4 grid grid-cols-2 items-stretch gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => {
        const Icon = modeIcon(tile.mode)
        const on = value.includes(tile.mode)
        return (
          <Card
            key={tile.mode}
            glint
            surface="dash-tile"
            className={cn(
              "cursor-pointer px-3 py-2.5 text-start transition-all duration-150",
              on && "ring-2 ring-[var(--primary)]",
            )}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            onClick={() => toggle(tile.mode)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                toggle(tile.mode)
              }
            }}
          >
            <div className="relative flex items-start justify-between gap-2">
              <p className="truncate text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
                {t(tile.mode)}
              </p>
              <Icon
                className="size-3.5 shrink-0"
                style={{ color: MODE_TONE[tile.mode] }}
              />
            </div>
            <p className="relative mt-1.5 text-lg leading-tight font-bold">
              {tile.total}
            </p>
            <p className="relative mt-0.5 truncate text-[9px] text-[var(--muted-foreground)]">
              {tile.total ? (
                <>
                  <span className="font-semibold text-[var(--primary)]">
                    {tile.open} {t("open")}
                  </span>{" "}
                  · {tile.closed} {t("closed")}
                </>
              ) : (
                t("No complaints")
              )}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
