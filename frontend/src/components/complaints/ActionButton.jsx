import { cva } from "class-variance-authority"
import { cn } from "@/lib/cn"

/**
 * One row of SMC's "Take Action" list.
 *
 * Not the shared `Button`: these are a different primitive in the portal —
 * full width, left-aligned behind a 16px icon, 32px tall on an 8px radius,
 * and filled with the *page ground* rather than a tone tint. Only the label
 * and the hairline carry colour, which is what makes the stack read as one
 * block instead of four competing chips.
 *
 * Measured off `/alerts/:id`: h 31.99px, pad 0 10px, gap 8px, radius 8px,
 * transition 0.15s, hover fill #f3f3f4 → #eee.
 */
const action = cva(
  "inline-flex h-8 w-full items-center justify-start gap-2 rounded-lg px-2.5 " +
    "text-sm whitespace-nowrap transition-all duration-150 " +
    "border-[1px] disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none " +
    "[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        danger:
          "bg-[var(--action-fill)] text-[var(--action-danger)] border-[var(--action-danger-edge)] hover:bg-[var(--action-fill-hover)]",
        neutral:
          "bg-[var(--action-fill)] text-[var(--tone-neutral)] border-[var(--action-neutral-edge)] hover:bg-[var(--action-fill-hover)] dark:text-[var(--muted-foreground)]",
        success:
          "bg-[var(--action-fill)] text-[var(--action-success)] border-[var(--action-success-edge)] hover:bg-[var(--action-fill-hover)]",
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent font-semibold hover:brightness-110",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
)

export function ActionButton({ tone, className, ...rest }) {
  return <button type="button" className={cn(action({ tone }), className)} {...rest} />
}
