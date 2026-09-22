import { useState } from "react"
import { ChevronDown, ChevronRight, MoveUpRight } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Checkbox, FilterSelect } from "@/components/ui/FilterSelect"
import { InfoTip } from "@/components/ui/InfoTip"
import { OPERATORS } from "@/data/personas"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

import { ESCALATION_OUTCOMES } from "@/lib/filters"

const officers = () =>
  OPERATORS.filter((o) => o.role === "Investigation Officer").map((o) => o.name)
const supervisors = () =>
  OPERATORS.filter((o) => o.role === "Supervisor").map((o) => o.name)

/**
 * SMC's escalation filter, which appears under the filter card once Stage is
 * set to Escalated — it is not a page of its own.
 *
 * Three numbered steps read left to right with a chevron between them: who
 * referred it upward, who it went to, and how it ended. That ordering is the
 * question a supervisor is actually asking when they filter by escalation.
 */
export function EscalationPanel({ filters, onChange }) {
  const [open, setOpen] = useState(true)
  const t = useT()
  const set = (k) => (v) => onChange({ ...filters, [k]: v })

  const on =
    filters.escalatedByRole.length ||
    filters.escalatedBy.length ||
    filters.escalatedToRole.length ||
    filters.escalatedTo.length ||
    filters.escalationOutcome.length

  return (
    <Card className="mb-5 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
          <MoveUpRight className="size-4" />
        </span>
        <p className="text-base font-bold">{t("Escalation")}</p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            on
              ? "bg-[var(--accent)] text-[var(--primary)]"
              : "bg-[rgb(0_0_0/0.05)] text-[var(--muted-foreground)]",
          )}
        >
          {on ? t("On") : t("Off")}
        </span>
        <InfoTip label={t("Narrow escalated complaints by who referred them, who ruled, and how they ended.")} />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("Toggle escalation filters")}
          className="ms-auto grid size-7 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-white/60 dark:hover:bg-white/10"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-wrap items-stretch gap-2">
          <Step
            n={1}
            title={t("Escalated by")}
            hint={t("The officer who referred the complaint upward.")}
          >
            <Facet label={t("Escalated by role")}>
              <Boxes
                options={["Investigation Officer"]}
                value={filters.escalatedByRole}
                onChange={set("escalatedByRole")}
              />
            </Facet>
            <Facet label={`${t("Escalated by person")} (${officers().length})`}>
              <FilterSelect
                label="Escalated by person"
                options={officers()}
                value={filters.escalatedBy}
                onChange={set("escalatedBy")}
              />
            </Facet>
          </Step>

          <Arrow />

          <Step
            n={2}
            title={t("Escalated to")}
            hint={t("Who the referral went to for a ruling.")}
          >
            <Facet label={t("Escalated to role")}>
              <Boxes
                options={["Supervisor"]}
                value={filters.escalatedToRole}
                onChange={set("escalatedToRole")}
              />
            </Facet>
            <Facet label={`${t("Escalated to person")} (${supervisors().length})`}>
              <FilterSelect
                label="Escalated to person"
                options={supervisors()}
                value={filters.escalatedTo}
                onChange={set("escalatedTo")}
              />
            </Facet>
          </Step>

          <Arrow />

          <Step n={3} title={t("Outcome")} hint={t("Whether the referral has been ruled on yet.")}>
            <Boxes
              options={ESCALATION_OUTCOMES}
              value={filters.escalationOutcome}
              onChange={set("escalationOutcome")}
              filled
            />
          </Step>
        </div>
      )}
    </Card>
  )
}

function Step({ n, title, hint, children }) {
  return (
    <div className="glass-chip min-w-[240px] flex-1 rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="ltr-value grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--primary)]">
          {n}
        </span>
        <p className="text-sm font-bold">{title}</p>
        <InfoTip label={hint} />
      </div>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </div>
  )
}

function Facet({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[11px] text-[var(--muted-foreground)]">{label}</p>
      {children}
    </div>
  )
}

const Arrow = () => (
  <span className="hidden shrink-0 items-center text-[var(--muted-foreground)] lg:flex">
    <ChevronRight className="size-4 rtl:rotate-180" />
  </span>
)

/** A stack of checkbox rows — `filled` gives them SMC's selected wash. */
function Boxes({ options, value, onChange, filled = false }) {
  const t = useT()
  const toggle = (o) =>
    onChange(value.includes(o) ? value.filter((v) => v !== o) : [...value, o])

  return (
    <div className="grid w-full gap-1.5">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors duration-150",
              filled && on
                ? "bg-[var(--accent)] font-semibold text-[var(--primary)]"
                : "hover:bg-white/60 dark:hover:bg-white/10",
            )}
          >
            <Checkbox on={on} />
            <span className="min-w-0 truncate text-start">{t(o)}</span>
          </button>
        )
      })}
    </div>
  )
}
