import { useMemo, useState } from "react"
import { Calendar, CheckCircle2, Clock, Layers, ShieldAlert, Timer, Undo2 } from "lucide-react"
import { PageHeader, SectionHeader } from "@/components/shell/PageHeader"
import { Segmented } from "@/components/ui/Segmented"
import { KpiTile } from "@/components/complaints/KpiTile"
import { MyProductivity } from "@/components/complaints/MyProductivity"
import {
  VolumeTrend,
  CategorySplit,
  SourceSplit,
  ModeSplit,
  ActionSplit,
} from "@/components/complaints/DashboardCharts"
import { NOW } from "@/data/complaints"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { num } from "@/lib/format"
import { caseloadStats, pct } from "@/lib/kpis"
import { useT } from "@/i18n"

const RANGES = [
  { value: 1, label: "Today" },
  { value: 7, label: "7 Days" },
  { value: 14, label: "14 Days" },
]

export function Dashboard() {
  const session = useSession()
  const role = roleById(session.roleId)
  const t = useT()
  const [days, setDays] = useState(7)
  const complaints = useComplaints()

  const officer = role.id !== "supervisor"

  // Three scopes, because the page answers three questions. My Productivity
  // above is the officer's own record; Period overview is the centre's total,
  // which is what gives their numbers a size to be read against; the charts
  // are their caseload again, broken down. Scoping the totals to the officer
  // as well only restated My Productivity in a second row.
  const inRange = useMemo(() => {
    const cutoff = NOW.getTime() - days * 86_400_000
    return complaints.filter((c) => new Date(c.receivedAt).getTime() >= cutoff)
  }, [complaints, days])

  // The window immediately before this one, same length — what the deltas on
  // the tiles are measured against.
  const previous = useMemo(() => {
    const end = NOW.getTime() - days * 86_400_000
    const start = end - days * 86_400_000
    return complaints.filter((c) => {
      const at = new Date(c.receivedAt).getTime()
      return at >= start && at < end
    })
  }, [complaints, days])

  const charted = useMemo(
    () =>
      officer
        ? inRange.filter((c) => c.assignee?.id === role.staff.code)
        : inRange,
    [inRange, officer, role.staff.code],
  )

  const k = useMemo(() => caseloadStats(inRange), [inRange])
  const was = useMemo(() => caseloadStats(previous), [previous])
  const rangeLabel = t(RANGES.find((r) => r.value === days).label).toLowerCase()

  return (
    <>
      <PageHeader
        title={t("Complaints Dashboard")}
        subtitle={`${t(role.title)} · ${t("Public complaints received from CRM, with AI cross-validation")}`}
      />

      {/* The signed-in person's own numbers come first — the centre-wide
          view below is context. For an officer that is their caseload; for a
          supervisor, the team's. */}
      <MyProductivity role={role} />

      <SectionHeader
        title={t("Period overview")}
        subtitle={`${t("Every complaint the centre received")} · ${t("last")} ${rangeLabel}${
          k.avgHandling == null ? "" : ` · ${k.avgHandling}m ${t("average handling")}`
        }`}
        actions={
          <Segmented
            options={RANGES.map((r) => ({
              ...r,
              label: t(r.label),
              icon: r.value === 1 ? <Calendar /> : undefined,
            }))}
            value={days}
            onChange={setDays}
          />
        }
      />

      <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiTile
          label={t("Total")}
          value={num(k.total)}
          {...delta(k.total, was.total)}
          caption={`${t("vs previous")} ${rangeLabel}`}
          meter={100}
          tone="var(--tone-info)"
          icon={Layers}
          hint="All complaints ingested from CRM in this range"
        />
        {/* No delta on this one. Every other tile compares volume against
            the window before it, which is like for like; returns are a state
            read today, and the earlier window holds only the ones that never
            came back. */}
        <KpiTile
          label={t("Returned")}
          value={num(k.returned)}
          caption={t("Sent back for missing detail")}
          meter={pct(k.returned, k.total)}
          tone="var(--tone-medium)"
          icon={Undo2}
          hint="Returned to Customer Happiness because an essential detail was missing"
        />
        <KpiTile
          label={t("Closed")}
          value={num(k.closed)}
          {...delta(k.closed, was.closed, { upIsGood: true })}
          caption={`${t("vs previous")} ${rangeLabel}`}
          meter={pct(k.closed, k.total)}
          tone="var(--tone-low)"
          icon={CheckCircle2}
          hint="Ruled on and filed"
        />
        <KpiTile
          label={t("Escalations")}
          value={num(k.escalated)}
          caption={t("Supervisor decision required")}
          meter={pct(k.escalated, k.total)}
          tone="var(--tone-high)"
          icon={ShieldAlert}
          hint="Officer flagged doubt and passed upward"
        />
        <KpiTile
          label={t("SLA Breached")}
          value={num(k.breached)}
          caption={t("Of everything still open")}
          meter={pct(k.breached, k.total - k.closed)}
          tone="var(--tone-critical)"
          icon={Timer}
          hint="Open complaints past the five-minute handling target. Spans the other three states rather than being one of them, so it does not add into the total."
        />
        {/* The fourth stage, without which the row does not add up: closed,
            escalated, returned and in progress are every complaint in the
            range exactly once. */}
        <KpiTile
          label={t("In Progress")}
          value={num(k.inProgress)}
          caption={t("With an officer now")}
          meter={pct(k.inProgress, k.total)}
          tone="var(--tone-info)"
          icon={Clock}
          hint="Assigned or under investigation — not yet ruled on, returned or escalated"
        />
      </div>

      <SectionHeader
        className="mt-6"
        title={officer ? t("Your complaints") : t("Complaint breakdown")}
        subtitle={`${
          officer
            ? t("Broken down across the complaints assigned to you")
            : t("Broken down across every complaint in range")
        } · ${t("last")} ${rangeLabel}`}
      />

      <div className="grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <VolumeTrend rows={charted} days={days} />
          <SourceSplit rows={charted} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <ModeSplit rows={charted} />
          <ActionSplit rows={charted} />
        </div>
        <CategorySplit rows={charted} />
      </div>
    </>
  )
}

function delta(now, before, { upIsGood = false } = {}) {
  if (!before) return {}
  const change = Math.round(((now - before) / before) * 100)
  if (!change) return {}
  const up = change > 0
  return {
    delta: `${up ? "+" : ""}${change}%`,
    deltaUp: up,
    deltaGood: up === upIsGood,
  }
}
