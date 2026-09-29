import { useMemo, useState } from "react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Card } from "@/components/ui/Card"
import { Segmented } from "@/components/ui/Segmented"
import { ComplaintTable } from "@/components/complaints/ComplaintTable"
import { FilterBar } from "@/components/complaints/FilterBar"
import { ModeTiles } from "@/components/complaints/ModeTiles"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { applyFilters, EMPTY_FILTERS } from "@/lib/filters"
import { isMine, isMineOpen } from "@/lib/ownership"
import { useT } from "@/i18n"

const SCOPES = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
]

/**
 * What is on the signed-in person's desk.
 *
 * For an officer that is everything assigned to them. For a supervisor it is
 * what officers have referred upward: they hold no complaints of their own, so
 * asking for their assignments left this page permanently empty and an
 * escalation could only be found on All Complaints, among everything else.
 *
 * Defaults to All, not Open: a complaint they have just ruled on has to stay
 * on screen, marked Closed, or the work appears to vanish the moment it is
 * done.
 */
export function MyQueue() {
  const session = useSession()
  const role = roleById(session.roleId)
  const t = useT()
  const [scope, setScope] = useState("all")
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const complaints = useComplaints()
  const supervisor = role.id === "supervisor"

  // The mode tiles count this set — everything of theirs in scope, before the
  // dropdowns narrow it.
  const scoped = useMemo(() => {
    const mine = complaints.filter((c) => isMine(c, role))
    return scope === "open" ? mine.filter((c) => isMineOpen(c, role)) : mine
  }, [complaints, role, scope])

  const rows = useMemo(() => applyFilters(scoped, filters), [scoped, filters])

  return (
    <>
      <PageHeader
        title={t("My Complaints")}
        // A supervisor's list is referrals, not assignments, and the page has
        // to say so — otherwise a short list reads as a broken filter.
        subtitle={`${t(
          supervisor ? "Escalations referred to you for a ruling" : role.title,
        )} · ${role.staff.name} · ${role.staff.code}`}
        actions={
          <Segmented
            options={SCOPES.map((s) => ({ ...s, label: t(s.label) }))}
            value={scope}
            onChange={setScope}
          />
        }
      />
      {/* Counts are of everything assigned to the officer, so selecting a
          mode narrows the list without blanking the other tiles. */}
      <ModeTiles
        rows={scoped}
        value={filters.mode}
        onChange={(mode) => setFilters({ ...filters, mode })}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        count={rows.length}
        open={rows.filter((c) => isMineOpen(c, role)).length}
      />

      <Card className="overflow-hidden">
        {/* A supervisor gets the Assigned To column: on a list of referrals
            the officer who sent each one up is the context they need, and
            handing it back to an officer is one of their actions. */}
        <ComplaintTable
          rows={rows}
          verdict={false}
          assignable={supervisor}
          emptyLabel={t(
            supervisor
              ? "No escalations referred to you in this scope"
              : "Nothing assigned to you in this scope",
          )}
        />
      </Card>
    </>
  )
}
