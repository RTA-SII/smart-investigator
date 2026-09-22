import { cn } from "@/lib/cn"

/**
 * SMC's pill switcher — used for the dashboard date range and the List/Map
 * toggle. Measured: 11px/600, 6px 12px padding, 8px radius, solid navy when
 * active, muted label when not.
 */
export function Segmented({ options, value, onChange, className }) {
  return (
    <div className={cn("glass-toolbar flex items-center gap-1 p-1", className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
              "text-[11px] font-semibold transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "[&_svg]:size-3.5",
              active
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
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
