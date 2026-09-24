import { describe, expect, it } from "vitest"
import { COMPLAINTS } from "./complaints"
import { CASE_EVIDENCE, caseEvidence } from "./caseEvidence"

const [CASE_ID] = Object.keys(CASE_EVIDENCE)

describe("real case evidence", () => {
  it("is attached to a case that exists", () => {
    expect(COMPLAINTS.find((c) => c.id === CASE_ID)).toBeTruthy()
  })

  it("reaches that complaint with a playable recording", () => {
    const c = COMPLAINTS.find((x) => x.id === CASE_ID)
    const video = c.evidence.find((e) => e.kind === "video")

    expect(video.src).toBeTruthy()
    expect(video.type).toBe("video/webm")
    expect(c.evidence.filter((e) => e.kind === "image").every((e) => e.frame)).toBe(true)
  })

  it("stamps the media with the complaint's own time", () => {
    const c = COMPLAINTS.find((x) => x.id === CASE_ID)
    expect(c.evidence.every((e) => e.time === c.receivedAt)).toBe(true)
  })

  it("does not leak onto any other complaint", () => {
    // The files sit in a subfolder so the shared pool's one-level glob cannot
    // see them. If that ever changes, every complaint gets this footage.
    const others = COMPLAINTS.filter((c) => c.id !== CASE_ID)
    expect(others.length).toBeGreaterThan(50)
    expect(others.some((c) => c.evidence.some((e) => e.src))).toBe(false)
  })

  it("does not report the recording as unretrievable", () => {
    // The panel and the investigation report read the same checks. A case
    // whose footage plays on screen cannot say Lynx holds nothing for it.
    const c = COMPLAINTS.find((x) => x.id === CASE_ID)
    const lynx = c.ai.checks.find((k) => k.label === "Lynx recording retrieved")

    expect(lynx.pass).toBe(true)
  })

  it("returns nothing for a case with no media of its own", () => {
    expect(caseEvidence("CMP-000000", "2026-09-18T07:00:00.000Z")).toBeNull()
  })
})
