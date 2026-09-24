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
import { closedAt } from "@/lib/cht"
import {
  CATEGORIES,
  CHANNELS,
  MODES,
  OUTCOMES,
  OUTCOME_TONE,
} from "@/data/catalog"
import { useT } from "@/i18n"

const TONE = {
  critical: "var(--tone-critical)",
  high: "var(--tone-high)",
  low: "var(--tone-low)",
  neutral: "var(--tone-neutral)",
}

/** One colour per intake channel, in the order the catalog lists them. */
const SOURCE_COLORS = ["var(--chart-1)", "#009cde", "#ff8200", "var(--tone-low)"]

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
    <Card className="chart-rise flex h-full flex-col p-5">
      <div className="mb-4 flex items-center gap-2">
        <CardTitle>{t(title)}</CardTitle>
        <InfoTip label={hint} />
      </div>
      {/* Cards in a row are stretched to the tallest of them. The chart takes
          that surplus rather than leaving it under the legend: a bar chart
          grows into it, a pie centres itself in it. */}
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
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

/**
 * Arrivals against closures, day by day.
 *
 * The question an officer actually has of a trend line is whether they are
 * keeping up — work coming in against work going out. What the engine
 * concluded is a property of each case, not something a time series says
 * anything useful about.
 */
export function VolumeTrend({ rows, days }) {
  const data = useMemo(() => {
    const key = (d) => `${d.getDate()}/${d.getMonth() + 1}`
    const buckets = new Map()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(NOW.getTime() - i * 86_400_000)
      buckets.set(key(d), { day: key(d), Received: 0, Closed: 0 })
    }

    for (const c of rows) {
      const inbox = buckets.get(key(new Date(c.receivedAt)))
      if (inbox) inbox.Received += 1

      const done = closedAt(c)
      const settled = done && buckets.get(key(done))
      if (settled) settled.Closed += 1
    }
    return [...buckets.values()]
  }, [rows, days])

  const totals = data.reduce(
    (a, d) => ({ received: a.received + d.Received, closed: a.closed + d.Closed }),
    { received: 0, closed: 0 },
  )

  return (
    <ChartCard
      title="Complaints Received vs Closed"
      hint="Work arriving against work settled, day by day. The two lines tracking each other means the queue is holding; received running above closed means it is growing."
      legend={[
        { label: "Received", color: "var(--chart-1)", value: totals.received },
        { label: "Closed", color: "var(--tone-low)", value: totals.closed },
      ]}
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--tone-low)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--tone-low)" stopOpacity={0.02} />
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
              dataKey="Received"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#gIn)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="Closed"
              stroke="var(--tone-low)"
              strokeWidth={2}
              fill="url(#gOut)"
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
      <Bar3D className="h-full" data={data.map((d) => ({ ...d, name: t(d.name) }))} />
    </ChartCard>
  )
}

/** Which channel the public actually reports through. */
export function SourceSplit({ rows }) {
  const t = useT()
  const data = useMemo(
    () =>
      CHANNELS.map((name, i) => ({
        name,
        value: rows.filter((c) => c.channel === name).length,
        color: SOURCE_COLORS[i % SOURCE_COLORS.length],
      })).filter((d) => d.value > 0),
    [rows],
  )

  return (
    <ChartCard
      title="Complaints by Source"
      hint="Where complaints reached the centre from. Walk-in is the one channel the Investigation Office logs itself; the rest arrive through CRM."
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
      <Bar3D className="h-full" data={data.map((d) => ({ ...d, name: t(d.name) }))} />
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
