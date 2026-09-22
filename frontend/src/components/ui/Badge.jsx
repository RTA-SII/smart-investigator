import { cn } from "@/lib/cn"

/**
 * SMC's badge formula, measured off the portal: 11px/600, 4px 10px padding,
 * fully rounded, and one colour driving all three surfaces — text at full
 * strength, background at 15%, hairline border at 25%.
 */
const TONES = {
  primary: "var(--primary)",
  critical: "var(--tone-critical)",
  high: "var(--tone-high)",
  medium: "var(--tone-medium)",
  low: "var(--tone-low)",
  info: "var(--tone-info)",
  neutral: "var(--tone-neutral)",
}

export function Badge({ tone = "primary", dot = false, className, children }) {
  const c = TONES[tone] ?? TONES.primary
  return (
    <span
      className={cn(
        // SMC collapses the line box and lets the padding do the centring —
        // inheriting the cell's 20px line-height is what pushed the label off
        // centre against the dot.
        "inline-flex shrink-0 items-center gap-1.5 rounded-full",
        "px-2.5 py-1 text-[11px] leading-none font-semibold whitespace-nowrap",
        className,
      )}
      style={{
        color: c,
        backgroundColor: `color-mix(in oklab, ${c} 15%, transparent)`,
        border: `1px solid color-mix(in oklab, ${c} 25%, transparent)`,
      }}
    >
      {dot && (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: c }}
        />
      )}
      {children}
    </span>
  )
}
