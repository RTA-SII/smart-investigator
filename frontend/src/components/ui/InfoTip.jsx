import { useCallback, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Info } from "lucide-react"
import { cn } from "@/lib/cn"

/**
 * The ⓘ beside every metric in SMC. A 16px round button that sits at 45%
 * opacity until hovered, with the explanation on a dark popover above it.
 *
 * The popover is portalled to `document.body` and positioned from the
 * trigger's rect — KPI tiles clip their overflow for the specular glint, so
 * an in-flow tooltip would be cut off. Opens on hover and on focus, and the
 * text doubles as the button's accessible name.
 */
export function InfoTip({ label, className }) {
  const ref = useRef(null)
  const [spot, setSpot] = useState(null)
  const id = useId()

  const show = useCallback(() => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setSpot({ x: r.left + r.width / 2, y: r.top })
  }, [])

  const hide = useCallback(() => setSpot(null), [])

  return (
    <span className={cn("inline-flex", className)}>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-describedby={spot ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={cn(
          "inline-flex size-4 shrink-0 cursor-default items-center justify-center rounded-full",
          "text-[color-mix(in_oklab,var(--muted-foreground)_45%,transparent)]",
          "transition-colors duration-150",
          "hover:bg-[rgb(238_238_238/0.6)] hover:text-[var(--muted-foreground)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none",
          "dark:hover:bg-[rgb(255_255_255/0.08)]",
        )}
      >
        <Info className="size-3.5" />
      </button>

      {spot &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: spot.x, top: spot.y - 10 }}
            className={cn(
              "pointer-events-none fixed z-[100] w-max max-w-[240px] -translate-x-1/2 -translate-y-full",
              "rounded-lg bg-[#1a1a1a] px-2.5 py-1.5",
              "text-[11px] leading-snug font-medium text-white",
              "shadow-[0_8px_24px_rgb(0_0_0/0.22)]",
            )}
          >
            {label}
            {/* The caret SMC points back at the trigger — a rotated square
                straddling the bottom edge, so it inherits the same fill. */}
            <span
              aria-hidden
              className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1a1a1a]"
            />
          </span>,
          document.body,
        )}
    </span>
  )
}
