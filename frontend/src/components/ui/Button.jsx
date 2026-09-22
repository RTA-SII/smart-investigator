import { cva } from "class-variance-authority"
import { cn } from "@/lib/cn"

const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap " +
    "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:pointer-events-none disabled:opacity-50 " +
    "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none " +
    "[&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_6px_18px_rgb(23_28_143/0.28)] hover:brightness-110",
        destructive:
          "bg-[var(--destructive)] text-white shadow-[0_6px_18px_rgb(228_26_20/0.26)] hover:brightness-110",
        outline:
          "glass-chip rounded-xl text-[var(--foreground)] hover:bg-white/95 dark:hover:bg-white/10",
        ghost:
          "text-[var(--muted-foreground)] hover:bg-white/40 hover:text-[var(--foreground)] dark:hover:bg-white/10",
      },
      size: {
        sm: "h-8 px-3 text-[11px] [&_svg]:size-3.5",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-5 text-sm [&_svg]:size-4",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "outline", size: "md" },
  },
)

export function Button({ variant, size, className, ...rest }) {
  return <button className={cn(button({ variant, size }), className)} {...rest} />
}
