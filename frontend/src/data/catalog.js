/** Vocabulary the complaints dataset is drawn from. Kept apart from the
 *  generator so the filter bars can enumerate options without importing rows. */

export const CHANNELS = [
  "Call Centre",
  "Dubai Now App",
  "RTA Website",
  "Email",
  "Walk-in",
]

/**
 * The channels an officer types in by hand. Everything else arrives from CRM,
 * so these are what the Manual Complaints page is built from — the generator
 * and that page both read this, so they cannot drift apart.
 */
export const MANUAL_CHANNELS = ["Walk-in", "Call Centre"]

export const isManual = (c) =>
  c.source === "Manual" || MANUAL_CHANNELS.includes(c.channel)

export const CATEGORIES = {
  "Driver Behaviour": [
    "Reckless Driving",
    "Rude Behaviour",
    "Mobile Phone While Driving",
    "Unsafe Lane Change",
    "Smoking in Vehicle",
    "Aggressive Braking",
  ],
  Fare: ["Overcharging", "Meter Not Used", "Refused Card Payment"],
  Service: ["Refused Trip", "Route Deviation", "Vehicle Uncleanliness"],
}

export const COMPLAINT_TYPES = Object.values(CATEGORIES).flat()

export const PRIORITIES = ["Critical", "High", "Medium", "Low"]

export const STAGES = [
  "New",
  "Assigned",
  "Under Investigation",
  "Escalated",
  "Closed",
]

/** The four outcomes a decision can close a complaint with (POC scope §8).
 *  A fine may additionally carry a PENALTY. */
export const OUTCOMES = ["False Positive", "No Fine Required", "Fine Issued"]

/** Suspensions that can accompany a fine — driver, vehicle, or permit. */
export const PENALTIES = [
  "Driver Suspended",
  "Vehicle Suspended",
  "Permit Suspended",
]

/** The six modes RTA tracks complaints across (POC scope §1). */
export const MODES = [
  "Taxi",
  "Public Bus",
  "School Bus",
  "Limousine and e-Hail",
  "Hourly Rental",
  "Marine",
]

export const COMPANIES = [
  "Dubai Taxi",
  "National Taxi",
  "Hala",
  "Cars Taxi",
  "Arabia Taxi",
]

export const LOCATIONS = [
  "Al Barsha",
  "Deira",
  "Bur Dubai",
  "Business Bay",
  "Jumeirah",
  "Al Quoz",
  "Dubai Marina",
  "Al Nahda",
  "Mirdif",
  "Dubai Silicon Oasis",
]

/** The eight signals the AI cross-validates a complaint against. */
export const AI_CHECKS = [
  "GPS track matches trip",
  "Speed profile corroborates",
  "Harsh-braking events found",
  "In-cab camera supports claim",
  "Phone-use detection fired",
  "Trip record matches receipt",
  "Driver identity confirmed",
  "Permit valid at time of trip",
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
  Closed: "low",
}

export const OUTCOME_TONE = {
  "Fine Issued": "critical",
  "No Fine Required": "neutral",
  "False Positive": "low",
}

export const PENALTY_TONE = {
  "Driver Suspended": "critical",
  "Vehicle Suspended": "critical",
  "Permit Suspended": "critical",
}

export const VERDICT_TONE = {
  Confirmed: "critical",
  "False Positive": "low",
  Inconclusive: "high",
}

/** One statement per complaint type, so the wording matches what was reported. */
export const STATEMENTS = {
  "Reckless Driving": "drove well above the posted limit and weaved between lanes",
  "Rude Behaviour": "answered rudely and raised his voice when asked to slow down",
  "Mobile Phone While Driving": "held a mobile phone to his ear while the vehicle was moving",
  "Unsafe Lane Change": "changed lanes without indicating, cutting in front of another vehicle",
  "Smoking in Vehicle": "smoked inside the cabin for most of the trip despite being asked to stop",
  "Aggressive Braking": "braked hard several times without cause, throwing passengers forward",
  Overcharging: "charged well above the metered amount at the end of the trip",
  "Meter Not Used": "refused to start the meter and quoted a flat fare instead",
  "Refused Card Payment": "declined card payment and insisted on cash",
  "Refused Trip": "refused the trip on learning the destination",
  "Route Deviation": "took a noticeably longer route than necessary",
  "Vehicle Uncleanliness": "operated the vehicle in a visibly unclean condition",
}
