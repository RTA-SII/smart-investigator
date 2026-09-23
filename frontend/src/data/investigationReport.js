import { ACTIVITY_SYSTEM } from "./catalog"

/**
 * The cross-validation write-up, in the shape SMC publishes it.
 *
 * SMC does not summarise a verdict in a sentence — it issues a numbered
 * investigation report: what was alleged and against whom, the decision and
 * its confidence, the one reason that drove it, and then every evidence
 * source it consulted with what each one showed. Ours is derived from the
 * same eight checks the engine already ran, so the document and the verdict
 * cannot disagree.
 */

/** SMC's wording for the decision, not the engine's internal verdict. */
const DECISION = {
  Confirmed: "Violation Confirmed",
  Inconclusive: "Insufficient Evidence",
  "False Positive": "No Violation Found",
}

const ENFORCEMENT = {
  Confirmed: "Fine to be issued against the driver's licence",
  Inconclusive: "No fine or penalty to be issued on the present evidence",
  "False Positive": "No fine or penalty to be issued for this complaint",
}

/**
 * What each check looked at, and what it found either way.
 *
 * Several take `ctx`, because a check downstream of a failure cannot be
 * written as though it stood alone: a vehicle cannot "match the trip record"
 * when no trip record was found, and footage cannot fail to show a violation
 * when no footage was retrieved. A report that says both is not defensible.
 */
const DETAIL = {
  "CRM case categorized and complete": (c, pass) =>
    pass
      ? `Case ${c.crmRef} arrived categorised as ${c.type}, with the date, time, vehicle and description all present.`
      : `Case ${c.crmRef} is missing detail the investigation needs; Customer Happiness has not supplied a complete record.`,

  "Trip found in operational records": (c, pass, ctx) =>
    pass
      ? `A trip matching the reported window was found in ${ctx.system}.`
      : `No trip matching the reported window could be found in ${ctx.system}.`,

  "Vehicle and side number match": (c, pass, ctx) =>
    !ctx.tripFound
      ? `Vehicle ${vehicle(c)} agrees with the case record, but there is no trip to confirm it against.`
      : pass
        ? `Vehicle ${vehicle(c)} matches the vehicle on the trip record.`
        : `Vehicle ${vehicle(c)} does not agree with the vehicle on the trip record.`,

  "Driver on shift at the reported time": (c, pass, ctx) =>
    !ctx.tripFound
      ? `No trip record was found, so the shift could not be confirmed in ${ctx.system}.`
      : pass
        ? `The driver was signed on to ${vehicleRef(c)} at the reported time.`
        : `No driver was signed on to ${vehicleRef(c)} at the reported time.`,

  "Permit valid at time of trip": (c, pass) =>
    pass
      ? `Permit ${c.driver.permit} was valid for the whole of the trip.`
      : `Permit ${c.driver.permit} was not valid at the time of the trip.`,

  "Lynx recording retrieved": (c, pass) =>
    pass
      ? "Lynx returned the recording held against the trip."
      : "Lynx holds no retrievable recording for this trip.",

  "Recording covers the reported window": (c, pass, ctx) =>
    !ctx.haveRecording
      ? "No recording was retrieved, so no window could be covered."
      : pass
        ? "The recording spans the window the complaint refers to."
        : "The recording does not span the window the complaint refers to.",

  "Footage supports the allegation": (c, pass, ctx) =>
    !ctx.haveRecording
      ? `No footage was available to support or contradict the reported ${c.type.toLowerCase()}.`
      : pass
        ? `The footage shows the reported ${c.type.toLowerCase()}.`
        : `The footage does not show the reported ${c.type.toLowerCase()}.`,
}

/** The four sources the workflow deck names, and which checks belong to each. */
const SOURCES = [
  { title: "Case record", source: "CRM", checks: ["CRM case categorized and complete"] },
  {
    title: "Trip, vehicle and driver",
    source: null, // the operational system for this transport activity
    checks: [
      "Trip found in operational records",
      "Vehicle and side number match",
      "Driver on shift at the reported time",
    ],
  },
  { title: "Permit and licensing", source: "RTA licensing", checks: ["Permit valid at time of trip"] },
  {
    title: "Video evidence",
    source: "Lynx",
    checks: [
      "Lynx recording retrieved",
      "Recording covers the reported window",
      "Footage supports the allegation",
    ],
  },
]

const evidenceType = (c) =>
  c.evidence?.some((e) => e.kind === "video")
    ? "in-cab video"
    : c.evidence?.some((e) => e.kind === "image")
      ? "camera stills"
      : "the CRM record"

/**
 * Why the decision went the way it did, naming the checks that drove it.
 *
 * SMC leads with "The core reason is that…" and then points at the specific
 * thing that settled it — a report that only restates the verdict is not a
 * justification.
 */
function coreReason(c, failed, ctx) {
  // The completeness of the CRM record is a process failure, not evidence
  // about the event, so it is the last thing to lead with.
  const ranked = [...failed].sort(
    (a, b) =>
      Number(a.label === CRM_CHECK) - Number(b.label === CRM_CHECK),
  )
  const named = ranked.slice(0, 2).map((f) => DETAIL[f.label](c, false, ctx))

  if (c.ai.verdict === "Confirmed") {
    const priors = `the driver carries ${c.driver.priorComplaints} prior complaint${c.driver.priorComplaints === 1 ? "" : "s"} on record`
    // Only say nothing contradicts it when nothing does. A confirmed finding
    // can still carry a failed check, and the report has to own that.
    const caveat = named.length
      ? `One caveat stands against it: ${named[0].charAt(0).toLowerCase()}${named[0].slice(1)} On balance ${priors}.`
      : `No consulted source contradicts the allegation, and ${priors}.`

    return `The core reason is that ${ctx.system} places ${c.plate} on the reported trip and the retrieved ${evidenceType(c)} corroborates the ${c.type.toLowerCase()}. ${caveat}`
  }

  if (c.ai.verdict === "False Positive") {
    return `The core reason is that no source consulted corroborates the report. ${named[0] ?? "The recorded behaviour is within normal parameters for the trip."} Nothing should be raised against the driver's licence on this evidence.`
  }

  return `The core reason is that the evidence does not settle the question either way. ${named.join(" ")} Confidence sits at ${c.ai.confidence}%, below the threshold at which a penalty is safe.`
}

const system = (c) => ACTIVITY_SYSTEM[c.mode] ?? "the operational system"

const CRM_CHECK = "CRM case categorized and complete"

/**
 * How the vehicle is named in the report.
 *
 * RTA's own cases carry a plate but no side number — their export simply does
 * not record one — so nothing here may assume both exist. Printing "vehicle
 * null" in a document an officer signs off is worse than printing less.
 */
const vehicle = (c) =>
  c.sideNumber ? `${c.sideNumber} — plate ${c.plate}` : `plate ${c.plate}`

const vehicleRef = (c) => c.sideNumber ?? c.plate

/** SMC stamps the report to the second, without a zone. */
const stamp = (iso) => String(iso).slice(0, 19)

export function buildReport(c) {
  const byLabel = new Map(c.ai.checks.map((k) => [k.label, k]))
  const failed = c.ai.checks.filter((k) => !k.pass)
  const ctx = {
    system: system(c),
    tripFound: !!byLabel.get("Trip found in operational records")?.pass,
    haveRecording: !!byLabel.get("Lynx recording retrieved")?.pass,
  }

  return {
    title: `Investigation Report: Complaint ${c.id}`,
    narrative: `A ${c.type} complaint (CRM ref: ${c.crmRef}) was raised against vehicle ${vehicle(c)}, operated by ${c.company}, received on ${stamp(c.receivedAt)}. The primary evidence type is ${evidenceType(c)}.`,
    decision: [
      { label: "Final Decision", value: DECISION[c.ai.verdict] ?? c.ai.verdict },
      { label: "Decision Confidence", value: `${c.ai.confidence.toFixed(1)}%` },
      { label: "Enforcement Action", value: ENFORCEMENT[c.ai.verdict] ?? "—" },
    ],
    coreReason: coreReason(c, failed, ctx),
    sources: SOURCES.map((group, i) => ({
      number: `2.${i + 1}`,
      title: group.title,
      source: group.source ?? ctx.system,
      items: group.checks.map((label) => {
        const pass = !!byLabel.get(label)?.pass
        return { label, pass, detail: DETAIL[label](c, pass, ctx) }
      }),
    })),
    assessment: c.ai.summary,
    recommendation: c.ai.recommendation,
    passed: c.ai.checks.length - failed.length,
    total: c.ai.checks.length,
  }
}
