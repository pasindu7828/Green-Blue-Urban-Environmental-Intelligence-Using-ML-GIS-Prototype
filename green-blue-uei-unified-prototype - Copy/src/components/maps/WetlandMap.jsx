import { wetlands } from '../../data/wetlandData'

const shapes = [
  'M70 80 C95 50 140 52 158 82 C172 110 153 141 113 145 C79 145 55 116 70 80Z',
  'M192 65 C230 48 270 61 280 93 C287 122 258 143 220 139 C184 135 171 90 192 65Z',
  'M330 72 C365 52 406 58 423 91 C437 120 413 150 373 148 C338 146 311 105 330 72Z',
  'M500 70 C535 44 579 58 593 95 C606 130 574 151 536 143 C504 136 481 99 500 70Z',
  'M100 205 C138 180 177 196 189 227 C200 257 170 279 130 275 C98 272 78 231 100 205Z',
  'M240 199 C275 178 318 191 332 224 C345 255 319 283 278 280 C241 277 220 228 240 199Z',
]

const labelPositions = [
  [94, 105],
  [205, 100],
  [345, 105],
  [515, 103],
  [110, 235],
  [254, 235],
]

function colorForCondition(condition) {
  if (condition === 'Persistent Loss') return '#E8893B'
  if (condition === 'Fragmented') return '#E0BF52'
  if (condition === 'Seasonally Variable') return '#68B8B3'
  if (condition === 'Relatively Stable') return '#4FAE78'

  return '#79C99A'
}

export default function WetlandMap({
  selected,
  onSelect,
  height = 360,
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#E4F5F2] map-grid-bg"
      style={{ minHeight: height }}
    >
      <div className="absolute left-4 top-4 z-10 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow">
        Schematic prototype map — not final GIS output
      </div>

      <svg
        viewBox="0 0 700 450"
        className="h-full w-full"
        style={{ minHeight: height }}
      >
        {/* Schematic drainage / river context */}
        <path
          d="M0 180 C140 135 205 200 330 165 C455 128 560 182 700 143"
          fill="none"
          stroke="#4CA8CE"
          strokeWidth="12"
          opacity=".55"
        />

        <path
          d="M0 292 C130 260 270 310 410 276 C540 246 620 275 700 260"
          fill="none"
          stroke="#62B6C7"
          strokeWidth="7"
          opacity=".45"
        />

        {wetlands.map((wetland, index) => {
          const [labelX, labelY] = labelPositions[index]

          const isSelected =
            selected?.wetlandId === wetland.wetlandId

          return (
            <g
              key={wetland.wetlandId}
              onClick={() => onSelect?.(wetland)}
              className="cursor-pointer"
            >
              <path
                d={shapes[index]}
                fill={colorForCondition(wetland.condition)}
                fillOpacity=".88"
                stroke={isSelected ? '#0F2E28' : '#2C625C'}
                strokeWidth={isSelected ? 4 : 1.5}
                className={isSelected ? 'pulse-zone' : ''}
              />

              <text
                x={labelX}
                y={labelY}
                fontSize="11"
                fontWeight="700"
                fill="#113D38"
              >
                {wetland.wetlandId}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-600 shadow-sm">
        <span>● Stable</span>
        <span>● Seasonal</span>
        <span>● Fragmented</span>
        <span>● Persistent Loss</span>
      </div>
    </div>
  )
}