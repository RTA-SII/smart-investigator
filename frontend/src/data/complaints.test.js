import { describe, expect, it } from "vitest"
import { COMPLAINTS, complaintById, NOW } from "./complaints"
import { OUTCOMES, PRIORITIES, STAGES } from "./catalog"
import { isQueued, OFF_DESK } from "@/lib/cht"
import { wasEscalated } from "@/lib/filters"
import { isManual } from "./catalog"
import { ROLES } from "./personas"

describe("the complaint dataset", () => {
  it("is deterministic across imports", () => {
    expect(COMPLAINTS[0].id).toBe(COMPLAINTS[0].id)
    // RTA's 9 reference cases, plus the generated backdrop.
    expect(COMPLAINTS).toHaveLength(9 + 96)
  })

  it("carries RTA's own cases alongside the generated ones", () => {
    const rta = COMPLAINTS.filter((c) => c.source === "RTA")
    expect(rta).toHaveLength(9)
    expect(rta.every((c) => c.id.startsWith("RTA-"))).toBe(true)
    // Their value is the filled investigation form, in RTA's own words.
    expect(rta.every((c) => c.form?.investigatorStatement)).toBe(true)
  })

  it("has unique ids", () => {
    expect(new Set(COMPLAINTS.map((c) => c.id)).size).toBe(COMPLAINTS.length)
  })

  it("is sorted newest first", () => {
    const times = COMPLAINTS.map((c) => new Date(c.receivedAt).getTime())
    expect([...times].sort((a, b) => b - a)).toEqual(times)
  })

  it("never dates a complaint into the future", () => {
    for (const c of COMPLAINTS) {
      expect(new Date(c.receivedAt).getTime()).toBeLessThanOrEqual(NOW.getTime())
    }
  })

  it("draws every enum value from the catalog", () => {
    for (const c of COMPLAINTS) {
      expect(PRIORITIES).toContain(c.priority)
      expect(STAGES).toContain(c.stage)
      if (c.outcome) expect(OUTCOMES).toContain(c.outcome)
    }
  })

  it("records a finding on every case that has one, and no other", () => {
    // A finding is not the same thing as a closure: a case returned to
    // Customer Happiness carries "Essential Information Missing" while it is
    // very much still alive. Work not yet ruled on carries nothing.
    const settled = ["Closed", "Returned"]

    for (const c of COMPLAINTS) {
      if (settled.includes(c.stage)) expect(c.outcome, c.id).toBeTruthy()
      else expect(c.outcome, c.id).toBeNull()
    }
  })

  it("returns cases only because an essential detail is missing", () => {
    const returned = COMPLAINTS.filter((c) => c.stage === "Returned")

    expect(returned.length).toBeGreaterThan(0)
    for (const c of returned) {
      expect(c.outcome, c.id).toBe("Essential Information Missing")
      // The gate and the stage cannot disagree — it was returned *because*
      // the case could not be worked.
      expect(c.incomplete, c.id).toBe(true)
    }
  })

  it("assigns an officer to everything past the New stage", () => {
    for (const c of COMPLAINTS) {
      if (c.stage === "New") expect(c.assignee).toBeNull()
      else expect(c.assignee?.id).toBeTruthy()
    }
  })

  it("states the complaint type inside its own narrative", () => {
    // Generated rows only: RTA's cases carry the caller's actual words, which
    // name the conduct without naming the reason code.
    for (const c of COMPLAINTS.filter((c) => c.source !== "RTA")) {
      expect(c.narrative).toContain(c.type)
    }
  })

  it("gives every complaint a full cross-validation result", () => {
    for (const c of COMPLAINTS) {
      expect(c.ai.checks).toHaveLength(8)
      expect(c.ai.confidence).toBeGreaterThanOrEqual(48)
      expect(c.ai.confidence).toBeLessThanOrEqual(100)
      expect(c.ai.recommendation).toBeTruthy()
    }
  })

  it("leans confirmed when the checks mostly pass", () => {
    const sub = COMPLAINTS.filter((c) => c.ai.verdict === "Confirmed")
    const passRate =
      sub.reduce((a, c) => a + c.ai.checks.filter((k) => k.pass).length, 0) /
      (sub.length * 8)
    expect(passRate).toBeGreaterThan(0.6)
  })

  it("opens every audit trail with the CRM handover", () => {
    for (const c of COMPLAINTS) {
      expect(c.timeline[0].actor).toBe("CRM Gateway")
      expect(c.timeline[0].note).toContain(c.crmRef)
    }
  })
})

describe("complaintById", () => {
  it("finds a known complaint", () => {
    const first = COMPLAINTS[0]
    expect(complaintById(first.id)).toBe(first)
  })

  it("returns undefined for an unknown id", () => {
    expect(complaintById("CMP-000000")).toBeUndefined()
  })
})

describe("the vocabulary stays inside the action set", () => {
  it("justifies its recommendation rather than naming one", () => {
    // SMC writes a short rationale here, not a label, so the check is that
    // it reads as prose — a one-word recommendation is the regression.
    for (const c of COMPLAINTS) {
      expect(c.ai.recommendation.length).toBeGreaterThan(80)
      expect(c.ai.recommendation.trim()).toMatch(/\.$/)
    }
  })

  it("never recommends an action the officer does not have", () => {
    // The retired vocabulary is what to guard against: these were invented
    // before RTA's decision model replaced them.
    const retired = [
      "Dismiss Complaint",
      "Request Additional Evidence",
      "Substantiate",
      "No Fine Required",
      "Issue Fine",
    ]
    for (const c of COMPLAINTS) {
      for (const word of retired) {
        expect(c.ai.recommendation, c.id).not.toContain(word)
      }
    }
  })

  it("uses only the three current verdicts", () => {
    const verdicts = new Set(["Confirmed", "Inconclusive", "False Positive"])
    for (const c of COMPLAINTS) expect(verdicts.has(c.ai.verdict)).toBe(true)
  })
})

describe("manually logged complaints", () => {
  const manual = COMPLAINTS.filter(isManual)

  it("records who typed each one in", () => {
    expect(manual.length).toBeGreaterThan(0)
    expect(manual.every((c) => c.loggedBy?.id)).toBe(true)
  })

  it("leaves CRM complaints without a logger", () => {
    const fromCrm = COMPLAINTS.filter((c) => !isManual(c))
    expect(fromCrm.every((c) => c.loggedBy === null)).toBe(true)
  })

  it("gives the signed-in officer some of their own to see", () => {
    const mine = manual.filter((c) => c.loggedBy.id === ROLES[0].staff.code)
    expect(mine.length).toBeGreaterThan(0)
  })

  it("gives the officer a closed one to look at, not only open work", () => {
    const mine = manual.filter((c) => c.loggedBy.id === ROLES[0].staff.code)
    expect(mine.filter((c) => c.stage === "Closed").length).toBeGreaterThan(0)
  })

  it("keeps logging separate from assignment", () => {
    // The signed-in officer both logs complaints and owns them, so the two
    // fields have to be able to disagree on the same row.
    const code = ROLES[0].staff.code
    expect(
      COMPLAINTS.some((c) => c.assignee?.id === code && c.loggedBy?.id !== code),
    ).toBe(true)
  })

  it("hands the signed-in officer a history but never live work", () => {
    // Signing in onto a blank page reads as a broken demo, so their settled
    // work is seeded. Work still theirs to act on is not: the desk has to be
    // clear or the first arrival never fires.
    const code = ROLES[0].staff.code
    const mine = COMPLAINTS.filter((c) => c.assignee?.id === code)

    expect(mine.length).toBeGreaterThan(3)
    expect(mine.every((c) => OFF_DESK.includes(c.stage))).toBe(true)
    expect(mine.some((c) => c.stage === "Closed")).toBe(true)
  })
})

describe("the escalation history", () => {
  it("has complaints that went up and were then ruled on", () => {
    const closedAfterEscalation = COMPLAINTS.filter(
      (c) => c.stage === "Closed" && wasEscalated(c),
    )
    expect(closedAfterEscalation.length).toBeGreaterThan(0)
  })

  it("keeps the trail after the stage moves on", () => {
    // Stage says Closed; only the audit trail still knows it was escalated.
    for (const c of COMPLAINTS.filter((c) => c.stage === "Closed" && wasEscalated(c))) {
      expect(c.timeline.some((e) => /escalat/i.test(e.action))).toBe(true)
    }
  })
})

describe("cross-validation is not run until somebody asks", () => {
  it("leaves an untouched complaint unverified", () => {
    const untouched = COMPLAINTS.filter((c) => c.stage === "New")
    expect(untouched.every((c) => c.aiVerified === false)).toBe(true)
  })

  it("keeps the engine out of the audit trail until it has run", () => {
    const entry = (c) =>
      c.timeline.some((e) => e.action === "AI cross-validation completed")
    for (const c of COMPLAINTS) expect(entry(c)).toBe(c.aiVerified)
  })

  it("still carries the verdict, ready for when it is asked for", () => {
    expect(COMPLAINTS.every((c) => c.ai?.verdict)).toBe(true)
  })
})

describe("the Main Queue starts empty", () => {
  it("has nothing seeded waiting to be pulled", () => {
    expect(COMPLAINTS.filter(isQueued)).toHaveLength(0)
  })

  it("puts every seeded complaint on an officer", () => {
    expect(COMPLAINTS.every((c) => c.assignee)).toBe(true)
  })
})
