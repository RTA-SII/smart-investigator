import { cn } from "@/lib/cn"

/**
 * Detail-page tabs. SMC floats them in a glass toolbar; the active tab gets a
 * lavender fill (--accent) and navy text, the rest stay muted.
 */
export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      className={cn(
        "glass-toolbar flex w-max max-w-full items-center gap-1 overflow-x-auto p-1",
        className,
      )}
    >
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2",
              "text-sm font-semibold whitespace-nowrap transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
              "[&_svg]:size-4",
              active
                ? "bg-[var(--accent)] text-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
            )}
          >
            {t.icon}
            {t.label}
            {t.count != null && (
              <span className="text-[11px] font-medium opacity-60">({t.count})</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
