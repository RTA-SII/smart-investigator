import { describe, expect, it } from "vitest"
import { COMPLAINTS } from "@/data/complaints"
import { ROLES } from "@/data/personas"
import { actionBreakdown, caseloadFor, caseloadStats, pct } from "./kpis"
import { STAGES } from "@/data/catalog"

const officer = ROLES.find((r) => r.id === "officer")
const supervisor = ROLES.find((r) => r.id === "supervisor")

describe("caseloadStats", () => {
  it("splits a caseload into four parts that add up to it", () => {
    // The bug this guards: the strip counted every complaint that had ever
    // been escalated, so one escalated and later closed sat in two tiles and
    // the row came to more than the total printed beside it.
    for (const rows of [COMPLAINTS, caseloadFor(COMPLAINTS, officer), []]) {
      const k = caseloadStats(rows)
      expect(k.closed + k.returned + k.escalated + k.inProgress).toBe(k.total)
    }
  })

  it("puts every stage in exactly one part", () => {
    for (const stage of STAGES) {
      const k = caseloadStats([{ stage, receivedAt: new Date().toISOString(), slaMinutes: 5 }])
      const parts = [k.closed, k.returned, k.escalated, k.inProgress]

      expect(parts.filter(Boolean).length, stage).toBe(1)
    }
  })

  it("counts breaches across the open states rather than as a fifth part", () => {
    const k = caseloadStats(COMPLAINTS)

    // Not a slice: it may exceed any one of them, and can never exceed the
    // complaints that are still open.
    expect(k.breached).toBeLessThanOrEqual(k.total - k.closed)
  })

  it("averages handling over the complaints that carry a time", () => {
    const k = caseloadStats([
      { stage: "Closed", handlingMinutes: 2, receivedAt: "2026-09-18T07:00:00", slaMinutes: 5 },
      { stage: "Closed", handlingMinutes: 4, receivedAt: "2026-09-18T07:00:00", slaMinutes: 5 },
      { stage: "Assigned", receivedAt: "2026-09-18T07:00:00", slaMinutes: 5 },
    ])

    expect(k.avgHandling).toBe(3)
  })

  it("reports no average rather than zero when nothing is closed", () => {
    expect(caseloadStats([]).avgHandling).toBeNull()
  })
})

describe("caseloadFor", () => {
  it("gives an officer only their own complaints", () => {
    const mine = caseloadFor(COMPLAINTS, officer)

    expect(mine.length).toBeGreaterThan(0)
    expect(mine.every((c) => c.assignee?.id === officer.staff.code)).toBe(true)
  })

  it("gives a supervisor the whole team's", () => {
    const team = caseloadFor(COMPLAINTS, supervisor)

    expect(team.length).toBeGreaterThan(caseloadFor(COMPLAINTS, officer).length)
    expect(team.every((c) => c.assignee)).toBe(true)
  })
})

describe("actionBreakdown", () => {
  it("accounts for every closed complaint exactly once", () => {
    // A pie's slices have to be the whole of what it charts. This one used
    // to carry an extra "Other Penalty" slice counting every closed
    // complaint that had any penalty — all of them, since "Not guilty" is
    // itself an action — so it doubled the total and skewed every share.
    for (const rows of [COMPLAINTS, caseloadFor(COMPLAINTS, officer)]) {
      const closed = rows.filter((c) => c.stage === "Closed").length
      const slices = actionBreakdown(rows).reduce((a, d) => a + d.value, 0)

      expect(slices).toBe(closed)
    }
  })

  it("leaves out an action nobody took", () => {
    expect(actionBreakdown(COMPLAINTS).every((d) => d.value > 0)).toBe(true)
  })

  it("ignores complaints that are not closed", () => {
    expect(actionBreakdown([{ stage: "Assigned", penalty: "Driver Fine" }])).toEqual([])
  })
})

describe("pct", () => {
  it("is a whole percentage of the whole", () => {
    expect(pct(1, 4)).toBe(25)
  })

  it("does not divide by nothing", () => {
    expect(pct(3, 0)).toBe(0)
  })
})
