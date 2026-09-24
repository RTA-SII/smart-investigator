/**
 * Complaint Handling Time — the five-minute target from the POC scope (§7).
 *
 * A complaint is handed to an officer and the clock starts on delivery, not
 * when CRM sent it. When it lapses the complaint is simply breached: it stays
 * with the officer, because it is already theirs and there is nowhere to send
 * it back to.
 */

/** Seeded rows were never delivered; they run against the demo clock instead. */
export function chtState(complaint, now) {
  if (complaint.stage === "Closed") return { phase: "closed", seconds: 0 }
  if (complaint.stage === "Escalated") return { phase: "escalated", seconds: 0 }
  if (!complaint.pulledAt) return { phase: "queued", seconds: 0 }

  const elapsed = (now - new Date(complaint.pulledAt)) / 1000
  const left = complaint.slaMinutes * 60 - elapsed

  if (left > 0) return { phase: "running", seconds: left }

  return { phase: "breached", seconds: 0 }
}

/** Nobody owns it — which should not happen now that work is pushed. */
export const isQueued = (c) => c.stage === "New" && !c.assignee

/**
 * Stages that are no longer the officer's to act on.
 *
 * Closed is obvious. Escalated is the supervisor's ruling from that point.
 * Returned is back with Customer Happiness awaiting the missing detail —
 * the officer cannot progress it and should not be held up by it, so it
 * neither blocks the next arrival nor counts as unactioned.
 */
export const OFF_DESK = ["Closed", "Escalated", "Returned"]

/**
 * Open work on this officer's name.
 *
 * Every "how much has this officer got on" answer in the app comes from
 * here — the nav count, the assignment picker and the arrival scheduler —
 * so they cannot disagree.
 */
export const isOpenFor = (c, officerId) =>
  c.assignee?.id === officerId && !OFF_DESK.includes(c.stage)

/**
 * When a complaint was settled.
 *
 * A ruling made in session stamps its own time, RTA's own cases carry
 * theirs, and a generated row has only its handling time — which is the
 * same fact written as a duration rather than an instant.
 */
export function closedAt(c) {
  if (c.stage !== "Closed") return null
  if (c.decision?.at) return new Date(c.decision.at)
  if (c.resolvedAt) return new Date(c.resolvedAt)
  if (c.handlingMinutes != null)
    return new Date(new Date(c.receivedAt).getTime() + c.handlingMinutes * 60_000)
  return new Date(c.receivedAt)
}
