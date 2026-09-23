import { isOpenFor } from "@/lib/cht"

/**
 * The module's two roles. SMC's own role picker shows an English name, an
 * Arabic gloss, a one-line scope and a staff card — mirrored here.
 */
export const ROLES = [
  {
    id: "officer",
    title: "Investigation Officer",
    arabic: "ضابط التحقيق",
    scope: "Investigates assigned complaints",
    icon: "search",
    tone: "primary",
    staff: { name: "Layla Al-Hammadi", code: "SMC-0318", handle: "investigator1" },
  },
  {
    id: "supervisor",
    title: "Supervisor",
    arabic: "مشرف",
    scope: "Monitors the queue, rules on escalations",
    icon: "shield",
    tone: "amber",
    staff: { name: "Omar Bin Haider", code: "SMC-0204", handle: "supervisor1" },
  },
]

export function roleById(id) {
  return ROLES.find((r) => r.id === id) ?? ROLES[0]
}

/** Officers a supervisor can assign work to. */
export const OFFICERS = [
  { id: "SMC-0318", name: "Layla Al-Hammadi" },
  { id: "SMC-0322", name: "Rashid Al-Nuaimi" },
  { id: "SMC-0339", name: "Hessa Al-Marzooqi" },
  { id: "SMC-0341", name: "Yousef Al-Balushi" },
]

/**
 * Who the seeded *open* backlog is spread across.
 *
 * The signed-in officer starts with an empty desk — their first complaint is
 * the one that arrives after they log in — so nothing still open carries
 * their name. Closed work is drawn from the full `OFFICERS` list instead:
 * signing in onto a blank page reads as a broken demo, and their own history
 * is what My Complaints should open on.
 */
export const SEED_OFFICERS = OFFICERS.filter((o) => o.id !== ROLES[0].staff.code)

/**
 * Everyone a complaint can be assigned to, as SMC's own assignment popover
 * lists them: inspectors and supervisors together, each with a badge number,
 * a department and a live workload.
 */
export const OPERATORS = [
  { id: "SMC-0318", name: "Layla Al-Hammadi", role: "Investigation Officer", department: "Taxi Monitoring", tint: "#f59e0b" },
  { id: "SMC-0322", name: "Rashid Al-Nuaimi", role: "Investigation Officer", department: "Taxi Monitoring", tint: "#009CDE" },
  { id: "SMC-0339", name: "Hessa Al-Marzooqi", role: "Investigation Officer", department: "Public Transport", tint: "#009a44" },
  { id: "SMC-0341", name: "Yousef Al-Balushi", role: "Investigation Officer", department: "Marine and Limousine", tint: "#9B59B6" },
  { id: "SMC-0204", name: "Omar Bin Haider", role: "Supervisor", department: "Operations", tint: "#FF8200" },
  { id: "SMC-0209", name: "Noura Al Kaabi", role: "Supervisor", department: "Enforcement", tint: "#0ea5e9" },
]

export const DEPARTMENTS = [...new Set(OPERATORS.map((o) => o.department))]

/**
 * How busy somebody is, in three bands.
 *
 * SMC filters its picker by these and flags the lightest as the best fit, so
 * a supervisor assigning work can see at a glance who can take it.
 */
export const LOAD_BANDS = [
  { id: "light", label: "Light", tone: "#009a44", max: 3 },
  { id: "medium", label: "Medium", tone: "#FF8200", max: 7 },
  { id: "heavy", label: "Heavy", tone: "var(--destructive)", max: Infinity },
]

export const bandFor = (load) => LOAD_BANDS.find((b) => load <= b.max)

/** The operator list with each one's live open-work count. */
export function operatorLoads(complaints) {
  return OPERATORS.map((o) => {
    const load = complaints.filter((c) => isOpenFor(c, o.id)).length
    return { ...o, load, band: bandFor(load) }
  })
}

/** Open complaints per officer, derived so every caller sees one number. */
export function officerLoads(complaints) {
  return OFFICERS.map((o) => ({
    ...o,
    load: complaints.filter((c) => isOpenFor(c, o.id)).length,
  }))
}
