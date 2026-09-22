import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BellRing, X } from "lucide-react"
import { hideToast, useNotifications } from "@/app/notifications"
import { useT } from "@/i18n"
import { shortStamp } from "@/lib/format"

/** How long a toast stays up before it retreats to the bell. */
const DWELL_MS = 12_000

const TONE = {
  critical: "var(--tone-critical)",
  info: "var(--primary)",
}

/**
 * Arrival toasts — the thing that makes the portal feel live.
 *
 * They stack above the bottom-end corner and retire to the bell on their own.
 * Not a modal and not a panel: nothing is blocked while one is up, and the
 * complaint is reachable from the bell long after the toast has gone.
 */
export function ArrivalToasts() {
  const items = useNotifications().filter((n) => n.visible).slice(0, 3)

  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-end gap-2 p-4">
      {items.map((n) => (
        <Toast key={n.id} item={n} />
      ))}
    </div>
  )
}

function Toast({ item }) {
  const navigate = useNavigate()
  const t = useT()
  const tone = TONE[item.tone] ?? TONE.info

  useEffect(() => {
    const out = setTimeout(() => hideToast(item.id), DWELL_MS)
    return () => clearTimeout(out)
  }, [item.id])

  return (
    <div
      role="status"
      /* Solid, not glass: `glass-surface` is translucent, so the table
         underneath was reading straight through the toast. */
      className="toast-in pointer-events-auto w-[330px] max-w-[92vw] rounded-2xl border-[1px] border-[rgb(0_0_0/0.08)] bg-[var(--popover)] p-3 shadow-[0_18px_44px_rgb(0_0_0/0.22)] dark:border-[rgb(255_255_255/0.1)]"
    >
      <div className="flex items-start gap-3">
        <span
          className="grid size-8 shrink-0 place-items-center rounded-lg"
          style={{
            color: tone,
            backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
          }}
        >
          <BellRing className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{t(item.title)}</p>
          <p className="truncate text-[11px] text-[var(--muted-foreground)]">
            {t(item.body)}
          </p>
          <p className="mt-1 flex items-center gap-2">
            <span className="ltr-value font-mono text-[11px] font-bold text-[var(--primary)]">
              {item.complaintId}
            </span>
            <span className="ltr-value text-[10px] text-[var(--muted-foreground)]">
              {shortStamp(item.at)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => hideToast(item.id)}
          aria-label={t("Dismiss")}
          className="grid size-6 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="mt-2.5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => hideToast(item.id)}
          className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
        >
          {t("Later")}
        </button>
        <button
          type="button"
          onClick={() => {
            hideToast(item.id)
            navigate(`/complaints/${item.complaintId}`)
          }}
          className="rounded-lg bg-[var(--primary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--primary-foreground)] transition-all duration-150 hover:brightness-110"
        >
          {t("Open complaint")}
        </button>
      </div>
    </div>
  )
}
