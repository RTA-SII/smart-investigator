import { useNavigate } from "react-router-dom"
import { BellOff } from "lucide-react"
import { clearNotifications, useNotifications } from "@/app/notifications"
import { useT } from "@/i18n"
import { shortStamp } from "@/lib/format"

/**
 * What the bell drops down: everything that arrived this session, newest
 * first. Toasts expire; this does not, so nothing that arrived while the
 * officer was reading another complaint is lost.
 */
export function NotificationPanel({ onClose }) {
  const items = useNotifications()
  const navigate = useNavigate()
  const t = useT()

  return (
    <>
      <button
        type="button"
        aria-label={t("Close")}
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
      />
      <div className="glass-surface absolute top-11 end-0 z-20 w-80 rounded-2xl bg-[var(--popover)] p-3">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <p className="text-[9px] font-bold tracking-[0.9px] text-[var(--muted-foreground)] uppercase">
            {t("Notifications")}
          </p>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="text-[10px] font-semibold text-[var(--primary)] hover:underline"
            >
              {t("Clear all")}
            </button>
          )}
        </div>

        {items.length ? (
          <ul className="max-h-80 space-y-1 overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    navigate(`/complaints/${n.complaintId}`)
                  }}
                  className="w-full rounded-lg px-1 py-1.5 text-start transition-colors duration-150 hover:bg-white/40 dark:hover:bg-white/10"
                >
                  <p className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{t(n.title)}</span>
                    <span className="ltr-value shrink-0 text-[10px] text-[var(--muted-foreground)]">
                      {shortStamp(n.at)}
                    </span>
                  </p>
                  <p className="truncate text-[11px] text-[var(--muted-foreground)]">
                    <span className="ltr-value font-mono font-bold text-[var(--primary)]">
                      {n.complaintId}
                    </span>{" "}
                    · {t(n.body)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--muted-foreground)]">
            <BellOff className="size-4" />
            {t("Nothing new")}
          </p>
        )}
      </div>
    </>
  )
}
