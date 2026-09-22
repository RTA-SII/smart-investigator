import { useMemo, useState } from "react"
import {
  Activity,
  BadgeCheck,
  Bus,
  Car,
  Crown,
  Download,
  Gauge,
  LayoutGrid,
  School,
} from "lucide-react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { InfoTip } from "@/components/ui/InfoTip"
import { ChipRow, PillTabs } from "@/components/ui/Chip"
import { OfficerReport } from "@/components/complaints/reports/OfficerReport"
import { CategoryReport } from "@/components/complaints/reports/CategoryReport"
import { ChannelReport } from "@/components/complaints/reports/ChannelReport"
import { CompanyReport } from "@/components/complaints/reports/CompanyReport"
import { scopeRows } from "@/data/reports"
import { useComplaints } from "@/app/complaintStore"
import { useT } from "@/i18n"

const MODES = [
  { value: "all", label: "All Modes", icon: <LayoutGrid /> },
  { value: "Taxi", label: "Taxi", icon: <Car /> },
  { value: "Public Bus", label: "Public Bus", icon: <Bus /> },
  { value: "School Bus", label: "School Bus", icon: <School /> },
  { value: "Limousine", label: "Limousine", icon: <Crown /> },
]

const TABS = [
  { value: "officers", label: "Officer Performance" },
  { value: "categories", label: "Categories" },
  { value: "channels", label: "Channels" },
  { value: "companies", label: "Operators" },
]

const RANGES = [
  { value: 7, label: "7 Days", icon: <Activity /> },
  { value: 14, label: "14 Days", icon: <Gauge /> },
  { value: 0, label: "All Time", icon: <BadgeCheck /> },
]

/** SMC's Operational Reports, scoped to complaints data. */
export function Reports() {
  const [mode, setMode] = useState("all")
  const [tab, setTab] = useState("officers")
  const t = useT()
  const [days, setDays] = useState(0)
  const complaints = useComplaints()

  const rows = useMemo(
    () => scopeRows(complaints, mode, days),
    [complaints, mode, days],
  )
  const rangeLabel = t(RANGES.find((r) => r.value === days).label)

  return (
    <>
      <PageHeader
        title={t("Complaint Reports")}
        subtitle={`${t("Complaint handling and team performance")} · ${rangeLabel}`}
        actions={
          <Button size="md">
            <Download />
            {t("Export")}
          </Button>
        }
      />

      <ChipRow
        options={MODES.map((m) => ({ ...m, label: t(m.label) }))}
        value={mode}
        onChange={setMode}
        className="mb-3"
      />
      <ChipRow
        options={RANGES.map((r) => ({ ...r, label: t(r.label) }))}
        value={days}
        onChange={setDays}
        className="mb-4"
      />

      <PillTabs
        tabs={TABS.map((x) => ({ ...x, label: t(x.label) }))}
        value={tab}
        onChange={setTab}
        className="mb-4"
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
              <Activity className="size-4" />
            </span>
            <CardTitle>{t(TABS.find((x) => x.value === tab).label)}</CardTitle>
            <InfoTip
              label={t(
                "Every figure here is aggregated from the same complaint set the queue reads, for the modes and period selected above.",
              )}
            />
          </div>
          <Badge tone="neutral">
            {rows.length} {t("complaints in scope")}
          </Badge>
        </div>

        {tab === "officers" && <OfficerReport rows={rows} />}
        {tab === "categories" && <CategoryReport rows={rows} />}
        {tab === "channels" && <ChannelReport rows={rows} />}
        {tab === "companies" && <CompanyReport rows={rows} />}
      </Card>
    </>
  )
}
