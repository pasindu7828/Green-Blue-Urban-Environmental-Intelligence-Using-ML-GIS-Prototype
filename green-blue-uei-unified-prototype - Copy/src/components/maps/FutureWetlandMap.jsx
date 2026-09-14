import { useMemo } from 'react'

function scaleForArea(area, referenceArea) {
  if (!area || !referenceArea) return 1

  return Math.sqrt(area / referenceArea)
}

export default function FutureWetlandMap({
  currentArea,
  projectedArea,
  currentYear = 2026,
  projectionYear = 2030,
}) {
  const currentScale = 1

  const projectedScale = useMemo(() => {
    return scaleForArea(projectedArea, currentArea)
  }, [projectedArea, currentArea])

  const centerX = 350
  const centerY = 225

  const wetlandPath =
    'M175 128 C224 86 293 76 350 104 C406 132 472 124 512 168 C548 208 531 271 485 301 C438 331 380 313 328 329 C274 346 211 327 177 282 C143 238 141 170 175 128 Z'

  const transformForScale = (scale) => `
    translate(${centerX} ${centerY})
    scale(${scale})
    translate(${-centerX} ${-centerY})
  `

  const change = projectedArea - currentArea

  const changePercent =
    currentArea > 0
      ? (change / currentArea) * 100
      : 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#E7F3F0]">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow">
        Scenario-based future projection prototype
      </div>

      <svg
        viewBox="0 0 700 450"
        className="h-full min-h-[500px] w-full"
      >
        {/* Background spatial context */}
        <path
          d="M0 110 C135 76 240 126 360 91 C475 57 575 95 700 72"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          opacity=".5"
        />

        <path
          d="M0 360 C125 319 249 365 383 334 C500 306 599 331 700 302"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          opacity=".5"
        />

        {/* Drainage context */}
        <path
          d="M0 247 C130 204 238 259 355 219 C474 177 576 225 700 189"
          fill="none"
          stroke="#4CA8CE"
          strokeWidth="11"
          opacity=".48"
        />

        {/* Current extent */}
        <path
          d={wetlandPath}
          transform={transformForScale(currentScale)}
          fill="#F97316"
          fillOpacity=".43"
          stroke="#C2410C"
          strokeWidth="3"
          strokeDasharray="8 5"
        />

        {/* Projected future extent */}
        <path
          d={wetlandPath}
          transform={transformForScale(projectedScale)}
          fill="#0F766E"
          fillOpacity=".82"
          stroke="#115E59"
          strokeWidth="3"
        />

        <text
          x="350"
          y="210"
          textAnchor="middle"
          fontSize="17"
          fontWeight="800"
          fill="#113D38"
        >
          {currentYear} → {projectionYear}
        </text>

        <text
          x="350"
          y="234"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#255B55"
        >
          {changePercent.toFixed(1)}% projected area change
        </text>
      </svg>

      <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-600 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-400" />
            Current {currentYear} extent
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-teal-700" />
            Projected {projectionYear} extent
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-orange-500 bg-orange-100" />
            Potential loss area
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 max-w-[220px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] leading-4 text-slate-500 shadow-sm">
        Schematic prototype only. Final current and projected
        polygons will come from spatial land-change modelling
        and QGIS outputs.
      </div>
    </div>
  )
}