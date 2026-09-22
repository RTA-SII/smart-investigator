import {
  CATEGORIES,
  MANUAL_CHANNELS,
  PENALTIES,
  STATEMENTS,
  CHANNELS,
  COMPANIES,
  LOCATIONS,
  MODES,
  PRIORITIES,
} from "./catalog"
import { OFFICERS, SEED_OFFICERS } from "./personas"
import { buildAi } from "./crossValidation"
import { DRIVER_FIRST, DRIVER_LAST, FIRST, LAST } from "./names"
import { frameFor } from "./evidenceFrames"
import { pick, rng } from "./rand"
import { buildComments } from "./comments"

/**
 * Deterministic complaint dataset.
 *
 * Everything is derived from a seeded PRNG so the queue, the KPIs and the
 * charts agree with one another and stay put across reloads — the same
 * approach the BLE POC takes. `NOW` is the demo's fixed "current time"; SLA
 * countdowns are measured against it so the urgent rows are always urgent.
 */

export const NOW = new Date("2026-09-18T11:20:00")

const name = (r, first, last) => `${pick(r, first)} ${pick(r, last)}`

const plate = (r) => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  return (
    letters[Math.floor(r() * letters.length)] +
    String(Math.floor(r() * 90000) + 10000)
  )
}

/** Masked to the last four digits, the way CRM hands contact details over. */
const phone = (r) => `+971 5• ••• ${String(Math.floor(r() * 9000) + 1000)}`

function buildTimeline(r, c) {
  const t0 = new Date(c.receivedAt)
  const steps = [
    {
      at: new Date(t0).toISOString(),
      actor: "CRM Gateway",
      action: "Complaint received",
      note: `Ingested from ${c.channel} · ${c.crmRef}`,
    },
  ]

  // The engine only appears in the trail once somebody has actually run it.
  if (c.aiVerified) {
    steps.push({
      at: new Date(t0.getTime() + 22_000).toISOString(),
      actor: "Cross-Validation Engine",
      action: "AI cross-validation completed",
      note: `${c.ai.verdict} at ${c.ai.confidence}% confidence`,
    })
  }

  if (c.stage !== "New") {
    steps.push({
      at: new Date(t0.getTime() + 60_000).toISOString(),
      actor: "Routing",
      action: "Assigned to investigation officer",
      note: c.assignee ? `${c.assignee.name} · ${c.assignee.id}` : "Auto-routed",
    })
  }
  if (c.stage === "Escalated") {
    steps.push({
      at: new Date(t0.getTime() + 190_000).toISOString(),
      actor: c.assignee?.name ?? "Officer",
      action: "Escalated to supervisor",
      note: "Officer flagged doubt over evidence sufficiency",
    })
  }
  if (c.stage === "Closed") {
    // A share of closed complaints went up first and were ruled on by a
    // supervisor. Without them the escalation filter's "Escalated and closed"
    // outcome would have nothing to show.
    if (r() < 0.28) {
      steps.push({
        at: new Date(t0.getTime() + 190_000).toISOString(),
        actor: c.assignee?.name ?? "Officer",
        action: "Escalated to supervisor",
        note: "Officer flagged doubt over evidence sufficiency",
      })
    }
    steps.push({
      at: new Date(t0.getTime() + 240_000).toISOString(),
      actor: c.assignee?.name ?? "Officer",
      action: `Closed — ${c.outcome}`,
      note: "Decision recorded against the driver's permit history",
    })
  }
  return steps
}

function buildOne(i, fresh = false) {
  const r = rng(9_000_017 + i * 7919)

  const category = pick(r, Object.keys(CATEGORIES))
  const type = pick(r, CATEGORIES[category])
  const mode = r() < 0.72 ? "Taxi" : pick(r, MODES)

  // Received within the last ~14 days, clustered towards the present so the
  // "today" KPIs have something to say.
  // Always draw, so a fresh arrival and a seeded row share one PRNG stream.
  const aged = Math.floor(r() ** 2.2 * 20_160)
  const ageMinutes = fresh ? 0 : aged
  const receivedAt = new Date(NOW.getTime() - ageMinutes * 60_000).toISOString()

  const priority =
    category === "Driver Behaviour"
      ? r() < 0.28
        ? "Critical"
        : r() < 0.7
          ? "High"
          : "Medium"
      : pick(r, PRIORITIES)

  // Nothing seeded waits in the Main Queue. The queue is what fills up while
  // somebody is signed in, from live arrivals — so the backlog is modelled as
  // work already picked up, and only a fresh arrival is ever `New`.
  let stage
  if (ageMinutes < 5) stage = fresh ? "New" : "Assigned"
  else if (ageMinutes < 120) stage = r() < 0.5 ? "Assigned" : "Under Investigation"
  else if (r() < 0.16) stage = "Escalated"
  else stage = "Closed"

  const ai = buildAi(r, type, category)

  let outcome = null
  let penalty = null
  if (stage === "Closed") {
    if (ai.verdict === "Confirmed") {
      outcome = "Fine Issued"
      // A minority of upheld cases also suspend something.
      if (r() < 0.32) penalty = pick(r, PENALTIES)
    } else if (ai.verdict === "False Positive") {
      outcome = "False Positive"
    } else {
      outcome = r() < 0.5 ? "No Fine Required" : "Fine Issued"
    }
  }

  const assignee = stage === "New" ? null : pick(r, SEED_OFFICERS)

  const complaint = {
    id: `CMP-${String(41_200 + i).padStart(6, "0")}`,
    crmRef: `CRM-2026-${String(Math.floor(r() * 900000) + 100000)}`,
    channel: pick(r, CHANNELS),
    category,
    type,
    mode,
    priority,
    stage,
    outcome,
    penalty,
    company: pick(r, COMPANIES),
    plate: plate(r),
    sideNumber: `${pick(r, ["EB", "DX", "HT", "XE"])}${Math.floor(r() * 900) + 100}`,
    location: pick(r, LOCATIONS),
    receivedAt,
    slaMinutes: 5,
    assignee: assignee && { id: assignee.id, name: assignee.name },
    complainant: {
      name: name(r, FIRST, LAST),
      phone: phone(r),
      tripRef: `TRP-${Math.floor(r() * 9_000_000) + 1_000_000}`,
    },
    driver: {
      name: name(r, DRIVER_FIRST, DRIVER_LAST),
      licence: `DL-${Math.floor(r() * 900000) + 100000}`,
      permit: `PRM-${Math.floor(r() * 90000) + 10000}`,
      rating: (3.2 + r() * 1.7).toFixed(1),
      priorComplaints: Math.floor(r() * 6),
    },
    ai,
    evidence: [
      { kind: "image", label: "In-cab camera still", time: receivedAt, frame: frameFor("In-cab camera still", i) },
      { kind: "image", label: "Forward road view", time: receivedAt, frame: frameFor("Forward road view", i) },
      { kind: "video", label: "Trip recording", time: receivedAt, frame: frameFor("Trip recording", i) },
      { kind: "doc", label: "CRM complaint transcript", time: receivedAt, frame: null },
    ],
    narrative: buildNarrative(r, type),
  }

  // Who typed it in. Unlike the assignee this *can* be the signed-in officer:
  // logging a complaint is not the same as being handed one, and their Manual
  // Complaints page is the list of what they logged.
  const logger = MANUAL_CHANNELS.includes(complaint.channel) ? pick(r, OFFICERS) : null
  complaint.loggedBy = logger && { id: logger.id, name: logger.name }

  // Anything already being worked has been through the engine; a complaint
  // nobody has touched yet has not, so its officer gets the Verify button.
  complaint.aiVerified = complaint.stage !== "New"

  complaint.timeline = buildTimeline(r, complaint)
  complaint.comments = buildComments(r, complaint)
  return complaint
}

function buildNarrative(r, type) {
  const openers = [
    "Caller reports that during the trip the driver",
    "Complainant states that the driver",
    "Passenger describes that the driver",
  ]
  return `${pick(r, openers)} ${STATEMENTS[type]}. Reported as: ${type}.`
}

/**
 * A complaint arriving right now.
 *
 * The same generator, aged to zero: it lands as `New` with nobody on it, so
 * it goes straight into the Main Queue to be pulled. `fileComplaint` gives it
 * its real id — the one here is only what the seed sequence would produce.
 */
export function buildArrival(i) {
  return buildOne(i, true)
}

export const COMPLAINTS = Array.from({ length: 96 }, (_, i) => buildOne(i)).sort(
  (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt),
)

export function complaintById(id) {
  return COMPLAINTS.find((c) => c.id === id)
}
