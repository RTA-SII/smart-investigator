import { cn } from "@/lib/cn"

/** SMC's card surface: translucent fill on a 1px white ring, 14.4px radius,
 *  lifted by a soft downward shadow. Distinct from the shell surfaces, which
 *  use a real border and a 16px radius — see `glass-surface`. */
export function Card({ className, glint = false, surface = "glass-card", children, ...rest }) {
  return (
    <div
      className={cn(
        surface,
        "relative",
        glint && "tile-glint",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-4", className)}>
      {children}
    </div>
  )
}

/** 14px/600 — the size SMC gives every card and section heading. */
export function CardTitle({ className, children }) {
  return <h2 className={cn("text-sm font-bold", className)}>{children}</h2>
}

export function CardBody({ className, children }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>
}
