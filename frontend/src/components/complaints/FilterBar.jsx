import { Search } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { FilterSelect } from "@/components/ui/FilterSelect"
import { COMPLAINT_TYPES, CHANNELS, MODES, PRIORITIES, STAGES } from "@/data/catalog"
import { useT } from "@/i18n"

/** Search row on top, a rule, then the dropdown grid — SMC's filter card. */
export function FilterBar({ filters, onChange, count, open }) {
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
        {/* The sidebar badge counts open work, not the whole estate. Saying
            both here is what stops "All Complaints 28" reading as a
            contradiction against a list of 106. */}
        <span className="shrink-0 text-sm text-[var(--muted-foreground)]">
          {count.toLocaleString("en-US")} {t("complaints")}
          {open != null && open !== count && (
            <>
              {" · "}
              <span className="font-semibold text-[var(--primary)]">
                {open.toLocaleString("en-US")} {t("open")}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Five facets, one row. Ten wrapped onto two rows and pushed the
          complaints themselves off the screen — and an investigator working
          a queue narrows by what the complaint *is*, not by how it was
          eventually ruled on. */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--border)] pt-3 sm:grid-cols-3 lg:grid-cols-5">
        <FilterSelect label="Type" value={filters.type} options={COMPLAINT_TYPES} onChange={set("type")} />
        <FilterSelect label="Mode" value={filters.mode} options={MODES} onChange={set("mode")} />
        <FilterSelect label="Priority" value={filters.priority} options={PRIORITIES} onChange={set("priority")} />
        <FilterSelect label="Stage" value={filters.stage} options={STAGES} onChange={set("stage")} />
        <FilterSelect label="Channel" value={filters.channel} options={CHANNELS} onChange={set("channel")} />
      </div>
    </Card>
  )
}
