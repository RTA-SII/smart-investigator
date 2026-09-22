const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/** "09 Aug, 10:21" — the compact stamp SMC uses in table cells. */
export function shortStamp(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${day} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`
}

/** "06 Jul 2026 · 11:15" — the long stamp used on detail pages. */
export function longStamp(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hh}:${mm}`
}

export function num(n) {
  return n.toLocaleString("en-US")
}

/** Minutes remaining against the 5-minute handling target, floored at zero. */
export function slaRemaining(complaint, now) {
  const elapsed = (now - new Date(complaint.receivedAt)) / 60000
  return Math.max(0, complaint.slaMinutes - elapsed)
}

/** "4:12" / "0:45" — mm:ss for the SLA countdown. */
export function clock(minutes) {
  const total = Math.max(0, Math.round(minutes * 60))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}
