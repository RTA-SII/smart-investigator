import { Search } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { SelectMenu } from "@/components/ui/SelectMenu"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * Form primitives, measured off SMC's Create Manual Alert: inputs on
 * `muted/40` with a 1px #eee border at an 8px radius, uppercase labels with a
 * red asterisk, and 11px helper text under the field.
 */

export function FormSection({ icon: Icon, tone, title, hint, children, className }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg"
          style={{
            background: `color-mix(in oklab, ${tone} 14%, transparent)`,
            color: tone,
          }}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{title}</h2>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">{hint}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

export function Field({ label, required, optional, hint, action, children, className }) {
  const t = useT()
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
          {label}
          {required && <span className="ms-1 text-[var(--destructive)]">*</span>}
          {optional && (
            <span className="ms-1.5 lowercase opacity-70">({t("optional")})</span>
          )}
        </span>
        {action}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-[11px] text-[var(--muted-foreground)]">
          {hint}
        </span>
      )}
    </label>
  )
}

const control =
  "w-full rounded-lg border border-[var(--input)] bg-[rgb(238_238_238/0.4)] px-2.5 py-2 " +
  "text-sm transition-colors outline-none placeholder:text-[var(--muted-foreground)] " +
  "focus-visible:border-[var(--ring)] dark:bg-[rgb(255_255_255/0.04)]"

export function Input({ className, ...rest }) {
  return <input className={cn(control, "h-9", className)} {...rest} />
}

export function Textarea({ className, ...rest }) {
  return <textarea className={cn(control, "min-h-24", className)} {...rest} />
}

/**
 * The form's dropdown. Delegates to `SelectMenu` so a menu opened here looks
 * like one opened on the filter bar, instead of whatever the operating
 * system draws for a native `<select>`.
 */
export function SelectField(props) {
  return <SelectMenu {...props} />
}

/** Registry lookup — a field with a Get button welded to its trailing edge. */
export function Lookup({ onLookup, className, ...rest }) {
  const t = useT()
  return (
    <span className={cn("relative flex", className)}>
      <input className={cn(control, "h-9 pe-20")} {...rest} />
      <button
        type="button"
        onClick={onLookup}
        className={cn(
          "absolute inset-y-1 end-1 inline-flex items-center gap-1.5 rounded-md px-3",
          "text-xs font-medium text-[var(--muted-foreground)]",
          "transition-colors duration-150 hover:bg-white/60 hover:text-[var(--foreground)]",
          "dark:hover:bg-white/10",
        )}
      >
        <Search className="size-3.5" />
        {t("Get")}
      </button>
    </span>
  )
}

/** Equal-width choice row — SMC's severity control. */
export function Choice({ options, value, onChange, className }) {
  const t = useT()
  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((o) => {
        const active = o.value === value
        const tone = o.tone ?? "var(--primary)"
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 flex-1 rounded-lg border text-xs font-medium",
              "transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]",
              !active &&
                "border-[var(--border)] bg-[rgb(238_238_238/0.4)] text-[var(--muted-foreground)] dark:bg-[rgb(255_255_255/0.04)]",
            )}
            style={
              active
                ? {
                    color: tone,
                    backgroundColor: `color-mix(in oklab, ${tone} 13%, transparent)`,
                    borderColor: `color-mix(in oklab, ${tone} 35%, transparent)`,
                  }
                : undefined
            }
          >
            {t(o.label)}
          </button>
        )
      })}
    </div>
  )
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && (
          <span className="block text-[11px] text-[var(--muted-foreground)]">{hint}</span>
        )}
      </span>
    </label>
  )
}
