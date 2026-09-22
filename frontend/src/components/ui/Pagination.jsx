import { ChevronLeft, ChevronRight } from "lucide-react"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * Table pager, in the portal's own idiom: a count on one side, a glass
 * toolbar of page buttons on the other.
 *
 * Chevrons point by reading direction, so they swap under RTL — `start`/`end`
 * would be wrong here because the icons themselves must mirror.
 */
export function Pagination({ paged, className }) {
  const t = useT()
  const { pageIndex, pageCount, from, to, total, canPrev, canNext } = paged

  if (total === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3",
        "border-t border-[rgb(0_0_0/0.05)] dark:border-[rgb(255_255_255/0.06)]",
        className,
      )}
    >
      <p className="text-[11px] text-[var(--muted-foreground)]">
        <span className="ltr-value">
          {from}–{to}
        </span>{" "}
        {t("of")} <span className="ltr-value">{total}</span>
      </p>

      {pageCount > 1 && (
        <div className="glass-toolbar flex items-center gap-1 p-1">
          <PageButton
            label={t("Previous page")}
            disabled={!canPrev}
            onClick={paged.prev}
          >
            <ChevronLeft className="size-3.5 rtl:rotate-180" />
          </PageButton>

          {pagesAround(pageIndex, pageCount).map((p, i) =>
            p === "gap" ? (
              <span
                key={`gap-${i}`}
                className="px-1 text-[11px] text-[var(--muted-foreground)]"
              >
                ·
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => paged.goTo(p)}
                aria-current={p === pageIndex ? "page" : undefined}
                className={cn(
                  "ltr-value min-w-7 rounded-lg px-2 py-1 text-[11px] font-semibold",
                  "transition-colors duration-150",
                  p === pageIndex
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
                )}
              >
                {p + 1}
              </button>
            ),
          )}

          <PageButton
            label={t("Next page")}
            disabled={!canNext}
            onClick={paged.next}
          >
            <ChevronRight className="size-3.5 rtl:rotate-180" />
          </PageButton>
        </div>
      )}
    </div>
  )
}

function PageButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-lg transition-colors duration-150",
        disabled
          ? "cursor-not-allowed text-[var(--muted-foreground)] opacity-40"
          : "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  )
}

/** First, last, and a window around the current page — with gaps elided. */
function pagesAround(current, count, window = 1) {
  if (count <= 7) return [...Array(count).keys()]

  const pages = new Set([0, count - 1, current])
  for (let i = 1; i <= window; i++) {
    pages.add(Math.max(0, current - i))
    pages.add(Math.min(count - 1, current + i))
  }

  const sorted = [...pages].sort((a, b) => a - b)
  return sorted.flatMap((p, i) =>
    i > 0 && p - sorted[i - 1] > 1 ? ["gap", p] : [p],
  )
}
