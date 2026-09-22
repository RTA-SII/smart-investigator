import { cn } from "@/lib/cn"

/**
 * The mode chips above SMC's report tables. Selected takes a tinted fill in
 * the RTA cyan; unselected sits on the brightest glass in the system.
 */
export function ChipRow({ options, value, onChange, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
              "text-[11px] font-semibold transition-all duration-150",
              "[&_svg]:size-3.5",
              active
                ? "border border-[rgb(0_156_222/0.33)] bg-[rgb(0_156_222/0.094)] text-[var(--foreground)] shadow-sm"
                : "glass-chip rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** The navy pill rail SMC uses for report sections. */
export function PillTabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn("glass-toolbar flex w-max items-center gap-1 p-1", className)}>
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-150",
              active
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
