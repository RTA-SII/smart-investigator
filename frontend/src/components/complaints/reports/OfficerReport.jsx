import { BadgeCheck, Clock, Layers, ShieldAlert } from "lucide-react"
import { ReportTable, RateCell } from "@/components/complaints/ReportTable"
import { Badge } from "@/components/ui/Badge"
import { officerRows } from "@/data/reports"
import { initials } from "@/lib/format"

const GROUPS = [
  { label: "Officer", span: 1 },
  { label: "Volume", span: 4, tone: "volume", icon: <Layers /> },
  { label: "Speed", span: 2, tone: "speed", icon: <Clock /> },
  { label: "Quality", span: 1, tone: "quality", icon: <BadgeCheck /> },
  { label: "Outcomes", span: 2, tone: "outcome", icon: <ShieldAlert /> },
]

const COLUMNS = [
  { key: "name", label: "Officer" },
  {
    key: "active",
    label: "Active Load",
    align: "right",
    startsGroup: "volume",
    hint: "Complaints assigned to this officer that are not yet closed.",
  },
  {
    key: "handled",
    label: "Handled",
    align: "right",
    hint: "Every complaint ever routed to this officer in the selected period.",
  },
  {
    key: "closed",
    label: "Closed",
    align: "right",
    hint: "Complaints this officer ruled on and filed.",
  },
  {
    key: "closeRate",
    label: "Close Rate",
    align: "right",
    hint: "Closed as a share of handled. Low is not necessarily bad — escalated cases leave the officer open.",
  },
  {
    key: "avgTime",
    label: "Avg Time",
    align: "right",
    startsGroup: "speed",
    hint: "Average minutes from receipt to decision, against the five-minute target.",
  },
  {
    key: "slaPct",
    label: "SLA %",
    align: "right",
    hint: "Share of this officer's complaints handled inside the five-minute target.",
  },
  {
    key: "upheldPct",
    label: "Upheld",
    align: "right",
    startsGroup: "quality",
    hint: "Of the complaints this officer closed, the share cross-validation had confirmed. Shows — when nothing is closed yet.",
  },
  {
    key: "fines",
    label: "Fines",
    align: "right",
    startsGroup: "outcome",
    hint: "Complaints that ended in a fine or a permit suspension (count of complaints, not money).",
  },
  {
    key: "escalated",
    label: "Escalated",
    align: "right",
    hint: "Referred upward because the evidence did not settle the question.",
  },
]

const AVATAR = ["#171c8f", "#e41a14", "#009cde", "#9b59b6"]

export function OfficerReport({ rows }) {
  const data = officerRows(rows)

  return (
    <ReportTable
      groups={GROUPS}
      columns={COLUMNS}
      rows={data}
      renderCell={(r, c) => {
        switch (c.key) {
          case "name":
            return (
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: AVATAR[data.indexOf(r) % AVATAR.length] }}
                >
                  {initials(r.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{r.name}</span>
                  <span className="block truncate text-[11px] text-[var(--muted-foreground)]">
                    {r.handle}
                  </span>
                </span>
              </span>
            )
          case "active":
            return (
              <Badge tone={r.active > 6 ? "critical" : r.active > 3 ? "high" : "info"}>
                {r.active}
              </Badge>
            )
          case "closeRate":
            return <RateCell value={r.closeRate} />
          case "slaPct":
            return <RateCell value={r.slaPct} />
          case "upheldPct":
            return r.upheldPct == null ? (
              <span className="text-[var(--muted-foreground)]">—</span>
            ) : (
              <RateCell value={r.upheldPct} />
            )
          case "avgTime":
            return (
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    Number(r.avgTime) <= 5 ? "var(--tone-low)" : "var(--tone-high)",
                }}
              >
                {r.avgTime}m
              </span>
            )
          case "escalated":
            return (
              <span className="text-sm font-semibold text-[var(--primary)]">
                {r.escalated}
              </span>
            )
          default:
            return <span className="text-sm">{r[c.key]}</span>
        }
      }}
    />
  )
}
