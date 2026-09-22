import { buildArrival, COMPLAINTS } from "@/data/complaints"
import { deliverTo, onComplaintsChange, allComplaints } from "@/app/complaintStore"
import { notify } from "@/app/notifications"
import { currentRole } from "@/app/session"
import { isOpenFor, isQueued } from "@/lib/cht"

/**
 * Live complaint arrivals — demand-driven, one at a time.
 *
 * The officer is never given a pile, and never a queue to browse. They sign
 * in to an empty desk; one complaint is handed to them; the next only comes
 * once that one is off their hands — settled, escalated, or handed back.
 * Twenty seconds later, the next.
 *
 * That is what makes the five-minute Complaint Handling Time legible in a
 * demo: there is exactly one clock running, and it is theirs. It starts on
 * delivery, not on a pull, because there is nothing to pull.
 *
 * Only an investigation officer is fed this way. A supervisor monitors and
 * rules on referrals; work is not handed to them.
 */

/** After signing in, before the first complaint lands. */
export const FIRST_ARRIVAL_MS = 3_000

/** After the officer's desk clears, before the next one lands. */
export const NEXT_ARRIVAL_MS = 20_000

let pending = null
let delivered = 0
let unsubscribe = null

/** Deliver one complaint into the Main Queue and raise its notification. */
export function deliverArrival(n = delivered, officer = currentRole()?.staff) {
  const arrival = buildArrival(COMPLAINTS.length + n)
  const id = deliverTo(arrival, { id: officer.code, name: officer.name })

  notify({
    title: "New complaint assigned to you",
    body: `${arrival.type} · ${arrival.company}`,
    complaintId: id,
    tone: arrival.priority === "Critical" ? "critical" : "info",
    at: arrival.receivedAt,
  })
  return id
}

/**
 * Has the signed-in officer got nothing to work on?
 *
 * Both halves matter: a complaint still waiting in the queue is theirs to
 * pull, and one they are holding is still open. Only when neither exists is
 * the desk genuinely clear.
 */
export function deskIsClear(rows = allComplaints(), role = currentRole()) {
  if (rows.some(isQueued)) return false
  return !rows.some((c) => isOpenFor(c, role?.staff?.code))
}

/** Work is handed to investigation officers, not to supervisors. */
const isOfficer = () => currentRole()?.id === "officer"

function schedule(delay) {
  if (pending) return
  pending = setTimeout(() => {
    pending = null
    if (!deskIsClear() || !isOfficer()) return
    deliverArrival(delivered++)
  }, delay)
}

/**
 * Watch the desk and keep it fed. Idempotent — App mounts once, but a remount
 * in development must not double the rate.
 */
export function startArrivals() {
  if (unsubscribe || !isOfficer()) return stopArrivals

  // Re-check whenever anything in the store moves: a decision, a pull, an
  // automatic recall. That is what makes "20 seconds after you close it" fall
  // out without the decision path having to know arrivals exist.
  unsubscribe = onComplaintsChange(() => {
    if (deskIsClear()) schedule(NEXT_ARRIVAL_MS)
  })

  if (deskIsClear()) schedule(FIRST_ARRIVAL_MS)
  return stopArrivals
}

export function stopArrivals() {
  clearTimeout(pending)
  pending = null
  unsubscribe?.()
  unsubscribe = null
}

/** Sign-out resets the run, so the next demo starts from the top. */
export function resetArrivals() {
  stopArrivals()
  delivered = 0
}

export const arrivalsDelivered = () => delivered
export const arrivalPending = () => pending !== null
