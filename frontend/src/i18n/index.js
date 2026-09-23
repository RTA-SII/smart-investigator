import { useSyncExternalStore } from "react"
import { shell } from "./ar/shell"
import { domain } from "./ar/domain"
import { pages } from "./ar/pages"
import { forms } from "./ar/forms"

/**
 * Translation by English string rather than by key.
 *
 * The English copy *is* the key, so anything not yet translated falls through
 * and renders in English instead of showing a missing-key placeholder. That
 * keeps a partial dictionary safe to ship — which matters here, because the
 * data itself (driver names, companies, free-text statements) stays in its
 * source language, as it does in every bilingual RTA system.
 */
const AR = { ...shell, ...domain, ...pages, ...forms }

const KEY = "smc-complaints-lang"
const listeners = new Set()

let lang = read()

function read() {
  try {
    return localStorage.getItem(KEY) === "ar" ? "ar" : "en"
  } catch {
    return "en"
  }
}

export function setLang(next) {
  lang = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* private mode — the choice just won't survive a reload */
  }
  applyLang()
  listeners.forEach((l) => l())
}

export const toggleLang = () => setLang(lang === "ar" ? "en" : "ar")

/** Drive `lang`/`dir` from the root so logical properties mirror the layout. */
export function applyLang() {
  const el = document.documentElement
  el.lang = lang
  el.dir = lang === "ar" ? "rtl" : "ltr"
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useLang() {
  return useSyncExternalStore(subscribe, () => lang)
}

/** `t("All Complaints")` — English in, localised out, English back if missing. */
export function useT() {
  const current = useLang()
  return (s) => (current === "ar" ? (AR[s] ?? s) : s)
}
