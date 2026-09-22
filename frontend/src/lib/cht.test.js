import { describe, expect, it } from "vitest"
import { chtState, isQueued } from "./cht"

const pulled = (secondsAgo, over = {}) => ({
  stage: "Under Investigation",
  slaMinutes: 5,
  pulledAt: new Date(Date.now() - secondsAgo * 1000).toISOString(),
  ...over,
})

describe("chtState", () => {
  const now = Date.now()

  it("counts down while the handling time is running", () => {
    const { phase, seconds } = chtState(pulled(60), now)
    expect(phase).toBe("running")
    expect(Math.round(seconds)).toBe(240)
  })

  it("breaches the moment the five minutes lapse — no grace", () => {
    expect(chtState(pulled(5 * 60 - 1), now).phase).toBe("running")
    expect(chtState(pulled(5 * 60 + 1), now).phase).toBe("breached")
  })

  it("treats a complaint nobody has pulled as queued, not late", () => {
    expect(chtState({ stage: "New", slaMinutes: 5 }, now).phase).toBe("queued")
  })

  it("stops the clock once the complaint is settled or escalated", () => {
    expect(chtState(pulled(9999, { stage: "Closed" }), now).phase).toBe("closed")
    expect(chtState(pulled(9999, { stage: "Escalated" }), now).phase).toBe("escalated")
  })
})

describe("isQueued", () => {
  it("is true only for unpulled, unassigned complaints", () => {
    expect(isQueued({ stage: "New", assignee: null })).toBe(true)
    expect(isQueued({ stage: "New", assignee: { id: "SMC-0318" } })).toBe(false)
    expect(isQueued({ stage: "Under Investigation", assignee: null })).toBe(false)
    expect(isQueued({ stage: "Closed", assignee: null })).toBe(false)
  })
})
