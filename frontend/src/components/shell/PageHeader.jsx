import { asset } from "@/lib/asset"
import { cn } from "@/lib/cn"

/**
 * Page identity plus the faded bilingual RTA lockup that sits behind the
 * title on every SMC page.
 */
export function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn("relative mb-5 flex items-start justify-between gap-4", className)}>
      <img
        src={asset("rta-logo.svg")}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-1 left-1/2 h-11 w-auto -translate-x-1/2 opacity-[0.13] select-none"
      />
      <div className="relative min-w-0">
        <h1 className="truncate text-xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="relative flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** The smaller heading + right-hand control row used inside a page. */
export function SectionHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold">{title}</h2>
        {subtitle && (
          <p className="truncate text-sm text-[var(--muted-foreground)]">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  )
}
