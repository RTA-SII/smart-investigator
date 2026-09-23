import { useMemo, useState } from "react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Card } from "@/components/ui/Card"
import { Segmented } from "@/components/ui/Segmented"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { FilterBar } from "@/components/complaints/FilterBar"
import { MyProductivity } from "@/components/complaints/MyProductivity"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { applyFilters, EMPTY_FILTERS } from "@/lib/filters"
import { useT } from "@/i18n"

const SCOPES = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
]

/**
 * The officer's own workload — everything that has been assigned to them.
 *
 * Defaults to All, not Open: a complaint they have just closed has to stay on
 * screen, marked Closed, or the work appears to vanish the moment it is done.
 */
export function MyQueue() {
  const session = useSession()
  const role = roleById(session.roleId)
  const t = useT()
  const [scope, setScope] = useState("all")
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const complaints = useComplaints()

  const rows = useMemo(() => {
    const mine = complaints.filter((c) => c.assignee?.id === role.staff.code)
    const scoped = scope === "open" ? mine.filter((c) => c.stage !== "Closed") : mine
    return applyFilters(scoped, filters)
  }, [complaints, role.staff.code, scope, filters])

  return (
    <>
      <PageHeader
        title={t("My Complaints")}
        subtitle={`${t(role.title)} · ${role.staff.name} · ${role.staff.code}`}
        actions={
          <Segmented
            options={SCOPES.map((s) => ({ ...s, label: t(s.label) }))}
            value={scope}
            onChange={setScope}
          />
        }
      />
      <div className="mb-5">
        <MyProductivity role={role} bare />
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        count={rows.length}
        open={rows.filter((c) => c.stage !== "Closed").length}
      />

      <Card className="overflow-hidden">
        <ComplaintTable rows={rows} emptyLabel={t("Nothing assigned to you in this scope")} />
      </Card>
    </>
  )
}
