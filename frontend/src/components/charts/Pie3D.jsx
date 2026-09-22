import { useState } from "react"
import { ChartTip } from "@/components/charts/ChartTip"

/**
 * The portal's 3D pie.
 *
 * SMC draws this by hand rather than with a chart library, so this does too.
 * The disc is a circle projected to an ellipse (ry = rx / √2, a 45° tilt),
 * extruded downward by `DEPTH`. Side walls are drawn only for the front half
 * of the disc and painted a darkened shade of each slice; top faces go on
 * last so they sit above the walls.
 */

const RX = 104
const RATIO = 0.7071 // ry / rx — the 45° tilt SMC uses
const RY = RX * RATIO
const DEPTH = 26
const CX = 270
const CY = 168
const VIEW = { w: 540, h: 330 }

const rad = (deg) => (deg * Math.PI) / 180
const pointAt = (deg, r = RX, ry = RY, cy = CY) => [
  CX + r * Math.cos(rad(deg)),
  cy + ry * Math.sin(rad(deg)),
]

/** Slice top face: centre → arc → back to centre. */
function topFace(from, to) {
  const [x1, y1] = pointAt(from)
  const [x2, y2] = pointAt(to)
  const large = to - from > 180 ? 1 : 0
  return `M ${CX} ${CY} L ${x1} ${y1} A ${RX} ${RY} 0 ${large} 1 ${x2} ${y2} Z`
}

/** The extruded outer wall, clipped to the front half of the disc (0°–180°). */
function wall(from, to) {
  const a = Math.max(from, 0)
  const b = Math.min(to, 180)
  if (b <= a) return null
  const [x1, y1] = pointAt(a)
  const [x2, y2] = pointAt(b)
  const large = b - a > 180 ? 1 : 0
  return (
    `M ${x1} ${y1} A ${RX} ${RY} 0 ${large} 1 ${x2} ${y2} ` +
    `L ${x2} ${y2 + DEPTH} A ${RX} ${RY} 0 ${large} 0 ${x1} ${y1 + DEPTH} Z`
  )
}

/** Mix a colour toward black for the extruded wall. */
const shade = (c) => `color-mix(in oklab, ${c} 72%, #000)`

export function Pie3D({ data, total, className }) {
  const [hover, setHover] = useState(null)

  const sum = total ?? data.reduce((a, d) => a + d.value, 0)
  if (!sum) {
    return (
      <p className="py-16 text-center text-sm text-[var(--muted-foreground)]">
        Nothing to chart in this range
      </p>
    )
  }

  // Start at 12 o'clock and sweep clockwise, as SMC does.
  let cursor = -90
  const slices = data
    .filter((d) => d.value > 0)
    .map((d) => {
      const sweep = (d.value / sum) * 360
      const s = { ...d, from: cursor, to: cursor + sweep, mid: cursor + sweep / 2 }
      cursor += sweep
      return s
    })

  return (
    <div className={className}>
      <div className="relative h-[250px]">
        <svg
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          preserveAspectRatio="xMidYMid meet"
          direction="ltr"
          className="h-full w-full"
          role="img"
        >
          <ellipse
            cx={CX}
            cy={CY + DEPTH + 18}
            rx={RX * 0.9}
            ry={RY * 0.42}
            fill="rgba(0,0,0,0.12)"
          />

          {slices.map((s) => {
            const d = wall(s.from, s.to)
            return d ? <path key={`w-${s.name}`} d={d} fill={shade(s.color)} /> : null
          })}

          {slices.map((s) => (
            <path
              key={`t-${s.name}`}
              d={topFace(s.from, s.to)}
              fill={s.color}
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="1"
              className="cursor-pointer transition-opacity duration-150"
              opacity={hover && hover.name !== s.name ? 0.55 : 1}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
            />
          ))}

          {slices.map((s) => {
            const [lx, ly] = pointAt(s.mid, RX * 1.02, RY * 1.02)
            const right = Math.cos(rad(s.mid)) >= 0
            const ex = right ? CX + RX + 46 : CX - RX - 46
            return (
              <g key={`l-${s.name}`} pointerEvents="none">
                <polyline
                  points={`${lx},${ly} ${lx + (right ? 22 : -22)},${ly - 14} ${ex},${ly - 14}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.28)"
                  strokeWidth="1"
                />
                <text
                  x={right ? ex + 6 : ex - 6}
                  y={ly - 10}
                  textAnchor={right ? "start" : "end"}
                  className="fill-[var(--foreground)]"
                  style={{ fontSize: 13, fontFamily: "RTA, system-ui, sans-serif" }}
                >
                  {s.name}
                </text>
              </g>
            )
          })}
        </svg>

        {hover && (
          <ChartTip
            label={hover.name}
            rows={[
              { name: "Complaints", value: hover.value, color: hover.color },
              {
                name: "Share",
                value: `${Math.round((hover.value / sum) * 100)}%`,
                color: hover.color,
              },
            ]}
            className="absolute top-2 left-1/2 -translate-x-1/2"
          />
        )}
      </div>
    </div>
  )
}
