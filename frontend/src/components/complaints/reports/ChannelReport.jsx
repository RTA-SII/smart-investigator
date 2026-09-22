import { Clock, RadioTower } from "lucide-react"
import { ReportTable, RateCell } from "@/components/complaints/ReportTable"
import { channelRows } from "@/data/reports"
import { useT } from "@/i18n"

const GROUPS = [
  { label: "Channel", span: 1 },
  { label: "Volume", span: 2, tone: "volume", icon: <RadioTower /> },
  { label: "Speed", span: 1, tone: "speed", icon: <Clock /> },
]

const COLUMNS = [
  { key: "name", label: "Intake Channel" },
  { key: "total", label: "Complaints Received", align: "right", startsGroup: "volume" },
  { key: "share", label: "Share", align: "right" },
  { key: "breached", label: "SLA Breached", align: "right", startsGroup: "speed" },
]

/** Where the public actually reaches us, and where the clock slips. */
export function ChannelReport({ rows }) {
  const t = useT()
  return (
    <ReportTable
      groups={GROUPS}
      columns={COLUMNS}
      rows={channelRows(rows)}
      renderCell={(r, c) => {
        if (c.key === "name")
          return <span className="text-sm font-semibold">{t(r.name)}</span>
        if (c.key === "share")
          return <RateCell value={r.share} tone="var(--chart-1)" />
        if (c.key === "breached")
          return (
            <span
              className="text-sm font-semibold"
              style={{ color: r.breached ? "var(--tone-critical)" : "var(--tone-low)" }}
            >
              {r.breached}
            </span>
          )
        return <span className="text-sm">{r[c.key]}</span>
      }}
    />
  )
}
