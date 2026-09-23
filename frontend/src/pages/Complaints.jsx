import { useEffect, useMemo, useState } from "react"
import { Download, List, Map } from "lucide-react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Segmented } from "@/components/ui/Segmented"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { EscalationPanel } from "@/components/complaints/EscalationPanel"
import { FilterBar } from "@/components/complaints/FilterBar"
import { applyFilters, EMPTY_FILTERS, ESCALATION_OUTCOMES } from "@/lib/filters"
import { ComplaintMap } from "@/components/complaints/ComplaintMap"
import { useComplaints } from "@/app/complaintStore"
import { useT } from "@/i18n"
import { useSession } from "@/app/session"
import { roleById } from "@/data/personas"

const VIEWS = [
  { value: "list", label: "List", icon: <List /> },
  { value: "map", label: "Map", icon: <Map /> },
]

export function Complaints() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const role = roleById(useSession().roleId)
  const t = useT()
  const [view, setView] = useState("list")
  const complaints = useComplaints()

  const rows = useMemo(
    () => applyFilters(complaints, filters),
    [complaints, filters],
  )

  // SMC opens its escalation panel with both outcomes ticked — everything
  // that was ever escalated — and you narrow from there.
  const escalating = filters.stage.includes("Escalated")
  useEffect(() => {
    setFilters((f) =>
      escalating && !f.escalationOutcome.length
        ? { ...f, escalationOutcome: [...ESCALATION_OUTCOMES] }
        : f,
    )
  }, [escalating])

  return (
    <>
      <PageHeader
        title={t("All Complaints")}
        subtitle={t("Public complaints received from CRM, with AI cross-validation")}
        actions={
          <Button size="md">
            <Download />
            {t("Export")}
          </Button>
        }
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        count={rows.length}
        open={rows.filter((c) => c.stage !== "Closed").length}
      />

      {/* SMC reveals its escalation facets only once Stage is Escalated. */}
      {filters.stage.includes("Escalated") && (
        <EscalationPanel filters={filters} onChange={setFilters} />
      )}

      <div className="mb-4 flex justify-end">
        <Segmented
          options={VIEWS.map((v) => ({ ...v, label: t(v.label) }))}
          value={view}
          onChange={setView}
        />
      </div>

      <Card className="overflow-hidden">
        {view === "list" ? (
          // Only a supervisor assigns work, so only they get the column.
          <ComplaintTable rows={rows} assignable={role.id === "supervisor"} />
        ) : (
          <ComplaintMap rows={rows} />
        )}
      </Card>
    </>
  )
}
