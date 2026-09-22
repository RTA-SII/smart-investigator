import { Building2, ShieldAlert } from "lucide-react"
import { ReportTable, RateCell } from "@/components/complaints/ReportTable"
import { Badge } from "@/components/ui/Badge"
import { companyRows } from "@/data/reports"

const GROUPS = [
  { label: "Operator", span: 1 },
  { label: "Volume", span: 2, tone: "volume", icon: <Building2 /> },
  { label: "Enforcement", span: 3, tone: "outcome", icon: <ShieldAlert /> },
]

const COLUMNS = [
  { key: "name", label: "Operator" },
  { key: "total", label: "Complaints Received", align: "right", startsGroup: "volume" },
  { key: "confirmedPct", label: "Confirmed", align: "right" },
  { key: "fines", label: "Fines", align: "right", startsGroup: "outcome" },
  { key: "suspensions", label: "Suspensions", align: "right" },
  { key: "repeatDrivers", label: "Repeat Drivers", align: "right" },
]

/** Compliance by the company the driver works for. */
export function CompanyReport({ rows }) {
  return (
    <ReportTable
      groups={GROUPS}
      columns={COLUMNS}
      rows={companyRows(rows)}
      renderCell={(r, c) => {
        if (c.key === "name")
          return <span className="text-sm font-semibold">{r.name}</span>
        if (c.key === "confirmedPct") return <RateCell value={r.confirmedPct} />
        if (c.key === "repeatDrivers")
          return (
            <Badge tone={r.repeatDrivers > 2 ? "critical" : "neutral"}>
              {r.repeatDrivers}
            </Badge>
          )
        if (c.key === "suspensions")
          return (
            <span className="text-sm font-semibold text-[var(--destructive)]">
              {r.suspensions}
            </span>
          )
        return <span className="text-sm">{r[c.key]}</span>
      }}
    />
  )
}
