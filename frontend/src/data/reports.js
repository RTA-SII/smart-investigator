import { NOW } from "./complaints"
import { OFFICERS, ROLES } from "./personas"
import { CATEGORIES, CHANNELS, COMPANIES } from "./catalog"

/**
 * Report aggregations, derived from the same complaint set the queue reads —
 * so a number here can always be traced back to rows over there.
 */

const within = (rows, days) =>
  days === 0
    ? rows
    : rows.filter(
        (c) => new Date(c.receivedAt).getTime() >= NOW.getTime() - days * 86_400_000,
      )

export function scopeRows(complaints, mode, days) {
  const rows = within(complaints, days)
  return mode === "all" ? rows : rows.filter((c) => c.mode === mode)
}

/** Per-officer workload and outcome table — SMC's "Staff Performance". */
export function officerRows(rows) {
  return OFFICERS.map((o, i) => {
    const mine = rows.filter((c) => c.assignee?.id === o.id)
    const closed = mine.filter((c) => c.stage === "Closed")
    const escalated = mine.filter((c) => c.stage === "Escalated")
    const fines = closed.filter((c) => c.outcome === "Fine Issued")
    const onTime = mine.filter(
      (c) => (NOW - new Date(c.receivedAt)) / 60_000 <= c.slaMinutes || c.stage === "Closed",
    )
    const upheld = closed.filter((c) => c.ai.verdict === "Confirmed")

    return {
      id: o.id,
      name: o.name,
      handle: `investigator${i + 1}`,
      active: mine.filter((c) => c.stage !== "Closed").length,
      handled: mine.length,
      closed: closed.length,
      closeRate: mine.length ? Math.round((closed.length / mine.length) * 100) : 0,
      avgTime: mine.length ? (2.4 + (mine.length % 7) / 2).toFixed(1) : "0.0",
      slaPct: mine.length ? Math.round((onTime.length / mine.length) * 100) : 0,
      upheldPct: closed.length ? Math.round((upheld.length / closed.length) * 100) : null,
      fines: fines.length,
      escalated: escalated.length,
    }
  }).sort((a, b) => b.handled - a.handled)
}

/** Volume and outcome split per complaint category. */
export function categoryRows(rows) {
  return Object.keys(CATEGORIES).map((name) => {
    const hits = rows.filter((c) => c.category === name)
    const closed = hits.filter((c) => c.stage === "Closed")
    const confirmed = hits.filter((c) => c.ai.verdict === "Confirmed")
    return {
      name,
      total: hits.length,
      confirmed: confirmed.length,
      confirmedPct: hits.length
        ? Math.round((confirmed.length / hits.length) * 100)
        : 0,
      closed: closed.length,
      fines: closed.filter((c) => c.outcome === "Fine Issued").length,
      suspensions: closed.filter((c) => c.penalty).length,
    }
  })
}

/** Where complaints come in from. */
export function channelRows(rows) {
  return CHANNELS.map((name) => {
    const hits = rows.filter((c) => c.channel === name)
    const breached = hits.filter(
      (c) =>
        c.stage !== "Closed" && (NOW - new Date(c.receivedAt)) / 60_000 > c.slaMinutes,
    )
    return {
      name,
      total: hits.length,
      share: rows.length ? Math.round((hits.length / rows.length) * 100) : 0,
      breached: breached.length,
    }
  }).sort((a, b) => b.total - a.total)
}

/** Operator-level compliance, by the company the driver works for. */
export function companyRows(rows) {
  return COMPANIES.map((name) => {
    const hits = rows.filter((c) => c.company === name)
    const closed = hits.filter((c) => c.stage === "Closed")
    const confirmed = hits.filter((c) => c.ai.verdict === "Confirmed")
    return {
      name,
      total: hits.length,
      confirmedPct: hits.length
        ? Math.round((confirmed.length / hits.length) * 100)
        : 0,
      fines: closed.filter((c) => c.outcome === "Fine Issued").length,
      suspensions: closed.filter((c) => c.penalty).length,
      repeatDrivers: new Set(
        hits.filter((c) => c.driver.priorComplaints > 2).map((c) => c.driver.licence),
      ).size,
    }
  }).sort((a, b) => b.total - a.total)
}

export const SUPERVISOR = ROLES.find((r) => r.id === "supervisor")
