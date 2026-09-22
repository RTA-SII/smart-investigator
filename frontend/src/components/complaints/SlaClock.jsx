import { useEffect, useState } from "react"
import { Timer } from "lucide-react"
import { NOW } from "@/data/complaints"
import { chtState } from "@/lib/cht"
import { clock, slaRemaining } from "@/lib/format"
import { useT } from "@/i18n"
import { cn } from "@/lib/cn"

/**
 * The Complaint Handling Time, counting down live.
 *
 * A pulled complaint runs against real time from the pull. Seeded rows were
 * never pulled, so they fall back to the demo clock — that is what fills the
 * queue with believably aged work at the start of a session.
 */
export function SlaClock({ complaint, size = "sm" }) {
  const t = useT()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [])

  const { phase, seconds } = chtState(complaint, now)
  const view = phase === "queued" ? seeded(complaint, t) : live(phase, seconds, t)

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap tabular-nums",
        size === "lg"
          ? "px-3 py-1.5 text-sm leading-none"
          : "px-2.5 py-1 text-[11px] leading-none",
      )}
      style={{
        color: view.tone,
        backgroundColor: `color-mix(in oklab, ${view.tone} 15%, transparent)`,
        border: `1px solid color-mix(in oklab, ${view.tone} 25%, transparent)`,
      }}
    >
      <Timer className={size === "lg" ? "size-4" : "size-3"} />
      {view.text}
    </span>
  )
}

/** A complaint an officer is actually holding. */
function live(phase, seconds, t) {
  if (phase === "closed") return { text: t("Closed"), tone: "var(--tone-neutral)" }
  if (phase === "escalated")
    return { text: t("Escalated"), tone: "var(--tone-high)" }
  if (phase === "breached")
    return { text: t("Breached"), tone: "var(--tone-critical)" }

  const minutes = seconds / 60
  return {
    text: clock(minutes),
    tone: minutes < 2 ? "var(--tone-high)" : "var(--tone-low)",
  }
}

/** Seeded backlog, measured against the demo clock. */
function seeded(complaint, t) {
  if (complaint.stage === "Closed")
    return { text: t("Closed"), tone: "var(--tone-neutral)" }

  const left = slaRemaining(complaint, NOW.getTime())
  if (left <= 0) return { text: t("In queue"), tone: "var(--tone-info)" }
  return {
    text: clock(left),
    tone: left < 2 ? "var(--tone-high)" : "var(--tone-low)",
  }
}
