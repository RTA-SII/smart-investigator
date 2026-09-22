import { describe, expect, it } from "vitest"
import { clock, initials, longStamp, shortStamp, slaRemaining } from "./format"

describe("stamps", () => {
  it("renders the compact table stamp", () => {
    expect(shortStamp("2026-08-09T10:21:00")).toBe("09 Aug, 10:21")
  })

  it("renders the long detail stamp", () => {
    expect(longStamp("2026-07-06T11:15:00")).toBe("06 Jul 2026 · 11:15")
  })

  it("zero-pads single-digit days and times", () => {
    expect(shortStamp("2026-03-01T09:05:00")).toBe("01 Mar, 09:05")
  })
})

describe("slaRemaining", () => {
  const complaint = { receivedAt: "2026-09-18T11:00:00", slaMinutes: 5 }

  it("counts down from the target", () => {
    const now = new Date("2026-09-18T11:02:00").getTime()
    expect(slaRemaining(complaint, now)).toBe(3)
  })

  it("floors at zero once breached rather than going negative", () => {
    const now = new Date("2026-09-18T11:40:00").getTime()
    expect(slaRemaining(complaint, now)).toBe(0)
  })
})

describe("clock", () => {
  it("formats minutes as mm:ss", () => {
    expect(clock(4.2)).toBe("4:12")
  })

  it("pads seconds under ten", () => {
    expect(clock(0.75)).toBe("0:45")
  })

  it("never renders a negative clock", () => {
    expect(clock(-3)).toBe("0:00")
  })
})

describe("initials", () => {
  it("takes the first two words", () => {
    expect(initials("Layla Al-Hammadi")).toBe("LA")
  })

  it("copes with a single-word name", () => {
    expect(initials("Omar")).toBe("O")
  })
})
