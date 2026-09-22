import { cn } from "@/lib/cn"

/** The flat capsule bar that sits under every KPI value in the portal. */
export function Meter({ value, tone = "var(--primary)", className }) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[rgb(0_0_0/0.08)] dark:bg-[rgb(255_255_255/0.1)]",
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
