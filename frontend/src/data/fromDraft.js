import { buildAi } from "./crossValidation"
import { COMPANIES, MODES } from "./catalog"
import { OFFICERS } from "./personas"
import { NOW } from "./complaints"
import { pick, rng } from "./rand"

/**
 * Turn a manual-complaint draft into a complaint the rest of the app can read.
 *
 * The form captures what a person can tell you; the generated set also carries
 * registry detail (company, plate, driver record) that a real build would
 * resolve from the vehicle. Here that is derived deterministically from the
 * side number, so the same input always yields the same record.
 */

/** Small deterministic hash, so a given vehicle reference is stable. */
function seedFrom(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function toComplaint(draft, officer) {
  const vehicleRef = draft.vehicleRef.trim().toUpperCase()
  const r = rng(seedFrom(vehicleRef || "UNKNOWN"))

  const assignee = OFFICERS.find((o) => draft.assignee.startsWith(o.name))
  const receivedAt = new Date(draft.receivedAt || NOW).toISOString()
  const ai = buildAi(r, draft.type, draft.category)

  const complaint = {
    crmRef: draft.externalRef.trim() || `SMC-${String(seedFrom(vehicleRef) % 900000 + 100000)}`,
    channel: draft.channel,
    category: draft.category,
    type: draft.type,
    mode: draft.mode || pick(r, MODES),
    priority: draft.priority,
    stage: assignee ? "Assigned" : "New",
    outcome: null,
    source: "Manual",
    company: pick(r, COMPANIES),
    plate: vehicleRef,
    sideNumber: vehicleRef,
    location: draft.location,
    receivedAt,
    slaMinutes: 5,
    assignee: assignee && { id: assignee.id, name: assignee.name },
    loggedBy: { id: officer.staff.code, name: officer.staff.name },
    aiVerified: false,
    complainant: {
      name: draft.anonymous ? "Anonymous" : draft.complainantName.trim(),
      phone: draft.anonymous ? "Withheld" : draft.complainantPhone.trim(),
      tripRef: draft.tripRef.trim() || "—",
    },
    driver: {
      name: draft.driverRef.trim() || "Pending registry lookup",
      licence: draft.driverRef.trim() || `DL-${Math.floor(r() * 900000) + 100000}`,
      permit: `PRM-${Math.floor(r() * 90000) + 10000}`,
      rating: (3.2 + r() * 1.7).toFixed(1),
      priorComplaints: Math.floor(r() * 6),
    },
    ai,
    evidence: draft.attachments.map((label, i) => ({
      kind: i === 0 ? "image" : "doc",
      label,
      time: receivedAt,
      frame: null,
    })),
    narrative: draft.statement.trim(),
    comments: [],
  }

  complaint.timeline = [
    {
      at: receivedAt,
      actor: `${officer.staff.name} · ${officer.staff.code}`,
      action: "Complaint logged manually",
      note: `Taken at the centre via ${draft.channel}`,
    },
    ...(assignee
      ? [
          {
            at: new Date(new Date(receivedAt).getTime() + 40_000).toISOString(),
            actor: "Routing",
            action: "Assigned to investigation officer",
            note: `${assignee.name} · ${assignee.id}`,
          },
        ]
      : []),
  ]

  return complaint
}
