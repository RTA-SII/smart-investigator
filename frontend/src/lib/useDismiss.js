import { useEffect } from "react"

/**
 * Close a popover when the pointer goes down outside it.
 *
 * The alternative — a full-screen overlay that swallows the click — means
 * moving from one dropdown to the next takes two clicks: one to dismiss, one
 * to open. On a form with six of them that is worth avoiding.
 *
 * `mousedown` rather than `click`, so the popover is gone before the element
 * underneath acts on the press.
 */
export function useDismiss(ref, open, onDismiss) {
  useEffect(() => {
    if (!open) return

    const away = (e) => {
      if (!ref.current?.contains(e.target)) onDismiss()
    }
    const escape = (e) => {
      if (e.key === "Escape") onDismiss()
    }

    document.addEventListener("mousedown", away)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("mousedown", away)
      document.removeEventListener("keydown", escape)
    }
  }, [ref, open, onDismiss])
}
