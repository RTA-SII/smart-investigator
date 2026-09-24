import { useEffect, useRef, useState } from "react"
import { ChartTip } from "@/components/charts/ChartTip"
import { cn } from "@/lib/cn"

/**
 * The portal's 3D horizontal bars — SMC's "Alert Resolution Pipeline".
 *
 * Each bar is three faces: the front rectangle, a top parallelogram skewed
 * by the isometric offset, and a matching end cap on the right. The offset is
 * constant, so all bars share one light direction.
 */

const OFF = 9 // isometric shift — right and up
const BAR = 26
const GAP = 22
const LABEL_W = 96
const PAD_R = 58
const VIEW_W = 520
const AXIS_H = 34
// Past this a bar stops reading as a bar and starts reading as a slab, so
// surplus height goes into the gaps instead.
const MAX_BAR = 46

const lighten = (c) => `color-mix(in oklab, ${c} 78%, #fff)`
const darken = (c) => `color-mix(in oklab, ${c} 72%, #000)`

export function Bar3D({ data, className }) {
  const [hover, setHover] = useState(null)
  const box = useRef(null)
  const [fit, setFit] = useState(0)

  // A chart with three bars sitting in a row beside a tall pie gets stretched
  // to the pie's height and used to leave the bottom half of its card empty.
  // Matching the viewBox to the box's own aspect makes `meet` scale the chart
  // to fill it instead of letterboxing it.
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === "undefined") return

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setFit(width ? (VIEW_W * height) / width : 0)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const max = Math.max(...data.map((d) => d.value), 1)
  const plotW = VIEW_W - LABEL_W - PAD_R
  const natural = data.length * (BAR + GAP) + OFF + AXIS_H
  const height = Math.max(natural, fit)
  const pitch = (height - OFF - AXIS_H) / data.length
  const bar = Math.min(MAX_BAR, pitch * 0.55)
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div
      ref={box}
      className={cn("relative w-full", className)}
      style={{ minHeight: natural * 1.05 }}
    >
      <>
        <svg
          viewBox={`0 0 ${VIEW_W} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          direction="ltr"
          className="h-full w-full"
          role="img"
        >
          {ticks.map((t) => {
            const x = LABEL_W + plotW * t
            return (
              <g key={t}>
                <line
                  x1={x}
                  y1={OFF}
                  x2={x}
                  y2={height - 28}
                  stroke="rgba(0,0,0,0.07)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className="fill-[var(--muted-foreground)]"
                  style={{ fontSize: 11, fontFamily: "RTA, system-ui, sans-serif" }}
                >
                  {Math.round(max * t).toLocaleString("en-US")}
                </text>
              </g>
            )
          })}

          {data.map((d, i) => {
            const w = Math.max((d.value / max) * plotW, d.value > 0 ? 3 : 0)
            const y = OFF + i * pitch + (pitch - bar) / 2
            const x = LABEL_W
            const dim = hover && hover.name !== d.name
            return (
              <g
                key={d.name}
                className="cursor-pointer transition-opacity duration-150"
                opacity={dim ? 0.55 : 1}
                onMouseEnter={() => setHover(d)}
                onMouseLeave={() => setHover(null)}
              >
                <text
                  x={LABEL_W - 12}
                  y={y + bar / 2 + 4}
                  textAnchor="end"
                  className="fill-[var(--muted-foreground)]"
                  style={{ fontSize: 11, fontFamily: "RTA, system-ui, sans-serif" }}
                >
                  {d.name}
                </text>

                {w > 0 && (
                  <>
                    <polygon
                      points={`${x},${y} ${x + w},${y} ${x + w + OFF},${y - OFF} ${x + OFF},${y - OFF}`}
                      fill={lighten(d.color)}
                    />
                    <polygon
                      points={`${x + w},${y} ${x + w + OFF},${y - OFF} ${x + w + OFF},${y + bar - OFF} ${x + w},${y + bar}`}
                      fill={darken(d.color)}
                    />
                    <rect x={x} y={y} width={w} height={bar} fill={d.color} />
                    <text
                      x={x + w + OFF + 6}
                      y={y + bar / 2 + 4}
                      className="fill-[var(--muted-foreground)]"
                      style={{ fontSize: 11, fontFamily: "RTA, system-ui, sans-serif" }}
                    >
                      {d.value.toLocaleString("en-US")}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>

        {hover && (
          <ChartTip
            label={hover.name}
            rows={[{ name: hover.unit ?? "Complaints", value: hover.value, color: hover.color }]}
            className="absolute top-0 end-2"
          />
        )}
      </>
    </div>
  )
}
