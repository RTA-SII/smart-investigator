import { describe, expect, it } from "vitest"
import { COMPLAINTS } from "./complaints"
import { COMPLAINT_TYPES } from "./catalog"
import { frameFor, hasFrames } from "./evidenceFrames"

const name = (url) => String(url).split("/").pop().split("?")[0]

describe("evidence frames", () => {
  it("has imagery to deal out at all", () => {
    expect(hasFrames).toBe(true)
  })

  it("shows a reason its own imagery where some exists", () => {
    // The whole point of the types/ folder: a driver waving a fare away
    // belongs on a refusal, never on a harassment case.
    const withOwn = ["Reckless driving", "Refusal of Pick-up", "Staff Conduct"]

    for (const reason of withOwn) {
      const c = COMPLAINTS.find((x) => x.type === reason)
      const frames = c.evidence.filter((e) => e.frame).map((e) => name(e.frame))
      const slug = reason.toLowerCase().replace(/[^a-z0-9]+/g, "-")

      expect(frames.some((f) => f.startsWith(slug)), reason).toBe(true)
    }
  })

  it("never shows one reason's imagery on another", () => {
    const slugs = COMPLAINT_TYPES.map((t) => ({
      type: t,
      slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }))

    for (const c of COMPLAINTS) {
      const mine = slugs.find((s) => s.type === c.type).slug
      for (const e of c.evidence) {
        if (!e.frame) continue
        const others = slugs.filter((s) => s.slug !== mine && name(e.frame).startsWith(s.slug))
        expect(others.map((o) => o.type), `${c.id} · ${c.type}`).toEqual([])
      }
    }
  })

  it("is stable for a given complaint", () => {
    for (const label of ["In-cab camera still", "Forward road view", "Trip recording"]) {
      expect(frameFor(label, 7, "Reckless driving")).toBe(
        frameFor(label, 7, "Reckless driving"),
      )
    }
  })

  it("falls back to the generic pool for a reason with no imagery", () => {
    const frame = frameFor("In-cab camera still", 3, "Lost Item Investigation")
    expect(name(frame)).toMatch(/^incab-/)
  })

  it("gives the doc slot no frame", () => {
    expect(frameFor("CRM complaint transcript", 1, "Reckless driving")).toBeNull()
  })
})
