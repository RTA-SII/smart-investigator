import { cn } from "@/lib/cn"

/**
 * The flat capsule bar under every KPI value in the portal.
 *
 * Both halves are pills, and the track is always drawn — SMC's meters read
 * as a grey rail with the fill sitting in it, so a KPI at zero still shows
 * the full rail rather than nothing at all.
 */
export function Meter({ value, tone = "var(--primary)", className }) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[var(--meter-track)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: tone,
        }}
      />
    </div>
  )
}
