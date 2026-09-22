import { describe, expect, it } from "vitest"
import {
  canSubmit,
  completeness,
  EMPTY_DRAFT,
  nextStep,
  nowLocal,
} from "./manualComplaint"

const filled = {
  ...EMPTY_DRAFT,
  receivedAt: "2026-09-18T15:40",
  channel: "Walk-in",
  complainantName: "Noura Al Falasi",
  complainantPhone: "+971 50 123 4567",
  incidentAt: "2026-09-18T14:05",
  location: "Deira",
  vehicleRef: "EB152",
  category: "Driver Behaviour",
  type: "Reckless Driving",
  priority: "High",
  statement: "The driver weaved between lanes for most of the trip.",
}

describe("completeness", () => {
  it("starts empty", () => {
    const c = completeness(EMPTY_DRAFT)
    expect(c).toMatchObject({ done: 0, total: 5 })
  })

  it("counts a fully filled draft", () => {
    expect(completeness(filled).done).toBe(5)
  })

  it("does not gate on the optional handling step", () => {
    // Assignment and attachments are optional; a complaint with neither is
    // still valid and must not be blocked.
    expect(canSubmit({ ...filled, assignee: "", attachments: [] })).toBe(true)
  })
})

describe("anonymous complaints", () => {
  it("are accepted without contact details", () => {
    const anon = {
      ...filled,
      anonymous: true,
      complainantName: "",
      complainantPhone: "",
    }
    expect(canSubmit(anon)).toBe(true)
  })

  it("still require contact details when a name is expected", () => {
    const named = { ...filled, complainantPhone: "" }
    expect(canSubmit(named)).toBe(false)
  })
})

describe("allegation gating", () => {
  it("rejects a statement too short to investigate", () => {
    expect(canSubmit({ ...filled, statement: "bad driver" })).toBe(false)
  })

  it("requires a priority", () => {
    expect(canSubmit({ ...filled, priority: "" })).toBe(false)
  })
})

describe("nextStep", () => {
  it("points at the first unmet step with its position", () => {
    expect(nextStep(EMPTY_DRAFT)).toMatchObject({ id: "intake", position: 1 })
  })

  it("skips past steps already satisfied", () => {
    const draft = { ...EMPTY_DRAFT, receivedAt: "2026-09-18T15:40", channel: "Email" }
    expect(nextStep(draft)).toMatchObject({ id: "complainant", position: 2 })
  })

  it("returns null once nothing is outstanding", () => {
    expect(nextStep(filled)).toBeNull()
  })
})

describe("nowLocal", () => {
  it("formats for a datetime-local input", () => {
    expect(nowLocal(new Date(2026, 8, 18, 9, 5))).toBe("2026-09-18T09:05")
  })
})
