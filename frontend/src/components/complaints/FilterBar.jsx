import { Search, UserX } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { FilterSelect } from "@/components/ui/FilterSelect"
import {
  CASE_TYPES,
  COMPANIES,
  COMPLAINT_TYPES,
  CHANNELS,
  MODES,
  OUTCOMES,
  PENALTIES,
  PRIORITIES,
  STAGES,
} from "@/data/catalog"
import { OFFICERS } from "@/data/personas"
import { useT } from "@/i18n"

/** Search row on top, a rule, then the dropdown grid — SMC's filter card. */
export function FilterBar({ filters, onChange, count }) {
  const t = useT()
  const set = (k) => (v) => onChange({ ...filters, [k]: v })

  return (
    <Card className="mb-5 px-5 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex min-w-[240px] flex-1 items-center gap-2.5">
          <Search className="size-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            value={filters.q}
            onChange={(e) => set("q")(e.target.value)}
            placeholder={t("Search complaints, CRM ref, plate, driver, complainant…")}
            className="w-full min-w-0 bg-transparent py-1 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none"
          />
        </span>
        <span className="shrink-0 text-sm text-[var(--muted-foreground)]">
          {count.toLocaleString("en-US")} {t("complaints")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
        <FilterSelect label="Transport Mode" value={filters.mode} options={MODES} onChange={set("mode")} />
        <FilterSelect label="Company" value={filters.company} options={COMPANIES} onChange={set("company")} />
        <FilterSelect label="Priority" value={filters.priority} options={PRIORITIES} onChange={set("priority")} />
        <FilterSelect label="Stage" value={filters.stage} options={STAGES} onChange={set("stage")} />
        <FilterSelect label="Channel" value={filters.channel} options={CHANNELS} onChange={set("channel")} />
        <FilterSelect label="Complaint Type" value={filters.type} options={COMPLAINT_TYPES} onChange={set("type")} />
        <FilterSelect label="Case Type" value={filters.caseType} options={CASE_TYPES} onChange={set("caseType")} />
        <FilterSelect label="Verified Finding" value={filters.outcome} options={OUTCOMES} onChange={set("outcome")} />
        <FilterSelect label="Action Taken" value={filters.actionTaken} options={PENALTIES} onChange={set("actionTaken")} />
        <FilterSelect
          label="Officer"
          value={filters.officer}
          options={OFFICERS.map((o) => o.name)}
          onChange={set("officer")}
          icon={<UserX className="size-3.5 shrink-0" />}
        />
      </div>
    </Card>
  )
}
