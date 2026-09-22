export const EMPTY_FILTERS = {
  q: "",
  mode: [],
  company: [],
  priority: [],
  stage: [],
  channel: [],
  type: [],
  officer: [],
  caseType: [],
  outcome: [],
  actionTaken: [],
  // Escalation facets, which SMC exposes only once Stage is Escalated.
  escalatedByRole: [],
  escalatedBy: [],
  escalatedToRole: [],
  escalatedTo: [],
  escalationOutcome: [],
}

export const ESCALATION_OUTCOMES = [
  "Escalated and not closed",
  "Escalated and closed",
]

/** Did this complaint ever go up? The stage moves on once it is ruled, so the
 *  audit trail is the only durable record that it was escalated at all. */
export const wasEscalated = (c) =>
  c.stage === "Escalated" ||
  c.timeline.some((e) => /escalat/i.test(e.action))

/**
 * Stage, with one exception.
 *
 * Asking for "Escalated" means *was* escalated, not *is sitting at* the
 * Escalated stage — otherwise it contradicts the Outcome facet beside it,
 * which offers "Escalated and closed". SMC treats it the same way: its
 * escalated view still counts referrals that have since been ruled on.
 */
function matchesStage(c, facet) {
  if (!facet.length) return true
  if (facet.includes("Escalated") && wasEscalated(c)) return true
  return facet.includes(c.stage)
}

/** An empty facet is off; otherwise the row must match one of its values. */
const hits = (facet, value) => !facet.length || facet.includes(value)

/**
 * Every dropdown narrows by exact match and is multi-select, as SMC's are.
 * The search box spans the fields an investigator would actually paste in.
 */
export function applyFilters(rows, f) {
  const q = f.q.trim().toLowerCase()
  return rows.filter((c) => {
    if (!hits(f.mode, c.mode)) return false
    if (!hits(f.company, c.company)) return false
    if (!hits(f.priority, c.priority)) return false
    if (!matchesStage(c, f.stage)) return false
    if (!hits(f.channel, c.channel)) return false
    if (!hits(f.type, c.type)) return false
    if (!hits(f.officer, c.assignee?.name)) return false
    if (!hits(f.caseType, c.caseType)) return false
    if (!hits(f.outcome, c.outcome)) return false
    if (!hits(f.actionTaken, c.form?.actionTaken)) return false
    if (!matchesEscalation(c, f)) return false
    if (!q) return true
    return [
      c.id,
      c.crmRef,
      c.plate,
      c.sideNumber,
      c.driver.name,
      c.complainant.name,
      c.location,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q)
  })
}

/**
 * The escalation facets, which only bite once one is set.
 *
 * "Escalated by" is the officer who referred it upward — the assignee at the
 * time, which is still on the complaint. "Escalated to" is whoever rules on
 * it; in this module that is always a supervisor.
 */
function matchesEscalation(c, f) {
  const any =
    f.escalatedByRole.length ||
    f.escalatedBy.length ||
    f.escalatedToRole.length ||
    f.escalatedTo.length ||
    f.escalationOutcome.length

  if (!any) return true
  if (!wasEscalated(c)) return false

  if (!hits(f.escalatedBy, c.assignee?.name)) return false
  if (!hits(f.escalatedByRole, "Investigation Officer")) return false
  if (!hits(f.escalatedToRole, "Supervisor")) return false
  if (f.escalatedTo.length && !f.escalatedTo.includes(c.decision?.by?.split(" · ")[0]))
    return false

  if (f.escalationOutcome.length) {
    const outcome = c.stage === "Closed" ? "Escalated and closed" : "Escalated and not closed"
    if (!f.escalationOutcome.includes(outcome)) return false
  }
  return true
}
