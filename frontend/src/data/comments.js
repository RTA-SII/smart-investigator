import { pick } from "./rand"

/**
 * Seeded case comments (POC scope §8).
 *
 * The audit log records what the system did — received, cross-validated,
 * assigned, closed. Comments record what the people thought while it was
 * open: the officer's doubt, the supervisor's steer, the callback that
 * confirmed a statement. Two different trails, deliberately kept apart: the
 * audit log is evidence, the thread is a conversation.
 */

export const QUEUE_AUTHOR = { name: "Omar Bin Haider", id: "SMC-0204", role: "Supervisor" }

/** Why an officer would rather not rule alone. */
const DOUBT = [
  "Cross-validation is not conclusive and the in-cab still cuts off at the meter. Escalating rather than ruling on a partial frame.",
  "The complainant's account and the trip recording disagree on where the trip ended. I would rather a supervisor called this one.",
  "Driver disputes the allegation and has no prior record. Not comfortable issuing a fine on this evidence alone.",
  "Second complaint against this plate this week, but neither has a clean frame. Passing it up for a view on the pattern.",
]

/** The supervisor answering. */
const STEER = [
  "Pulled the full trip recording from the operator — agreed the still is not enough on its own. Hold while I review.",
  "Noted. Check whether the same plate appears anywhere in the last thirty days before we decide.",
  "I will take this one. Leave it open on my name and move to the next in the queue.",
  "Evidence is thin but the statement is specific. Request the meter log before you close it either way.",
]

/** Ordinary progress an officer records mid-investigation. */
const PROGRESS = [
  "Called the complainant back to confirm the pickup point. The statement is consistent with the trip record.",
  "Operator has confirmed the driver was on shift at the reported time.",
  "Requested the meter log from the company; I will attach it to evidence when it arrives.",
  "Reviewed the forward road view frame by frame — the manoeuvre is visible at the timestamp given.",
]

/** What gets said as the complaint is settled. */
const CLOSING = [
  "Evidence lines up with the allegation. Recording the decision against the driver's permit history.",
  "Closed after review — the recording does not support what was reported.",
  "Decision recorded and the complainant has been notified through CRM.",
]

/**
 * Build the thread for one seeded complaint. Nothing that is still sitting in
 * the queue has been discussed yet, so those come back empty.
 */
export function buildComments(r, complaint) {
  if (complaint.stage === "New" || !complaint.assignee) return []

  const t0 = new Date(complaint.receivedAt).getTime()
  const officer = {
    name: complaint.assignee.name,
    id: complaint.assignee.id,
    role: "Investigation Officer",
  }

  const thread = []
  const add = (minutes, author, body) =>
    thread.push({
      id: `${complaint.id}-c${thread.length + 1}`,
      at: new Date(t0 + minutes * 60_000).toISOString(),
      author,
      body,
    })

  if (complaint.stage === "Escalated") {
    add(3, officer, pick(r, DOUBT))
    add(8, QUEUE_AUTHOR, pick(r, STEER))
    return thread
  }

  if (complaint.stage === "Closed") {
    if (r() < 0.45) add(2, officer, pick(r, PROGRESS))
    if (r() < 0.7) add(4, officer, pick(r, CLOSING))
    return thread
  }

  // Assigned or Under Investigation — a note about half the time.
  if (r() < 0.55) add(2, officer, pick(r, PROGRESS))
  return thread
}
