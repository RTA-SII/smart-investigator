import { useSyncExternalStore } from "react"
import { COMPLAINTS, NOW } from "@/data/complaints"

/**
 * The live complaint set.
 *
 * `COMPLAINTS` is a frozen seed; this store owns the mutable copy that every
 * screen reads. Without it a ruling only decorated the detail page — the
 * complaint never left the queue, never reached the supervisor, and never
 * moved a KPI.
 *
 * Same `useSyncExternalStore` shape as `session.js` and `i18n/index.js`: no
 * provider, no library, and every subscriber re-renders on a write.
 */

/**
 * Bump when the generated shape or its vocabulary changes.
 *
 * The store persists whole complaints — verdicts, stages and labels included
 * — so a save made before a rename keeps showing the old word forever. This
 * happened: `Substantiated` survived in people's browsers after the verdict
 * was renamed to `Confirmed`. The version is in the key, and older keys are
 * swept on load, so that cannot happen silently again.
 */
const DATA_VERSION = 12
const KEY = `smc-complaints-data.v${DATA_VERSION}`
const LEGACY_KEYS = [
  "smc-complaints-data",
  "smc-complaints-data.v2",
  "smc-complaints-data.v3",
  "smc-complaints-data.v4",
  // 5 through 7 briefly carried evidence media that has since been removed;
  // swept so a browser that loaded one of them reseeds instead of holding
  // complaints that point at files no longer in the build.
  "smc-complaints-data.v5",
  "smc-complaints-data.v6",
  "smc-complaints-data.v7",
  "smc-complaints-data.v8",
  "smc-complaints-data.v9",
  "smc-complaints-data.v10",
  "smc-complaints-data.v11",
]

/**
 * What each decision does to the complaint.
 *
 * One button, one verified finding — the mapping RTA set out on slide 3 of
 * the workflow deck. `noEnforcement` is the single exception: both of its
 * findings close the case without enforcement, so the officer picks which,
 * and `outcome` here is only the default the panel opens on.
 *
 * A finding is not the same thing as a closure. *Face-to-face investigation
 * needed* and *Essential information missing* are both recorded findings on
 * cases that are still very much alive — one is upstairs, one is back with
 * Customer Happiness.
 */
export const TRANSITIONS = {
  guilty: { stage: "Closed", outcome: "Valid Complaint - Guilty" },
  noEnforcement: { stage: "Closed", outcome: "Valid Complaint - Not Guilty" },
  matchFound: { stage: "Closed", outcome: "Potential Match Found" },
  missingInfo: { stage: "Returned", outcome: "Essential Information Missing" },
  faceToFace: {
    stage: "Escalated",
    outcome: "Face-to-Face Investigation Needed",
  },
  // The only route that records no finding at all: the officer is not ruling,
  // they are saying they cannot.
  escalate: { stage: "Escalated", outcome: null },
  reassign: { stage: "Assigned", outcome: null },
}

const load = () => {
  try {
    for (const old of LEGACY_KEYS) localStorage.removeItem(old)
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (Array.isArray(saved) && saved.length) return saved
    }
  } catch {
    /* private mode or corrupted payload — fall back to the seed */
  }
  return COMPLAINTS
}

let rows = load()
const listeners = new Set()

function commit(next) {
  rows = next
  try {
    localStorage.setItem(KEY, JSON.stringify(rows))
  } catch {
    /* non-fatal: the demo just won't survive a reload */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useComplaints() {
  return useSyncExternalStore(subscribe, () => rows)
}

/** Subscribe outside React — for code that reacts to writes, not renders. */
export const onComplaintsChange = subscribe

/** Read outside React — for one-off lookups that are not render inputs. */
export const allComplaints = () => rows

export function complaintById(id) {
  return rows.find((c) => c.id === id)
}

/** Timeline entries are stamped against the demo clock, not wall time. */
const stamp = () => new Date(NOW.getTime() + 1000).toISOString()

const replace = (id, patch) =>
  commit(rows.map((c) => (c.id === id ? { ...c, ...patch } : c)))

/**
 * Record a ruling. Moves the complaint's stage, sets its outcome, and appends
 * the officer's own words to the audit trail.
 */
export function decide(
  id,
  action,
  { note, by, penalty, officer, finding, fineSubCategory, suspensionDays, method } = {},
) {
  const complaint = complaintById(id)
  const move = TRANSITIONS[action.id]
  if (!complaint || !move) return

  // Only an action that offers a choice of finding may override the default,
  // so a stray value cannot record a finding the button does not produce.
  const allowed = action.findings?.some((f) => f.value === finding)
  const outcome = allowed ? finding : move.outcome

  // Only a guilty finding carries an enforcement action; every other finding
  // records "Not guilty" or nothing at all.
  const applied =
    action.id === "guilty"
      ? (penalty ?? "Driver Fine")
      : move.stage === "Closed"
        ? "Not guilty"
        : null

  // Reassignment is the supervisor's fourth action, so it changes the owner
  // as well as the stage — the same officer means "return it to them".
  const owner =
    action.id === "reassign" && officer
      ? { id: officer.id, name: officer.name }
      : complaint.assignee

  // Measured against wall time, not the demo clock: `pulledAt` is stamped
  // when the complaint lands and the SLA counts down in real seconds, so the
  // two ends of the measurement have to agree on which clock they are on.
  // Mixing them produced handling times of minus several thousand minutes.
  const handlingMinutes =
    move.stage === "Closed" && complaint.pulledAt
      ? Number(((Date.now() - new Date(complaint.pulledAt)) / 60_000).toFixed(1))
      : complaint.handlingMinutes

  replace(id, {
    stage: move.stage,
    outcome,
    handlingMinutes,
    penalty: applied,
    assignee: owner,
    // A reassigned complaint is live again, so the handling time restarts.
    pulledAt: action.id === "reassign" ? null : complaint.pulledAt,
    decision: { id: action.id, label: action.label, note, by, penalty: applied, at: stamp() },
    // The decision writes into the investigation form rather than living
    // beside it — the form is the record the process exists to produce.
    form: {
      ...complaint.form,
      date: stamp(),
      actionTaken: applied,
      investigatorStatement: note?.trim() || action.note,
      fineCategory: action.id === "guilty" ? "Driver Fines" : null,
      fineSubCategory: action.id === "guilty" ? (fineSubCategory ?? null) : null,
      suspensionDays: applied === "Fine & Suspension" ? (suspensionDays ?? null) : null,
      investigationMethod: method ?? complaint.form?.investigationMethod ?? "Via Camera",
    },
    timeline: [
      ...complaint.timeline,
      {
        at: stamp(),
        actor: by ?? "Officer",
        // Closed says Closed; a finding recorded on a case that is still
        // open says what was found, not that it ended.
        action:
          move.stage === "Closed"
            ? `Closed — ${outcome}${applied ? ` · ${applied}` : ""}`
            : outcome
              ? `${action.label} — ${outcome}`
              : action.label,
        note: note?.trim() || action.note,
      },
    ],
  })
}

export function assign(id, officer) {
  const complaint = complaintById(id)
  if (!complaint) return

  replace(id, {
    assignee: officer && { id: officer.id, name: officer.name },
    stage: complaint.stage === "New" && officer ? "Assigned" : complaint.stage,
    timeline: [
      ...complaint.timeline,
      {
        at: stamp(),
        actor: "Routing",
        action: officer ? "Reassigned" : "Assignment cleared",
        note: officer ? `${officer.name} · ${officer.id}` : "Returned to the pool",
      },
    ],
  })
}

/**
 * Post a comment on the case thread.
 *
 * Kept out of the audit log on purpose: the log is the evidential record of
 * what the system did, the thread is what the officer and supervisor said to
 * each other. Mixing them would make neither readable.
 */
export function addComment(id, { body, author } = {}) {
  const complaint = complaintById(id)
  const text = body?.trim()
  if (!complaint || !text || !author) return null

  const thread = complaint.comments ?? []
  const comment = {
    // Against the demo clock, a minute apart, so a session's replies read in
    // the order they were written instead of sharing one timestamp.
    id: `${id}-c${thread.length + 1}`,
    at: new Date(NOW.getTime() + (thread.length + 1) * 60_000).toISOString(),
    author,
    body: text,
  }
  replace(id, { comments: [...thread, comment] })
  return comment
}

/**
 * Run the cross-validation engine against a complaint.
 *
 * The verdict already exists — it is generated with the complaint — but it
 * is not shown until somebody asks for it, the way SMC gates its own panel
 * behind a Verify button. Running it is an auditable act, so it lands in the
 * trail.
 */
export function verifyAi(id) {
  const complaint = complaintById(id)
  if (!complaint || complaint.aiVerified) return

  replace(id, {
    aiVerified: true,
    timeline: [
      ...complaint.timeline,
      {
        at: stamp(),
        actor: "Cross-Validation Engine",
        action: "AI cross-validation completed",
        note: `${complaint.ai.verdict} at ${complaint.ai.confidence}% confidence`,
      },
    ],
  })
}

/** Next id in the seeded sequence, so filed complaints stay deterministic. */
function nextId() {
  const highest = rows.reduce((max, c) => {
    const n = Number(c.id.replace("CMP-", ""))
    return Number.isFinite(n) && n > max ? n : max
  }, 0)
  return `CMP-${String(highest + 1).padStart(6, "0")}`
}

/**
 * Hand a complaint straight to an officer.
 *
 * The Main Queue is the pull path; this is the push one. The officer is given
 * the complaint and the Complaint Handling Time starts on delivery, so their
 * five minutes begin the moment it lands rather than when they get round to
 * pulling it. `pushed` marks it as theirs: the recall sweep leaves it alone,
 * because there is no queue for it to go back to.
 */
export function deliverTo(complaint, officer) {
  const id = fileComplaint({
    ...complaint,
    stage: "Under Investigation",
    assignee: { id: officer.id, name: officer.name },
    pulledAt: new Date().toISOString(),
    pushed: true,
    timeline: [
      ...complaint.timeline,
      {
        at: stamp(),
        actor: "Queue Manager",
        action: "Assigned to investigation officer",
        note: `${officer.name} · ${officer.id} — Complaint Handling Time started, ${complaint.slaMinutes} minutes`,
      },
    ],
  })
  return id
}

/** Insert a manual complaint, newest first, and hand back its id. */
export function fileComplaint(complaint) {
  const id = nextId()
  // The investigation form is numbered after its case, so re-stamp it: the
  // complaint is issued a new id here and the form would otherwise keep the
  // one the generator gave it.
  const filed = {
    ...complaint,
    id,
    form: complaint.form && {
      ...complaint.form,
      id: `${id}_${complaint.receivedAt.slice(0, 10)}`,
    },
  }
  commit(
    [filed, ...rows].sort(
      (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt),
    ),
  )
  return id
}

/** Restore the seeded set so a demo can be run again from the top. */
export function resetComplaints() {
  commit(COMPLAINTS)
}
