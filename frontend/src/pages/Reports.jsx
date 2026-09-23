import { useMemo, useState } from "react"
import {
  Activity,
  BadgeCheck,
  ChartNoAxesCombined,
  CircleCheck,
  Download,
  Gauge,
  LayoutGrid,
  ShieldAlert,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"
import { PageHeader } from "@/components/shell/PageHeader"
import { Button } from "@/components/ui/Button"
import { Card, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { InfoTip } from "@/components/ui/InfoTip"
import { ChipRow, PillTabs } from "@/components/ui/Chip"
import { KpiTile } from "@/components/complaints/KpiTile"
import { OfficerReport } from "@/components/complaints/reports/OfficerReport"
import { CategoryReport } from "@/components/complaints/reports/CategoryReport"
import { ChannelReport } from "@/components/complaints/reports/ChannelReport"
import { CompanyReport } from "@/components/complaints/reports/CompanyReport"
import { scopeRows } from "@/data/reports"
import { MODES as TRANSPORT_MODES } from "@/data/catalog"
import { modeIcon } from "@/components/complaints/modeIcons"
import { wasEscalated } from "@/lib/filters"
import { useComplaints } from "@/app/complaintStore"
import { num } from "@/lib/format"
import { useT } from "@/i18n"

/**
 * Built from the catalog rather than listed by hand — the hand-written list
 * filtered on `Limousine`, which no complaint carries, and left rental and
 * marine off the row entirely.
 */
const MODES = [
  { value: "all", label: "All Modes", icon: <LayoutGrid /> },
  ...TRANSPORT_MODES.map((mode) => {
    const Icon = modeIcon(mode)
    return { value: mode, label: mode, icon: <Icon /> }
  }),
]

/**
 * SMC's three report sections, carrying complaints instead of alerts.
 *
 * Each opens with a "pulse" — a row of headline figures — and then the table
 * that explains it. That ordering is SMC's: the number first, the breakdown
 * underneath.
 */
const TABS = [
  { value: "operational", label: "Operational" },
  { value: "performance", label: "Performance" },
  { value: "trends", label: "Trends" },
]

const RANGES = [
  { value: 7, label: "7 Days", icon: <Activity /> },
  { value: 14, label: "14 Days", icon: <Gauge /> },
  { value: 0, label: "All Time", icon: <BadgeCheck /> },
]

const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0)

export function Reports() {
  const [mode, setMode] = useState("all")
  const [tab, setTab] = useState("operational")
  const t = useT()
  const [days, setDays] = useState(0)
  const complaints = useComplaints()

  const rows = useMemo(
    () => scopeRows(complaints, mode, days),
    [complaints, mode, days],
  )
  const rangeLabel = t(RANGES.find((r) => r.value === days).label)

  const k = useMemo(() => {
    const closed = rows.filter((c) => c.stage === "Closed")
    const guilty = closed.filter((c) => c.outcome === "Valid Complaint - Guilty")
    const byMonth = {}
    for (const c of rows) {
      const key = c.receivedAt.slice(0, 7)
      byMonth[key] = (byMonth[key] ?? 0) + 1
    }
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b))
    const repeat = new Set(
      rows
        .filter((c) => (c.driver?.priorComplaints ?? 0) >= 3)
        .map((c) => c.driver?.licence),
    )
    return {
      total: rows.length,
      closed: closed.length,
      pending: rows.length - closed.length,
      escalated: rows.filter(wasEscalated).length,
      guilty: guilty.length,
      critical: rows.filter((c) => c.priority === "Critical").length,
      high: rows.filter((c) => c.priority === "High").length,
      repeat: repeat.size,
      latest: months.at(-1)?.[1] ?? 0,
      peak: months.reduce((m, [, n]) => Math.max(m, n), 0),
      months: months.length,
    }
  }, [rows])

  const pulse = {
    operational: {
      title: "Operational pulse",
      tiles: [
        { label: "Total complaints", value: num(k.total), meter: 100, tone: "var(--tone-info)", icon: LayoutGrid, caption: t("In scope") },
        { label: "Actioned", value: num(k.closed), meter: pct(k.closed, k.total), tone: "var(--tone-low)", icon: CircleCheck, caption: `${pct(k.closed, k.total)}% ${t("of scope")}` },
        { label: "Pending", value: num(k.pending), meter: pct(k.pending, k.total), tone: "var(--tone-critical)", icon: TriangleAlert, caption: t("Not yet closed") },
        { label: "Escalated", value: num(k.escalated), meter: pct(k.escalated, k.total), tone: "var(--tone-high)", icon: ShieldAlert, caption: t("Went up for a ruling") },
      ],
    },
    performance: {
      title: "Team pulse",
      tiles: [
        { label: "Close rate", value: `${pct(k.closed, k.total)}%`, meter: pct(k.closed, k.total), tone: "var(--tone-low)", icon: CircleCheck, caption: t("Closed of everything in scope") },
        { label: "Found guilty", value: num(k.guilty), meter: pct(k.guilty, k.closed), tone: "var(--tone-critical)", icon: ShieldAlert, caption: `${pct(k.guilty, k.closed)}% ${t("of closed")}` },
        { label: "Critical priority", value: num(k.critical), meter: pct(k.critical, k.total), tone: "var(--tone-critical)", icon: TriangleAlert, caption: t("Hardest cases in scope") },
        { label: "Repeat drivers", value: num(k.repeat), meter: pct(k.repeat, k.total), tone: "#9B59B6", icon: Users, caption: t("Three or more prior complaints") },
      ],
    },
    trends: {
      title: "Complaint trajectory",
      tiles: [
        { label: "Latest month", value: num(k.latest), meter: pct(k.latest, k.peak), tone: "var(--tone-info)", icon: ChartNoAxesCombined, caption: t("Complaints received") },
        { label: "Peak month", value: num(k.peak), meter: 100, tone: "var(--tone-high)", icon: TrendingUp, caption: t("Busiest month in scope") },
        { label: "Months covered", value: num(k.months), meter: 100, tone: "var(--tone-low)", icon: Activity, caption: t("Span of the data") },
        { label: "High priority", value: num(k.high), meter: pct(k.high, k.total), tone: "var(--tone-high)", icon: ShieldAlert, caption: t("High-priority complaints") },
      ],
    },
  }[tab]

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

      <p className="mb-3 flex items-center gap-2 text-sm font-bold">
        {t(pulse.title)}
        <InfoTip
          label={t(
            "Headline figures for the modes and period selected above, from the same complaint set the queue reads.",
          )}
        />
      </p>

      <div className="mb-5 grid grid-cols-2 items-stretch gap-3 lg:grid-cols-4">
        {pulse.tiles.map((tile) => (
          <KpiTile key={tile.label} {...tile} label={t(tile.label)} />
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
              <Activity className="size-4" />
            </span>
            <CardTitle>
              {t(
                tab === "operational"
                  ? "Categories"
                  : tab === "performance"
                    ? "Officer Performance"
                    : "Channels",
              )}
            </CardTitle>
          </div>
          <Badge tone="neutral">
            {rows.length} {t("complaints in scope")}
          </Badge>
        </div>

        {tab === "operational" && <CategoryReport rows={rows} />}
        {tab === "performance" && <OfficerReport rows={rows} />}
        {tab === "trends" && <ChannelReport rows={rows} />}
      </Card>

      {tab === "trends" && (
        <Card className="mt-4 overflow-hidden">
          <div className="flex items-center gap-3 px-5 pt-4 pb-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-[var(--primary)]">
              <TrendingUp className="size-4" />
            </span>
            <CardTitle>{t("Operators")}</CardTitle>
          </div>
          <CompanyReport rows={rows} />
        </Card>
      )}
    </>
  )
}
