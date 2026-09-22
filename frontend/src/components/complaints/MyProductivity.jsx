import { useMemo } from "react"
import {
  CircleCheck,
  Clock,
  Inbox,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Meter } from "@/components/ui/Meter"
import { InfoTip } from "@/components/ui/InfoTip"
import { useComplaints } from "@/app/complaintStore"
import { initials } from "@/lib/format"
import { wasEscalated } from "@/lib/filters"
import { useT } from "@/i18n"

/**
 * The officer's own numbers — SMC's "My Productivity" strip.
 *
 * Everything here is about the person signed in, not the centre: what they
 * hold, what they have finished, and how long they take. It is derived from
 * the live store, so closing a complaint moves it while you watch.
 */
export function MyProductivity({ role, bare = false }) {
  const complaints = useComplaints()
  const t = useT()
  const code = role.staff.code

  const stats = useMemo(() => {
    const mine = complaints.filter((c) => c.assignee?.id === code)
    const closed = mine.filter((c) => c.stage === "Closed")
    const open = mine.filter((c) => c.stage !== "Closed")

    // Handling time is only knowable where we have both ends of the clock.
    const timed = closed.filter((c) => c.pulledAt && c.decision?.at)
    const avg = timed.length
      ? timed.reduce(
          (sum, c) =>
            sum + (new Date(c.decision.at) - new Date(c.pulledAt)) / 60_000,
          0,
        ) / timed.length
      : null

    return {
      assigned: mine.length,
      active: open.length,
      handled: closed.length,
      closeRate: mine.length ? Math.round((closed.length / mine.length) * 100) : 0,
      avg,
      escalated: mine.filter(wasEscalated).length,
      unactioned: open.length,
    }
  }, [complaints, code])

  const tiles = [
    {
      label: "Assigned to me",
      value: stats.assigned,
      caption: `${stats.active} ${t("still active")}`,
      meter: 100,
      tone: "var(--tone-info)",
      icon: Inbox,
      hint: t("Every complaint that has carried your name, open or closed."),
    },
    {
      label: "Handled",
      value: stats.handled,
      caption: t("Closed by you"),
      meter: pct(stats.handled, stats.assigned),
      tone: "var(--tone-low)",
      icon: CircleCheck,
      hint: t("Complaints you have ruled on and filed."),
    },
    {
      label: "Close rate",
      value: `${stats.closeRate}%`,
      caption: t("Of everything assigned"),
      meter: stats.closeRate,
      tone: "var(--tone-low)",
      icon: ShieldCheck,
      hint: t("Closed as a share of assigned. Escalated work is not yours to close."),
    },
    {
      label: "Avg handling time",
      value: stats.avg == null ? "—" : `${stats.avg.toFixed(1)}m`,
      caption: t("Target 5m"),
      meter: stats.avg == null ? 0 : Math.min(100, (stats.avg / 5) * 100),
      tone: "var(--tone-high)",
      icon: Clock,
      hint: t("Measured from the moment a complaint reached you to the moment you ruled. Shows — until you have closed one."),
    },
    {
      label: "Escalations",
      value: stats.escalated,
      caption: t("Passed to a supervisor"),
      meter: pct(stats.escalated, stats.assigned),
      tone: "#9B59B6",
      icon: TrendingUp,
      hint: t("Complaints of yours that went up for a supervisor ruling."),
    },
    {
      label: "Unactioned",
      value: stats.unactioned,
      caption: t("Still waiting on you"),
      meter: pct(stats.unactioned, stats.assigned),
      tone: "var(--tone-critical)",
      icon: TriangleAlert,
      hint: t("Open complaints on your name — the ones a clock is running on."),
    },
  ]

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <Tile key={tile.label} {...tile} label={t(tile.label)} />
      ))}
    </div>
  )

  if (bare) return grid

  return (
    <Card className="mb-5 p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--tone-low)] text-sm font-bold text-white">
          {initials(role.staff.name)}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-base font-bold">
            {t("My Productivity")}
            <InfoTip label={t("Your own numbers, not the centre's. They move as you work.")} />
          </p>
          <p className="ltr-value truncate text-[11px] text-[var(--muted-foreground)]">
            {role.staff.name} · {role.staff.code}
          </p>
        </div>
        <span className="ms-auto grid size-8 shrink-0 place-items-center rounded-lg text-[var(--muted-foreground)]">
          <SlidersHorizontal className="size-4" />
        </span>
      </div>
      {grid}
    </Card>
  )
}

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0)

function Tile({ label, value, caption, meter, tone, icon: Icon, hint }) {
  return (
    <Card glint surface="dash-tile" className="px-3 py-2.5">
      <div className="relative flex items-start justify-between gap-1.5">
        <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.5px] text-[var(--muted-foreground)] uppercase">
          {label}
        </p>
        <span className="flex shrink-0 items-center gap-1">
          {hint && <InfoTip label={hint} />}
          <Icon className="size-3.5 shrink-0" style={{ color: tone }} />
        </span>
      </div>
      <p className="relative mt-1.5 text-lg leading-tight font-bold">{value}</p>
      <p className="relative mt-0.5 truncate text-[9px] text-[var(--muted-foreground)]">
        {caption}
      </p>
      <Meter className="relative mt-2" value={meter} tone={tone} />
    </Card>
  )
}
