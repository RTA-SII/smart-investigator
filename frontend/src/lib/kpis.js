import { NOW } from "@/data/complaints"
import { OFF_DESK } from "@/lib/cht"

/**
 * One count of a set of complaints, for every KPI strip that shows one.
 *
 * The four stage counts are a **partition**: closed + returned + escalated +
 * inProgress is always total, because every stage falls in exactly one of
 * them. That is the point of this module. The dashboard and the productivity
 * strip each used to do this arithmetic themselves, and they disagreed —
 * the strip counted escalations as *ever escalated*, so a complaint that went
 * up and was later closed was counted twice and the tiles did not add up to
 * the total sitting beside them.
 *
 * `breached` deliberately is **not** a slice. It spans every complaint still
 * open, whichever stage it is at, so it overlaps the three that are not
 * closed. Anything showing it has to say so.
 */
export function caseloadStats(rows) {
  const closed = rows.filter((c) => c.stage === "Closed")
  const returned = rows.filter((c) => c.stage === "Returned")
  const escalated = rows.filter((c) => c.stage === "Escalated")
  const inProgress = rows.filter((c) => !OFF_DESK.includes(c.stage))

  const timed = closed.filter((c) => c.handlingMinutes != null)
  const avgHandling = timed.length
    ? Number(
        (timed.reduce((sum, c) => sum + c.handlingMinutes, 0) / timed.length).toFixed(1),
      )
    : null

  return {
    total: rows.length,
    closed: closed.length,
    returned: returned.length,
    escalated: escalated.length,
    inProgress: inProgress.length,
    inProgressIds: inProgress.map((c) => c.id),
    // Still open past its handling target — a condition, not a category.
    breached: rows.filter(
      (c) =>
        c.stage !== "Closed" && (NOW - new Date(c.receivedAt)) / 60_000 > c.slaMinutes,
    ).length,
    avgHandling,
  }
}

/** The share of a whole, for a tile's meter. */
export const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0)

/**
 * Whose caseload a role's productivity strip is about.
 *
 * An officer's own name; a supervisor's whole team, because they do not hold
 * complaints themselves — they rule on what comes up and answer for what the
 * officers are carrying.
 */
export function caseloadFor(complaints, role) {
  return role.id === "supervisor"
    ? complaints.filter((c) => c.assignee)
    : complaints.filter((c) => c.assignee?.id === role.staff.code)
}
