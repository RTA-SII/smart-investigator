import { useSyncExternalStore } from "react"

/**
 * In-session notifications.
 *
 * Deliberately NOT persisted: a notification is a thing that just happened.
 * Replaying yesterday's on the next sign-in would be noise, and the complaint
 * itself is already in the store — that is the durable record.
 *
 * Same `useSyncExternalStore` shape as the session, i18n and complaint stores.
 */

/** How many a viewer keeps before the oldest falls off the bell. */
const LIMIT = 20

let items = []
const listeners = new Set()

function commit(next) {
  items = next
  listeners.forEach((l) => l())
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, () => items)
}

export const allNotifications = () => items

export const unreadCount = () => items.filter((n) => !n.read).length

let seq = 0

/** Raise one. Newest first, so the bell and the toast stack agree. */
export function notify({ title, body, complaintId, tone = "info", at }) {
  const item = {
    id: `ntf-${++seq}`,
    // Callers on the demo clock pass their own `at`; without it a toast would
    // read the wall clock while the complaint beside it reads 18 September.
    at: at ?? new Date().toISOString(),
    title,
    body,
    complaintId,
    tone,
    read: false,
    // Toasts show only while this is true; the bell keeps the item either way.
    visible: true,
  }
  commit([item, ...items].slice(0, LIMIT))
  return item.id
}

/** Hide the toast but keep the entry on the bell. */
export const hideToast = (id) =>
  commit(items.map((n) => (n.id === id ? { ...n, visible: false } : n)))

export const markAllRead = () =>
  commit(items.map((n) => ({ ...n, read: true })))

export const clearNotifications = () => commit([])
