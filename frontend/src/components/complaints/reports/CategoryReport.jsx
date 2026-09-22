import { Layers, ShieldAlert } from "lucide-react"
import { ReportTable, RateCell } from "@/components/complaints/ReportTable"
import { categoryRows } from "@/data/reports"
import { useT } from "@/i18n"

const GROUPS = [
  { label: "Category", span: 1 },
  { label: "Volume", span: 2, tone: "volume", icon: <Layers /> },
  { label: "Outcomes", span: 3, tone: "outcome", icon: <ShieldAlert /> },
]

const COLUMNS = [
  { key: "name", label: "Category" },
  { key: "total", label: "Complaints Received", align: "right", startsGroup: "volume" },
  { key: "confirmedPct", label: "Confirmed", align: "right" },
  { key: "closed", label: "Closed", align: "right", startsGroup: "outcome" },
  { key: "fines", label: "Fines", align: "right" },
  { key: "suspensions", label: "Suspensions", align: "right" },
]

/** Which kinds of complaint hold up once the evidence is weighed. */
export function CategoryReport({ rows }) {
  const t = useT()
  return (
    <ReportTable
      groups={GROUPS}
      columns={COLUMNS}
      rows={categoryRows(rows)}
      renderCell={(r, c) => {
        if (c.key === "name")
          return <span className="text-sm font-semibold">{t(r.name)}</span>
        if (c.key === "confirmedPct") return <RateCell value={r.confirmedPct} />
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
