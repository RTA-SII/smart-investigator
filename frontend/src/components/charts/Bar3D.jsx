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
// A bar may grow a little past its natural thickness to take up a taller
// card, but not far: much beyond this it stops reading as a bar and starts
// reading as a slab. Surplus height goes into the gaps instead.
const MAX_BAR = 32

const lighten = (c) => `color-mix(in oklab, ${c} 78%, #fff)`
const darken = (c) => `color-mix(in oklab, ${c} 72%, #000)`

export function Bar3D({ data, className }) {
  const [hover, setHover] = useState(null)
  const box = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // The viewBox tracks the element's own pixel size, so one unit is one
  // pixel whatever the card is. Without that the same chart rendered at two
  // scales — narrow beside a pie, and nearly three times up in a full-width
  // card, which magnified the 11px labels along with the bars.
  useEffect(() => {
    const el = box.current
    if (!el || typeof ResizeObserver === "undefined") return

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const max = Math.max(...data.map((d) => d.value), 1)
  const natural = data.length * (BAR + GAP) + OFF + AXIS_H
  const width = size.w || VIEW_W
  const height = Math.max(natural, size.h || natural)
  const plotW = width - LABEL_W - PAD_R
  const pitch = (height - OFF - AXIS_H) / data.length
  const bar = Math.min(MAX_BAR, pitch * 0.55)

  // Quarters round to a repeated integer on a small scale — a four-complaint
  // chart was labelled 0 1 2 2 3. Below five, one line per whole complaint.
  const ticks =
    max <= 4
      ? Array.from({ length: max + 1 }, (_, i) => i / max)
      : [0, 0.25, 0.5, 0.75, 1]

  return (
    <div
      ref={box}
      className={cn("relative w-full", className)}
      style={{ minHeight: natural * 1.05 }}
    >
      <>
        <svg
          viewBox={`0 0 ${width} ${height}`}
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
