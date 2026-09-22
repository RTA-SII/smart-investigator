import { ChevronRight, Eye, Info } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { completeness, nextStep } from "@/lib/manualComplaint"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/** Progress rail — completeness, the next thing to fill, and a live summary. */
export function DraftRail({ draft }) {
  const t = useT()
  const { done, total, steps } = completeness(draft)
  const next = nextStep(draft)

  const summary = [
    {
      label: "Complainant",
      value: draft.anonymous
        ? t("Anonymous complaint")
        : draft.complainantName.trim() || null,
    },
    { label: "Subject", value: draft.vehicleRef.trim() || null },
    { label: "Allegation", value: draft.type || null },
    { label: "Priority", value: draft.priority || null },
  ]

  return (
    <aside className="grid content-start gap-4">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[rgb(14_165_233/0.14)] text-[var(--tone-info)]">
              <Eye className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{t("Live preview")}</p>
              <p className="truncate text-[11px] text-[var(--muted-foreground)]">
                {t("As it will be filed")}
              </p>
            </div>
          </div>
          <Badge tone={done === total ? "low" : "info"} className="ltr-value">
            {done} / {total}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          {steps.map((ok, i) => (
            <span key={i} className="flex flex-1 items-center gap-1.5">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full transition-colors duration-300",
                  ok ? "bg-[var(--tone-info)]" : "bg-[rgb(0_0_0/0.12)]",
                )}
              />
              {i < steps.length - 1 && (
                <span className="h-px flex-1 bg-[rgb(0_0_0/0.08)]" />
              )}
            </span>
          ))}
        </div>
      </Card>

      {next && (
        <Card className="bg-[rgb(23_28_143/0.06)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-[11px] font-bold text-[var(--primary-foreground)]">
              {next.position}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
                {t("Next step")}
              </p>
              <p className="truncate text-sm font-bold">{t(next.label)}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-[var(--muted-foreground)]" />
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{t("Summary")}</p>
          <span className="flex gap-1.5">
            <Badge tone="info">{t("Manual")}</Badge>
            <Badge tone="primary">{t("New")}</Badge>
          </span>
        </div>

        <ul className="divide-y divide-[var(--border)]">
          {summary.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 py-2.5">
              <span className="shrink-0 text-sm text-[var(--muted-foreground)]">
                {t(s.label)}
              </span>
              <span
                className={cn(
                  "min-w-0 truncate text-sm",
                  s.value ? "font-semibold" : "text-[var(--muted-foreground)]",
                )}
              >
                {s.value ?? `• ${t("Not set")}`}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 flex gap-2 rounded-lg bg-[rgb(14_165_233/0.1)] px-3 py-2.5 text-[11px] text-[var(--foreground)]">
          <Info className="mt-px size-3.5 shrink-0 text-[var(--tone-info)]" />
          {t(
            "Source is set to Manual. The complaint opens as New against a five-minute handling target, and cross-validation runs on submit.",
          )}
        </p>
      </Card>
    </aside>
  )
}
