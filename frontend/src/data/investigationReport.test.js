import { describe, expect, it } from "vitest"
import { COMPLAINTS } from "./complaints"
import { buildReport } from "./investigationReport"
import { AI_CHECKS } from "./catalog"

const verified = COMPLAINTS.filter((c) => c.aiVerified)
const withCheck = (label, pass) =>
  verified.find((c) => c.ai.checks.find((k) => k.label === label)?.pass === pass)

describe("the investigation report", () => {
  it("accounts for every check the engine ran", () => {
    for (const c of verified.slice(0, 20)) {
      const r = buildReport(c)
      const labels = r.sources.flatMap((s) => s.items.map((i) => i.label))
      expect(labels.sort()).toEqual([...AI_CHECKS].sort())
      expect(r.passed + r.sources.flatMap((s) => s.items).filter((i) => !i.pass).length)
        .toBe(r.total)
    }
  })

  it("agrees with the verdict it is reporting on", () => {
    for (const c of verified.slice(0, 20)) {
      const decision = buildReport(c).decision[0].value
      if (c.ai.verdict === "Confirmed") expect(decision).toBe("Violation Confirmed")
      if (c.ai.verdict === "Inconclusive") expect(decision).toBe("Insufficient Evidence")
      if (c.ai.verdict === "False Positive") expect(decision).toBe("No Violation Found")
    }
  })

  it("stamps the complaint to the second, without a zone", () => {
    const r = buildReport(verified[0])
    expect(r.narrative).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./)
    expect(r.narrative).not.toMatch(/\.\d{3}Z/)
  })

  it("never claims a trip record it did not find", () => {
    // The check can still pass on the case record alone; what it must not do
    // is describe a trip record that was never retrieved.
    const c = withCheck("Trip found in operational records", false)
    const line = buildReport(c)
      .sources.flatMap((s) => s.items)
      .find((i) => i.label === "Vehicle and side number match")

    expect(line.detail).not.toContain("the vehicle on the trip record")
    expect(line.detail).toContain("no trip to confirm it against")
  })

  it("never rules on footage it never retrieved", () => {
    const c = withCheck("Lynx recording retrieved", false)
    const lines = buildReport(c)
      .sources.flatMap((s) => s.items)
      .filter((i) => i.label !== "Lynx recording retrieved")
      .filter((i) => i.label.includes("Recording") || i.label.includes("Footage"))

    for (const line of lines) expect(line.detail).toMatch(/No (recording|footage)/)
  })

  it("names no field the case does not carry", () => {
    // RTA's own cases have a plate and no side number, so the report has to
    // read correctly with one of the two missing.
    const rta = COMPLAINTS.filter((c) => c.source === "RTA" && c.aiVerified)
    expect(rta.length).toBeGreaterThan(0)

    for (const c of rta) {
      const r = buildReport(c)
      const prose = [r.narrative, r.coreReason, ...r.sources.flatMap((s) => s.items.map((i) => i.detail))]
      for (const line of prose) expect(line, c.id).not.toMatch(/null|undefined/)
    }
  })

  it("does not claim a clean sweep it did not get", () => {
    const c = verified.find(
      (x) => x.ai.verdict === "Confirmed" && x.ai.checks.some((k) => !k.pass),
    )
    expect(buildReport(c).coreReason).not.toContain("No consulted source contradicts")
  })

  it("leads the core reason with evidence, not with paperwork", () => {
    // A missing CRM field explains nothing about whether the event happened.
    const c = verified.find(
      (x) =>
        x.ai.verdict !== "Confirmed" &&
        !x.ai.checks.find((k) => k.label === "CRM case categorized and complete").pass &&
        x.ai.checks.some((k) => !k.pass && k.label.includes("Footage")),
    )

    expect(buildReport(c).coreReason).not.toMatch(/^.{0,80}Customer Happiness/)
  })
})
