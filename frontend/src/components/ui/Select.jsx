import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

/**
 * SMC's dropdown, measured off the portal's own selects: 36px tall, 12px
 * label, 8px radius, a visible 70%-strength border over a muted fill, and a
 * primary ring on focus. The native `<select>` is laid transparently over the
 * control so the platform's option list and keyboard handling survive.
 */
export function Select({ label, value, options, onChange, icon, className }) {
  const active = value !== "all"

  return (
    <label
      className={cn(
        "group relative inline-flex h-9 min-w-[10.5rem] flex-1 cursor-pointer items-center gap-1.5",
        "rounded-lg border px-3 text-xs",
        "border-[color-mix(in_oklab,var(--border)_70%,transparent)]",
        "bg-[rgb(238_238_238/0.3)] dark:bg-[rgb(255_255_255/0.04)]",
        "transition-all duration-150",
        "hover:border-[color-mix(in_oklab,var(--primary)_30%,transparent)]",
        "has-[select:focus]:border-[color-mix(in_oklab,var(--primary)_50%,transparent)]",
        "has-[select:focus]:ring-1 has-[select:focus]:ring-[color-mix(in_oklab,var(--primary)_20%,transparent)]",
        active ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]",
        className,
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{active ? value : label}</span>
      <ChevronDown className="size-3.5 shrink-0 opacity-70" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0 outline-none"
      >
        <option value="all">{label}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
