import { useSyncExternalStore } from "react"
import { roleById } from "@/data/personas"
import { resetArrivals } from "@/app/arrivals"
import { clearNotifications } from "@/app/notifications"

/**
 * Session state — who is signed in and which theme they chose. Kept in a tiny
 * external store rather than context so the top bar, the nav and the pages all
 * read the same value without a provider.
 *
 * Complaint state lives in `complaintStore.js`, not here: a ruling changes the
 * complaint, and keeping a second copy of that here would let the two drift.
 */

const KEY = "smc-complaints-session"

const initial = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* private mode, cleared storage — fall through to defaults */
  }
  return { roleId: null, theme: "light" }
}

let state = initial()
const listeners = new Set()

function set(patch) {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* non-fatal: the session just won't survive a reload */
  }
  listeners.forEach((l) => l())
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useSession() {
  return useSyncExternalStore(subscribe, () => state)
}

export const signIn = (roleId) => set({ roleId })
export function signOut() {
  // The next sign-in starts a fresh run of arrivals, not a continuation.
  resetArrivals()
  clearNotifications()
  set({ roleId: null })
}

export function toggleTheme() {
  const theme = state.theme === "dark" ? "light" : "dark"
  set({ theme })
  applyTheme(theme)
}

export function applyTheme(theme = state.theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function currentRole() {
  return state.roleId ? roleById(state.roleId) : null
}
