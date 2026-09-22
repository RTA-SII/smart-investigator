/**
 * The manual-complaint draft.
 *
 * A manual complaint is one an officer logs directly in SMC rather than one
 * CRM hands over — a walk-in at a customer happiness centre, a call taken on
 * the floor, or a case referred from another authority. The shape differs
 * from a manual *alert* in one decisive way: an alert is an observation, a
 * complaint is somebody's allegation, so the complainant is a first-class
 * part of the record and their statement is the evidence.
 */

export const EMPTY_DRAFT = {
  // Intake — how and when it reached us
  receivedAt: "",
  channel: "",
  externalRef: "",

  // Complainant — who is alleging
  anonymous: false,
  complainantName: "",
  complainantPhone: "",
  language: "English",
  consent: true,

  // Incident — when and where it happened
  incidentAt: "",
  location: "",
  tripRef: "",
  farePaid: "",

  // Subject — who it is against
  vehicleRef: "",
  driverRef: "",
  mode: "",

  // Allegation
  category: "",
  type: "",
  priority: "",
  statement: "",

  // Handling
  assignee: "",
  attachments: [],
}

/**
 * The five things that must be true before a complaint can be filed.
 * Handling is deliberately absent: assignment and attachments are optional,
 * so gating on them would block a valid complaint. Anonymous complaints are
 * accepted — RTA cannot refuse one — so contact details are required only
 * when the complainant has given a name.
 */
export const STEPS = [
  {
    id: "intake",
    label: "Intake",
    done: (d) => Boolean(d.receivedAt && d.channel),
  },
  {
    id: "complainant",
    label: "Complainant",
    done: (d) =>
      d.anonymous || Boolean(d.complainantName.trim() && d.complainantPhone.trim()),
  },
  {
    id: "incident",
    label: "Incident",
    done: (d) => Boolean(d.incidentAt && d.location),
  },
  { id: "subject", label: "Subject", done: (d) => Boolean(d.vehicleRef.trim()) },
  {
    id: "allegation",
    label: "Allegation",
    done: (d) =>
      Boolean(d.category && d.type && d.priority && d.statement.trim().length > 15),
  },
]

export function completeness(draft) {
  const done = STEPS.filter((s) => s.done(draft))
  return { done: done.length, total: STEPS.length, steps: STEPS.map((s) => s.done(draft)) }
}

/** The first unmet step, with its 1-based position for the rail's badge. */
export function nextStep(draft) {
  const index = STEPS.findIndex((s) => !s.done(draft))
  return index === -1 ? null : { ...STEPS[index], position: index + 1 }
}

export function canSubmit(draft) {
  return STEPS.every((s) => s.done(draft))
}

/** Local datetime string for an `<input type="datetime-local">`. */
export function nowLocal(base = new Date()) {
  const p = (n) => String(n).padStart(2, "0")
  return `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(base.getDate())}T${p(
    base.getHours(),
  )}:${p(base.getMinutes())}`
}
