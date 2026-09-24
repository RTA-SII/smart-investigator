import { useState } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * SMC's filter dropdown — a 240px popover with a search field and checkbox
 * rows, not a native select.
 *
 * Measured off `/alerts`: the popover is 11.2px radius on a 1px black/10
 * hairline; the search sits in an 8px/10px well above a divider; each option
 * row is 28px at 6.4px radius with a 14px checkbox at 4.8px; a chosen row
 * takes a primary/10 wash and primary text, and its box fills primary with a
 * white tick. The trigger stays the portal's 36px `filter-control`, going
 * primary and semibold once something is picked.
 *
 * Multi-select, as SMC's is: `value` is an array of chosen options.
 */
export function FilterSelect({ label, value = [], options, onChange, icon }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const t = useT()

  const chosen = value.length
  const shown = query.trim()
    ? options.filter((o) => t(o).toLowerCase().includes(query.trim().toLowerCase()))
    : options

  const toggle = (option) =>
    onChange(
      value.includes(option)
        ? value.filter((v) => v !== option)
        : [...value, option],
    )

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "filter-control inline-flex h-9 min-w-[166px] items-center gap-2 rounded-lg px-3 text-xs",
          "transition-colors duration-150",
          chosen
            ? "bg-white/[0.58] font-semibold text-[var(--primary)] dark:bg-white/10"
            : "text-[var(--muted-foreground)]",
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-start">
          {chosen ? value.map((v) => t(v)).join(", ") : t(label)}
        </span>
        {chosen > 0 && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t("Clear")}
            onClick={(e) => {
              e.stopPropagation()
              onChange([])
            }}
            onKeyDown={(e) => e.key === "Enter" && onChange([])}
            className="grid size-4 shrink-0 place-items-center rounded hover:bg-black/10"
          >
            <X className="size-3" />
          </span>
        )}
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("Close")}
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute start-0 top-10 z-40 w-60 overflow-hidden rounded-[11.2px] border-[1px] border-[rgb(0_0_0/0.1)] bg-[var(--popover)] shadow-[0_18px_44px_rgb(0_0_0/0.18)]">
            <div className="relative border-b border-[rgb(0_0_0/0.06)] px-2.5 py-2">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search")}
                className="h-7 w-full bg-transparent ps-6 text-xs outline-none placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            <ul className="max-h-[220px] overflow-y-auto p-1.5">
              {shown.map((o) => {
                const on = value.includes(o)
                return (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => toggle(o)}
                      className={cn(
                        "flex h-7 w-full items-center gap-2 rounded-[6.4px] px-2 text-xs",
                        "transition-colors duration-150",
                        on
                          ? "bg-[rgb(23_28_143/0.1)] text-[var(--primary)]"
                          : "hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10",
                      )}
                    >
                      <Checkbox on={on} />
                      <span className="min-w-0 truncate text-start">{t(o)}</span>
                    </button>
                  </li>
                )
              })}

              {!shown.length && (
                <li className="px-2 py-4 text-center text-[11px] text-[var(--muted-foreground)]">
                  {t("No matches")}
                </li>
              )}
            </ul>

            {chosen > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full border-t border-[rgb(0_0_0/0.06)] px-3 py-2 text-start text-xs text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-[rgb(23_28_143/0.06)] dark:hover:bg-white/10"
              >
                {t("Clear")}
              </button>
            )}
          </div>
        </>
      )}
    </span>
  )
}

/** SMC's 14px box: a neutral/40 hairline, filling primary once ticked. */
export function Checkbox({ on }) {
  return (
    <span
      className={cn(
        "grid size-3.5 shrink-0 place-items-center rounded-[4.8px] border-[1px]",
        "transition-colors duration-150",
        on
          ? "border-[var(--primary)] bg-[var(--primary)] text-white"
          : "border-[rgb(116_116_116/0.4)]",
      )}
    >
      {on && <Check className="size-2.5" strokeWidth={3} />}
    </span>
  )
}
