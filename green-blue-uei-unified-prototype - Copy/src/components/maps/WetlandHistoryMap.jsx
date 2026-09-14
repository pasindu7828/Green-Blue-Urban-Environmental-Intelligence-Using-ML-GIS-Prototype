import { useMemo } from 'react'

function scaleForArea(area, maxArea) {
  if (!area || !maxArea) return 1

  // Area changes approximately with scale²,
  // therefore use square root for visual scaling.
  return Math.sqrt(area / maxArea)
}

export default function WetlandHistoryMap({
  history = [],
  mode = 'single',
  selectedYear,
  fromYear,
  toYear,
}) {
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => a.year - b.year)
  }, [history])


  const maxArea = useMemo(() => {
    if (!sortedHistory.length) return 1

    return Math.max(
      ...sortedHistory.map((item) => item.area),
    )
  }, [sortedHistory])


  const singleRecord = sortedHistory.find(
    (item) => item.year === Number(selectedYear),
  )


  const fromRecord = sortedHistory.find(
    (item) => item.year === Number(fromYear),
  )


  const toRecord = sortedHistory.find(
    (item) => item.year === Number(toYear),
  )


  const centerX = 350
  const centerY = 225

  const basePath =
    'M185 130 C235 78 315 76 370 105 C426 134 483 126 516 169 C551 214 525 284 472 309 C422 333 367 312 317 329 C260 349 197 318 168 267 C140 219 147 169 185 130 Z'


  const transformedPath = (record) => {
    const scale = scaleForArea(
      record?.area,
      maxArea,
    )

    return {
      path: basePath,
      transform: `
        translate(${centerX} ${centerY})
        scale(${scale})
        translate(${-centerX} ${-centerY})
      `,
    }
  }


  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#E6F4F1]">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow">
        Schematic historical boundary prototype
      </div>


      <svg
        viewBox="0 0 700 450"
        className="h-full min-h-[430px] w-full"
      >
        {/* Background terrain context */}
        <path
          d="M0 105 C120 85 225 122 345 96 C465 70 570 96 700 72"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          opacity=".5"
        />

        <path
          d="M0 355 C135 315 250 366 380 333 C510 300 600 322 700 303"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="3"
          opacity=".5"
        />


        {/* Canal / drainage context */}
        <path
          d="M0 248 C132 199 230 264 355 218 C470 176 585 227 700 190"
          fill="none"
          stroke="#55AFC9"
          strokeWidth="12"
          opacity=".55"
        />

        <path
          d="M120 0 C145 88 193 132 212 214 C226 282 206 356 245 450"
          fill="none"
          stroke="#76C4D4"
          strokeWidth="6"
          opacity=".42"
        />


        {mode === 'single' && singleRecord && (
          <>
            <path
              d={
                transformedPath(singleRecord)
                  .path
              }
              transform={
                transformedPath(singleRecord)
                  .transform
              }
              fill="#4FAE78"
              fillOpacity=".82"
              stroke="#165E56"
              strokeWidth="3"
            />

            <text
              x="350"
              y="220"
              textAnchor="middle"
              fontSize="18"
              fontWeight="800"
              fill="#113D38"
            >
              {singleRecord.year}
            </text>

            <text
              x="350"
              y="243"
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#255B55"
            >
              {singleRecord.area.toFixed(1)} ha
            </text>
          </>
        )}


        {mode === 'compare' &&
          fromRecord &&
          toRecord && (
            <>
              {/* Earlier mapped extent */}
              <path
                d={
                  transformedPath(fromRecord)
                    .path
                }
                transform={
                  transformedPath(fromRecord)
                    .transform
                }
                fill="#F97316"
                fillOpacity=".28"
                stroke="#C2410C"
                strokeWidth="3"
                strokeDasharray="8 6"
              />

              {/* Later mapped extent */}
              <path
                d={
                  transformedPath(toRecord).path
                }
                transform={
                  transformedPath(toRecord)
                    .transform
                }
                fill="#0F766E"
                fillOpacity=".78"
                stroke="#115E59"
                strokeWidth="3"
              />

              <text
                x="350"
                y="212"
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill="#113D38"
              >
                {fromRecord.year} →{' '}
                {toRecord.year}
              </text>

              <text
                x="350"
                y="235"
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#255B55"
              >
                Historical extent comparison
              </text>
            </>
          )}
      </svg>


      <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-600 shadow-sm">
        {mode === 'single' ? (
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#4FAE78]" />
            Mapped wetland extent
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-400" />
              Earlier extent
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-teal-700" />
              Later extent
            </div>
          </div>
        )}
      </div>


      <div className="absolute bottom-4 right-4 max-w-[230px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] leading-4 text-slate-500 shadow-sm">
        Prototype visualization only. Final historical
        boundaries, stable areas, gross loss and gain
        polygons will come from QGIS spatial overlays.
      </div>
    </div>
  )
}