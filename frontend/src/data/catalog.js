/**
 * Vocabulary the complaints dataset is drawn from.
 *
 * Every value here comes from RTA's own CRM export (`Book2.xlsx`) and the
 * Investigation Office workflow deck — not invented. Where a value carries
 * RTA's bilingual wording, the Arabic is theirs, so `i18n/ar/domain.js` reads
 * from here rather than translating.
 *
 * Kept apart from the generator so the filter bars can enumerate options
 * without importing rows.
 */

/** RTA's `Origin`, plus the one channel the Investigation Office logs itself. */
export const CHANNELS = ["Chatbot", "Phone", "E-mail", "Walk-in"]

/**
 * Cases that were typed in at the centre rather than arriving from CRM.
 * `Walk-in` is our own addition — RTA's export has no manual origin, because
 * Customer Happiness raises every case upstream.
 */
export const MANUAL_CHANNELS = ["Walk-in"]

export const isManual = (c) =>
  c.source === "Manual" || MANUAL_CHANNELS.includes(c.channel)

/** RTA's two case types. */
export const CASE_TYPES = ["Complaint", "Lost Item"]

/**
 * RTA's `Reason / Purpose` values, grouped for the reports.
 *
 * The nine values are RTA's; the grouping is ours, because their export has
 * no category dimension and the reports need one.
 */
export const CATEGORIES = {
  "Driver Conduct": [
    "Verbal Assault",
    "Physical Assault",
    "Verbal Harassment",
    "Physical Harassment",
    "Staff Conduct",
  ],
  Driving: ["Reckless driving"],
  "Fare and Service": [
    "Extending Route To Increase Fare",
    "Refusal of Pick-up",
  ],
  "Lost Item": ["Lost Item Investigation"],
}

export const COMPLAINT_TYPES = Object.values(CATEGORIES).flat()

export const PRIORITIES = ["Critical", "High", "Medium", "Low"]

export const STAGES = [
  "New",
  "Assigned",
  "Under Investigation",
  "Escalated",
  "Returned",
  "Closed",
]

/**
 * The verified findings a case is recorded under (deck slide 3).
 *
 * *Valid Complaint - Guilty*, *Not Guilty* and *Potential Match Found* come
 * from RTA's `Status Reason`; the other three come from the decision model in
 * the deck, which the export happens not to contain an example of. Each is
 * produced by exactly one button on the Take Action card, and *No Enforcement
 * Needed* produces either of its two depending on which the officer picks.
 */
export const OUTCOMES = [
  "Valid Complaint - Guilty",
  "Valid Complaint - Not Guilty",
  "Invalid Complaint - No Event Exists",
  "Face-to-Face Investigation Needed",
  "Essential Information Missing",
  "Potential Match Found",
]

/** RTA's bilingual wording for the findings their export does carry. */
export const OUTCOME_AR = {
  "Valid Complaint - Guilty": "شكوى صحيحة - مذنب",
  "Valid Complaint - Not Guilty": "شكوى صحيحة - غير مذنب",
  "Potential Match Found": "تمت المطابقة بمعثور",
}

/** RTA's `Action Taken` — what actually happens to the driver. */
export const PENALTIES = [
  "Verbal Warning",
  "Driver Fine",
  "Fine & Suspension",
  "Not guilty",
  "Termination",
]

/** Fines are raised against the driver, or against the operating company
 *  when the vehicle had no recording available (deck slide 4). */
export const FINE_CATEGORIES = ["Driver Fines", "Company Fines"]

/** RTA's fine codes, verbatim from the investigation forms. */
export const FINE_SUB_CATEGORIES = [
  "1-49 Driving recklessly, or in a way that is dangerous to the public.",
  "1-52 Misbehave or abuse the customers, public, colleagues or the RTA employees.",
  "1-53 Non-compliance with the issued instructions or circulars by RTA.",
  "1-60 Defaming, cursing, or threatening Authority employees, customers, or Co-workers, or the public.",
]

export const INVESTIGATION_METHODS = ["Via Camera", "Face to Face & Camera"]

/** Suspension is recorded in days. RTA's forms show 3, 5 and 10. */
export const SUSPENSION_PERIODS = [3, 5, 10]

export const SATISFACTION = [
  "Satisfied",
  "Neutral",
  "Very Dissatisfied",
  "Called Customer - No Reply",
]

/**
 * The six modes RTA tracks complaints across (POC scope §1).
 *
 * `Rental` is RTA's *Hourly Rental* activity under the name the portal shows
 * — the billing unit is not something an investigator filters on.
 */
export const MODES = [
  "Taxi",
  "Public Bus",
  "School Bus",
  "Limousine and e-Hail",
  "Rental",
  "Marine",
]

/**
 * Which operational system validates a trip, by transport activity.
 *
 * Named in the workflow deck and confirmed on the process map, where the
 * investigator branches on activity before checking anything.
 */
export const ACTIVITY_SYSTEM = {
  Taxi: "D8 / TEAMS",
  "Limousine and e-Hail": "RMS",
  Rental: "RMS",
  "Public Bus": "TTSS",
  "School Bus": "TTSS",
  Marine: "TTSS",
}

/** RTA's `Touchpoint` — the operator the vehicle belongs to. */
export const COMPANIES = ["Kabi", "Arabia Taxi", "DTC", "National Taxi"]

export const LOCATIONS = [
  "Al Satwa",
  "Deira",
  "Bur Dubai",
  "Al Barsha",
  "Jumeirah",
  "Business Bay",
  "Al Quoz",
  "Dubai Marina",
  "Al Nahda",
  "Mirdif",
  "Dubai Silicon Oasis",
]

/**
 * The part of the city each location sits in.
 *
 * Shown beneath the name when an officer is picking one: half of these read
 * alike to anyone who does not know Dubai well, and the officer taking a
 * complaint at a counter is often working from a caller's rough description.
 */
export const LOCATION_DISTRICTS = {
  "Al Satwa": "Central Dubai",
  Deira: "Northern Dubai",
  "Bur Dubai": "Central Dubai",
  "Al Barsha": "Western Dubai",
  Jumeirah: "Coastal Strip",
  "Business Bay": "Central Dubai",
  "Al Quoz": "Industrial Belt",
  "Dubai Marina": "Coastal Strip",
  "Al Nahda": "Northern Dubai",
  Mirdif: "Eastern Dubai",
  "Dubai Silicon Oasis": "Outer Dubai",
}

/**
 * What cross-validation actually checks, named after the systems the deck
 * and process map call out rather than the generic signals we invented.
 */
export const AI_CHECKS = [
  "CRM case categorized and complete",
  "Trip found in operational records",
  "Vehicle and side number match",
  "Driver on shift at the reported time",
  "Permit valid at time of trip",
  "Lynx recording retrieved",
  "Recording covers the reported window",
  "Footage supports the allegation",
]

/** Tone assignments, so a badge's colour is decided in one place. */
export const PRIORITY_TONE = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
}

export const STAGE_TONE = {
  New: "primary",
  Assigned: "info",
  "Under Investigation": "high",
  Escalated: "critical",
  Returned: "medium",
  Closed: "low",
}

export const OUTCOME_TONE = {
  "Valid Complaint - Guilty": "critical",
  "Valid Complaint - Not Guilty": "neutral",
  "Invalid Complaint - No Event Exists": "low",
  "Face-to-Face Investigation Needed": "high",
  "Essential Information Missing": "high",
  "Potential Match Found": "info",
}

export const PENALTY_TONE = {
  "Verbal Warning": "medium",
  "Driver Fine": "critical",
  "Fine & Suspension": "critical",
  "Not guilty": "low",
  Termination: "critical",
}

export const VERDICT_TONE = {
  Confirmed: "critical",
  "False Positive": "low",
  Inconclusive: "high",
}

/** One statement per reason, so the wording matches what was reported. */
export const STATEMENTS = {
  "Verbal Assault": "shouted at and swore at the passenger without provocation",
  "Physical Assault": "got out of the vehicle and struck the complainant",
  "Verbal Harassment": "asked personal questions and would not let the subject drop",
  "Physical Harassment": "behaved towards the passenger in a way that made them unsafe",
  "Staff Conduct": "made offensive gestures at another road user after overtaking",
  "Reckless driving": "tailgated at speed and gave no safe stopping distance",
  "Extending Route To Increase Fare": "took a longer route than necessary and charged the higher fare",
  "Refusal of Pick-up": "refused the trip and blocked other taxis from taking it",
  "Lost Item Investigation": "was asked to return an item left in the vehicle",
}
