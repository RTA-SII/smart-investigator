import { useMemo, useState } from "react"
import { Calendar, CheckCircle2, Clock, Inbox, Layers, ShieldAlert, Timer } from "lucide-react"
import { PageHeader, SectionHeader } from "@/components/shell/PageHeader"
import { Segmented } from "@/components/ui/Segmented"
import { KpiTile } from "@/components/complaints/KpiTile"
import { MyProductivity } from "@/components/complaints/MyProductivity"
import {
  VolumeTrend,
  CategorySplit,
  VerdictBreakdown,
  ModeSplit,
  ActionSplit,
} from "@/components/complaints/DashboardCharts"
import { NOW } from "@/data/complaints"
import { useComplaints } from "@/app/complaintStore"
import { roleById } from "@/data/personas"
import { useSession } from "@/app/session"
import { num } from "@/lib/format"
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

  const rows = useMemo(() => {
    const cutoff = NOW.getTime() - days * 86_400_000
    return complaints.filter((c) => new Date(c.receivedAt).getTime() >= cutoff)
  }, [complaints, days])

  const k = useMemo(() => stats(rows), [rows])
  const rangeLabel = t(RANGES.find((r) => r.value === days).label).toLowerCase()

  return (
    <>
      <PageHeader
        title={t("Complaints Dashboard")}
        subtitle={`${t(role.title)} · ${t("Public complaints received from CRM, with AI cross-validation")}`}
      />

      {/* An officer's own numbers come first — the centre-wide view below is
          context, but their queue is the job. */}
      {role.id !== "supervisor" && <MyProductivity role={role} />}

      <SectionHeader
        title={t("Period overview")}
        subtitle={`${t("KPIs and charts for the selected time range")} · ${t("last")} ${rangeLabel}`}
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
          delta="+18%"
          deltaUp
          caption={`${t("vs previous")} ${rangeLabel}`}
          meter={100}
          tone="var(--tone-info)"
          icon={Layers}
          hint="All complaints ingested from CRM in this range"
        />
        <KpiTile
          label={t("Open")}
          value={num(k.open)}
          delta="+24%"
          deltaUp
          caption={`${t("vs previous")} ${rangeLabel}`}
          meter={pct(k.open, k.total)}
          tone="var(--tone-critical)"
          icon={Inbox}
          hint="Not yet closed"
        />
        <KpiTile
          label={t("Closed")}
          value={num(k.closed)}
          delta="+11%"
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
          caption={t("Past the 5-minute target")}
          meter={pct(k.breached, k.total)}
          tone="var(--tone-critical)"
          icon={Timer}
          hint="Every complaint carries a 5-minute handling target"
        />
        <KpiTile
          label={t("Avg Handling")}
          value={`${k.avgHandle}m`}
          caption={`${t("Last")} ${rangeLabel} · ${t("target 5m")}`}
          meter={Math.min(100, (k.avgHandle / 5) * 100)}
          tone={k.avgHandle <= 5 ? "var(--tone-low)" : "var(--tone-high)"}
          icon={Clock}
          hint="Receipt to decision"
        />
      </div>

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <VolumeTrend rows={rows} days={days} />
          <VerdictBreakdown rows={rows} />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <ModeSplit rows={rows} />
          <ActionSplit rows={rows} />
        </div>
        <CategorySplit rows={rows} />
      </div>
    </>
  )
}

function pct(part, whole) {
  return whole ? Math.round((part / whole) * 100) : 0
}

function stats(rows) {
  const total = rows.length
  const closed = rows.filter((c) => c.stage === "Closed").length
  const escalated = rows.filter((c) => c.stage === "Escalated").length
  const open = total - closed
  // A complaint breaches if it is still open past its five-minute target.
  const breached = rows.filter(
    (c) =>
      c.stage !== "Closed" &&
      (NOW - new Date(c.receivedAt)) / 60_000 > c.slaMinutes,
  ).length

  // Closed complaints carry a synthetic handling time derived from their age
  // bucket; the demo's point is the ratio against the 5-minute target.
  const handled = rows.filter((c) => c.stage === "Closed")
  const avgHandle = handled.length
    ? (
        handled.reduce((a, c) => a + 2.4 + (c.ai.confidence % 40) / 10, 0) /
        handled.length
      ).toFixed(1)
    : "0.0"

  return { total, closed, open, escalated, breached, avgHandle: Number(avgHandle) }
}
