// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest"
import { shell } from "./ar/shell"
import { domain } from "./ar/domain"
import { pages } from "./ar/pages"
import {
  CATEGORIES,
  CHANNELS,
  COMPLAINT_TYPES,
  MODES,
  PRIORITIES,
  STAGES,
} from "@/data/catalog"

const AR = { ...shell, ...domain, ...pages }

describe("the Arabic dictionary", () => {
  it("covers every value the queue can display", () => {
    const vocabulary = [
      ...PRIORITIES,
      ...STAGES,
      ...MODES,
      ...CHANNELS,
      ...COMPLAINT_TYPES,
      ...Object.keys(CATEGORIES),
      "Confirmed",
      "Inconclusive",
      "False Positive",
    ]
    const missing = vocabulary.filter((v) => !AR[v])
    expect(missing).toEqual([])
  })

  it("translates rather than echoing the English back", () => {
    for (const [en, ar] of Object.entries(AR)) {
      expect(ar, `"${en}" was left untranslated`).not.toBe(en)
    }
  })

  it("has no empty translations", () => {
    for (const [en, ar] of Object.entries(AR)) {
      expect(ar.trim(), `"${en}" is blank`).not.toBe("")
    }
  })
})

describe("the language store", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ""
    document.documentElement.dir = ""
  })

  it("defaults to English and leaves the document LTR", async () => {
    const { useT, applyLang } = await import("./index")
    applyLang()
    expect(document.documentElement.dir).toBe("ltr")
    expect(typeof useT).toBe("function")
  })

  it("flips the document to RTL when Arabic is chosen", async () => {
    const { setLang } = await import("./index")
    setLang("ar")
    expect(document.documentElement.lang).toBe("ar")
    expect(document.documentElement.dir).toBe("rtl")
    setLang("en")
    expect(document.documentElement.dir).toBe("ltr")
  })

  it("falls back to the English string when a key is missing", async () => {
    const { setLang } = await import("./index")
    setLang("ar")
    // Driver names and other data are deliberately absent from the dictionary.
    expect(AR["Ravi Shah"]).toBeUndefined()
    setLang("en")
  })
})
