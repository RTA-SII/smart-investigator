import { describe, expect, it } from "vitest"
import { MODES } from "@/data/catalog"
import { MODE_ICON, MODE_TONE, modeIcon } from "./modeIcons"

/**
 * The drift this guards against was real: three views kept their own copy of
 * the map keyed on `Limousine`, a value no complaint has ever carried, so
 * three of the six modes silently fell through to the default car.
 */
describe("mode icons", () => {
  it("covers every mode the catalog defines", () => {
    for (const mode of MODES) {
      expect(MODE_ICON[mode], mode).toBeTruthy()
      expect(MODE_TONE[mode], mode).toBeTruthy()
    }
  })

  it("names no mode the catalog does not", () => {
    expect(Object.keys(MODE_ICON).sort()).toEqual([...MODES].sort())
    expect(Object.keys(MODE_TONE).sort()).toEqual([...MODES].sort())
  })

  it("gives each mode its own icon rather than the fallback", () => {
    const icons = MODES.map((m) => modeIcon(m))
    expect(new Set(icons).size).toBe(MODES.length)
  })

  it("falls back for a mode it does not know", () => {
    expect(modeIcon("Hyperloop")).toBe(MODE_ICON.Rental)
  })
})
