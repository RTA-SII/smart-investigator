import { useMemo } from "react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardTitle } from "@/components/ui/Card"
import { InfoTip } from "@/components/ui/InfoTip"
import { RechartsTip } from "@/components/charts/ChartTip"
import { Pie3D } from "@/components/charts/Pie3D"
import { Bar3D } from "@/components/charts/Bar3D"
import { NOW } from "@/data/complaints"
import {
  CATEGORIES,
  MODES,
  OUTCOMES,
  OUTCOME_TONE,
  VERDICT_TONE,
} from "@/data/catalog"
import { useT } from "@/i18n"

const TONE = {
  critical: "var(--tone-critical)",
  high: "var(--tone-high)",
  low: "var(--tone-low)",
  neutral: "var(--tone-neutral)",
}

/** One colour per transport mode, held apart from the chart-N ramp. */
const MODE_COLORS = [
  "var(--chart-1)",
  "#009cde",
  "#ff8200",
  "#9b59b6",
  "var(--tone-low)",
  "#0072bc",
]

const AXIS = {
  fontSize: 11,
  fontFamily: "RTA, system-ui, sans-serif",
  fill: "var(--muted-foreground)",
}

function ChartCard({ title, hint, legend, children }) {
  const t = useT()
  return (
    <Card className="chart-rise p-5">
      <div className="mb-4 flex items-center gap-2">
        <CardTitle>{t(title)}</CardTitle>
        <InfoTip label={hint} />
      </div>
      {children}
      {legend && (
        <div className="mt-4 flex flex-wrap gap-2">
          {legend.map((l) => (
            <span
              key={l.label}
              className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] leading-none font-semibold"
            >
              <span className="size-1.5 rounded-full" style={{ background: l.color }} />
              {t(l.label)}
              <span className="text-[var(--muted-foreground)]">{l.value}</span>
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}

/** Daily complaint volume, split into confirmed vs everything else. */
export function VolumeTrend({ rows, days }) {
  const data = useMemo(() => {
    const buckets = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(NOW.getTime() - i * 86_400_000)
      const key = `${d.getDate()}/${d.getMonth() + 1}`
      buckets.set(key, { day: key, Confirmed: 0, "Not confirmed": 0 })
    }
    for (const c of rows) {
      const d = new Date(c.receivedAt)
      const b = buckets.get(`${d.getDate()}/${d.getMonth() + 1}`)
      if (!b) continue
      if (c.ai.verdict === "Confirmed") b.Confirmed += 1
      else b["Not confirmed"] += 1
    }
    return [...buckets.values()]
  }, [rows, days])

  const totals = data.reduce(
    (a, d) => ({ s: a.s + d.Confirmed, o: a.o + d["Not confirmed"] }),
    { s: 0, o: 0 },
  )

  return (
    <ChartCard
      title="Complaint Volume by AI Verdict"
      hint="Daily complaints received in this period, split by what cross-validation concluded. Counts complaints, not drivers."
      legend={[
        { label: "Confirmed", color: "var(--tone-critical)", value: totals.s },
        { label: "Not confirmed", color: "var(--chart-1)", value: totals.o },
      ]}
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--tone-critical)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--tone-critical)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gOth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={AXIS} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} width={44} />
            <Tooltip
              content={<RechartsTip />}
              cursor={{ stroke: "rgba(0,0,0,0.18)", strokeDasharray: "3 4" }}
            />
            <Area
              type="monotone"
              dataKey="Not confirmed"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#gOth)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="Confirmed"
              stroke="var(--tone-critical)"
              strokeWidth={2}
              fill="url(#gSub)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}

/** Which kind of complaint the public actually raises. */
export function CategorySplit({ rows }) {
  const t = useT()
  const data = useMemo(
    () =>
      Object.keys(CATEGORIES).map((name, i) => ({
        name,
        value: rows.filter((c) => c.category === name).length,
        color: `var(--chart-${i + 1})`,
      })),
    [rows],
  )

  return (
    <ChartCard
      title="Complaints by Category"
      hint="Volume per category in this period. Driver behaviour is the category telematics can corroborate hardest."
      legend={data.map((d) => ({ label: d.name, color: d.color, value: d.value }))}
    >
      <Bar3D data={data.map((d) => ({ ...d, name: t(d.name) }))} />
    </ChartCard>
  )
}

/** How the cross-validation engine ruled across the range. */
export function VerdictBreakdown({ rows }) {
  const t = useT()
  const data = useMemo(
    () =>
      ["Confirmed", "Inconclusive", "False Positive"].map((name) => ({
        name,
        value: rows.filter((c) => c.ai.verdict === name).length,
        color: TONE[VERDICT_TONE[name]],
      })),
    [rows],
  )

  return (
    <ChartCard
      title="AI Verdict Breakdown"
      hint="Share of complaints by cross-validation outcome. Inconclusive means the signals conflicted, not that the complaint was rejected."
      legend={data.map((d) => ({ label: d.name, color: d.color, value: d.value }))}
    >
      <Pie3D data={data.map((d) => ({ ...d, name: t(d.name) }))} />
    </ChartCard>
  )
}

/** Volume per transport mode — required by the POC scope (§8). */
export function ModeSplit({ rows }) {
  const t = useT()
  const data = useMemo(
    () =>
      MODES.map((name, i) => ({
        name,
        value: rows.filter((c) => c.mode === name).length,
        color: MODE_COLORS[i % MODE_COLORS.length],
      })).filter((d) => d.value > 0),
    [rows],
  )

  return (
    <ChartCard
      title="Complaints by Transport Mode"
      hint="Where complaints land across the six modes RTA tracks. Modes with nothing in this period are left out."
      legend={data.map((d) => ({ label: d.name, color: d.color, value: d.value }))}
    >
      <Bar3D data={data.map((d) => ({ ...d, name: t(d.name) }))} />
    </ChartCard>
  )
}

/**
 * What officers actually decided — the action-taken breakdown the scope asks
 * for. Counts closed complaints only; anything still open has no outcome yet.
 */
export function ActionSplit({ rows }) {
  const t = useT()
  const data = useMemo(() => {
    const closed = rows.filter((c) => c.stage === "Closed")
    const byOutcome = OUTCOMES.map((name) => ({
      name,
      value: closed.filter((c) => c.outcome === name).length,
      color: TONE[OUTCOME_TONE[name]] ?? "var(--chart-1)",
    }))
    // A suspension rides alongside a fine, so it is its own bar, not a slice.
    const suspended = closed.filter((c) => c.penalty).length
    return [
      ...byOutcome,
      { name: "Other Penalty", value: suspended, color: "#9b59b6" },
    ].filter((d) => d.value > 0)
  }, [rows])

  return (
    <ChartCard
      title="Complaints by Action Taken"
      hint="Outcome of closed complaints. Other penalty counts suspensions issued alongside a fine, so it overlaps Fine Issued rather than adding to it."
      legend={data.map((d) => ({ label: d.name, color: d.color, value: d.value }))}
    >
      <Pie3D data={data.map((d) => ({ ...d, name: t(d.name) }))} />
    </ChartCard>
  )
}
