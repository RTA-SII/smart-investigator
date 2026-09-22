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
 * Open work on this officer's name.
 *
 * Closed is obvious; escalated counts as off their plate too, because the
 * ruling is the supervisor's from that point. Every "how much has this
 * officer got on" answer in the app comes from here — the nav count, the
 * assignment picker and the arrival scheduler — so they cannot disagree.
 */
export const isOpenFor = (c, officerId) =>
  c.assignee?.id === officerId && c.stage !== "Closed" && c.stage !== "Escalated"
