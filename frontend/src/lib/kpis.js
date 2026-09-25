import { NOW } from "@/data/complaints"
import { OFF_DESK } from "@/lib/cht"
import { PENALTIES } from "@/data/catalog"

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

/**
 * What actually happened to the driver, across the complaints that closed.
 *
 * Every closed complaint carries exactly one action, so these are the whole
 * of them — which is what lets them be drawn as a pie. The chart used to add
 * an "Other Penalty" slice on top of the verified findings, counting every
 * closed complaint that had any penalty at all: that was all of them, since
 * "Not guilty" is itself a recorded action. The slice therefore always
 * equalled the total and overlapped every other one, so the pie's
 * percentages were wrong as well as its count.
 */
export function actionBreakdown(rows) {
  const closed = rows.filter((c) => c.stage === "Closed")

  return PENALTIES.map((name) => ({
    name,
    value: closed.filter((c) => (c.form?.actionTaken ?? c.penalty) === name).length,
  })).filter((d) => d.value > 0)
}
