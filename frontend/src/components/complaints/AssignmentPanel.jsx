import { UserCheck } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { initials } from "@/lib/format"

/**
 * Who owns this complaint — read-only, as SMC's own "Assigned To" card is.
 *
 * Reassignment is not done here. It is the supervisor's fourth action in the
 * Take Action card below, so it goes through the same confirmation and lands
 * in the audit trail with a note, rather than mutating silently on a select.
 */
export function AssignmentPanel({ complaint }) {
  const assignee = complaint.assignee

  return (
    <Card className="p-5">
      <CardTitle className="mb-4">Assigned To</CardTitle>

      {assignee ? (
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--tone-info)] text-sm font-bold text-white">
            {initials(assignee.name)}
          </span>
          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2">
              <span className="truncate text-base font-bold">{assignee.name}</span>
              <Badge tone="info">Officer</Badge>
            </p>
            <p className="truncate font-mono text-[11px] text-[var(--muted-foreground)]">
              {assignee.id}
            </p>
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <UserCheck className="size-4" />
          Unassigned — awaiting routing
        </p>
      )}
    </Card>
  )
}
