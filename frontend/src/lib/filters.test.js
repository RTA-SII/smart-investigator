import { describe, expect, it } from "vitest"
import { applyFilters, EMPTY_FILTERS, wasEscalated } from "./filters"

const ROW = {
  id: "CMP-041256",
  crmRef: "CRM-2026-248499",
  plate: "K41255",
  sideNumber: "EB788",
  mode: "Taxi",
  company: "Hala",
  priority: "Medium",
  stage: "New",
  channel: "E-mail",
  type: "Unsafe Lane Change",
  assignee: { id: "SMC-0318", name: "Layla Al-Hammadi" },
  driver: { name: "Ravi Shah" },
  complainant: { name: "Noura Al Falasi" },
  location: "Deira",
  timeline: [],
}

const rows = [
  ROW,
  {
    ...ROW,
    id: "CMP-041257",
    crmRef: "CRM-2026-990001",
    plate: "M70001",
    company: "Dubai Taxi",
    channel: "Phone",
    assignee: null,
  },
]

describe("applyFilters", () => {
  it("returns everything when no facet is set", () => {
    expect(applyFilters(rows, EMPTY_FILTERS)).toHaveLength(2)
  })

  it("narrows by an exact facet match", () => {
    const out = applyFilters(rows, { ...EMPTY_FILTERS, channel: ["E-mail"] })
    expect(out.map((r) => r.id)).toEqual(["CMP-041256"])
  })

  it("searches the fields an investigator would paste in", () => {
    // Fields unique to the first row pick out one; shared fields pick out both.
    for (const q of ["041256", "248499", "K41255"]) {
      expect(applyFilters(rows, { ...EMPTY_FILTERS, q }).map((r) => r.id)).toEqual([
        "CMP-041256",
      ])
    }
    for (const q of ["ravi", "noura", "deira", "EB788"]) {
      expect(applyFilters(rows, { ...EMPTY_FILTERS, q })).toHaveLength(2)
    }
  })

  it("is case-insensitive and ignores surrounding whitespace", () => {
    expect(applyFilters(rows, { ...EMPTY_FILTERS, q: "  RAVI  " })).toHaveLength(2)
  })

  it("offers exactly the facets the filter bar can set", () => {
    // A facet in the engine that no control sets is dead weight, and a
    // control with no facet behind it silently does nothing.
    expect(Object.keys(EMPTY_FILTERS).filter((k) => !k.startsWith("escalat"))).toEqual([
      "q",
      "type",
      "mode",
      "priority",
      "stage",
      "channel",
    ])
  })

  it("combines facets", () => {
    const out = applyFilters(rows, {
      ...EMPTY_FILTERS,
      channel: ["E-mail"],
      priority: ["High"],
    })
    expect(out).toHaveLength(0)
  })

  it("is multi-select — a facet widens as values are added", () => {
    const one = applyFilters(rows, { ...EMPTY_FILTERS, channel: ["E-mail"] })
    const both = applyFilters(rows, {
      ...EMPTY_FILTERS,
      channel: ["E-mail", "Phone"],
    })
    expect(one).toHaveLength(1)
    expect(both).toHaveLength(2)
  })
})

describe("the escalation facets", () => {
  const escalated = {
    ...ROW,
    id: "CMP-041300",
    stage: "Escalated",
    timeline: [{ action: "Escalate to Supervisor" }],
  }
  const closedAfterEscalation = {
    ...ROW,
    id: "CMP-041301",
    stage: "Closed",
    timeline: [{ action: "Escalate to Supervisor" }, { action: "Closed — Fine Issued" }],
  }
  const set = [ROW, escalated, closedAfterEscalation]

  it("knows a complaint was escalated even after it was ruled on", () => {
    expect(wasEscalated(escalated)).toBe(true)
    expect(wasEscalated(closedAfterEscalation)).toBe(true)
    expect(wasEscalated(ROW)).toBe(false)
  })

  it("stays off until one of them is set", () => {
    expect(applyFilters(set, EMPTY_FILTERS)).toHaveLength(3)
  })

  it("drops anything that was never escalated once one is set", () => {
    const out = applyFilters(set, {
      ...EMPTY_FILTERS,
      escalatedByRole: ["Investigation Officer"],
    })
    expect(out.map((r) => r.id)).not.toContain(ROW.id)
    expect(out).toHaveLength(2)
  })

  it("separates a referral still open from one already ruled on", () => {
    const open = applyFilters(set, {
      ...EMPTY_FILTERS,
      escalationOutcome: ["Escalated and not closed"],
    })
    const done = applyFilters(set, {
      ...EMPTY_FILTERS,
      escalationOutcome: ["Escalated and closed"],
    })
    expect(open.map((r) => r.id)).toEqual([escalated.id])
    expect(done.map((r) => r.id)).toEqual([closedAfterEscalation.id])
  })
})
