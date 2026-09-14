import { candidateWetlands } from '../../data/wetlandData'

const candidatePositions = {
  'CW-01': { x: 205, y: 150 },
  'CW-02': { x: 420, y: 125 },
  'CW-03': { x: 505, y: 280 },
  'CW-04': { x: 275, y: 315 },
}

const knownWetlands = [
  {
    id: 'W-01',
    path: 'M80 100 C110 70 155 74 168 105 C181 136 153 158 117 154 C85 150 63 125 80 100Z',
  },
  {
    id: 'W-02',
    path: 'M320 80 C350 58 392 67 405 101 C416 130 389 151 355 144 C326 139 302 106 320 80Z',
  },
  {
    id: 'W-03',
    path: 'M115 250 C148 222 191 235 204 269 C214 299 185 319 151 313 C119 308 94 276 115 250Z',
  },
]

function probabilityStyle(probability) {
  if (probability >= 0.85) {
    return {
      fill: '#0F766E',
      stroke: '#115E59',
    }
  }

  if (probability >= 0.7) {
    return {
      fill: '#F59E0B',
      stroke: '#B45309',
    }
  }

  return {
    fill: '#94A3B8',
    stroke: '#64748B',
  }
}

export default function CandidateWetlandMap({
  selectedCandidate,
  onSelectCandidate,
  showKnown = true,
  showCandidates = true,
  showProbability = true,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#E7F3F0]">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow">
        Candidate wetland probability prototype
      </div>

      <svg
        viewBox="0 0 700 450"
        className="h-full min-h-[500px] w-full"
      >
        {/* Schematic Kaduwela boundary */}
        <path
          d="M70 55 C160 22 270 42 345 32 C435 20 552 44 615 105 C665 154 654 246 620 319 C582 397 465 419 362 404 C258 390 143 416 83 343 C25 273 27 142 70 55Z"
          fill="#F8FAFC"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeDasharray="8 6"
        />

        {/* Drainage context */}
        <path
          d="M15 212 C130 173 230 236 345 195 C463 153 558 206 690 165"
          fill="none"
          stroke="#4CA8CE"
          strokeWidth="10"
          opacity=".5"
        />

        <path
          d="M180 25 C203 104 238 162 226 241 C219 301 235 360 281 425"
          fill="none"
          stroke="#6BC1D1"
          strokeWidth="5"
          opacity=".4"
        />

        {/* Known wetlands */}
        {showKnown &&
          knownWetlands.map((wetland) => (
            <g key={wetland.id}>
              <path
                d={wetland.path}
                fill="#3FA77C"
                fillOpacity=".7"
                stroke="#166534"
                strokeWidth="2"
              />

              <text
                x={
                  wetland.id === 'W-01'
                    ? 105
                    : wetland.id === 'W-02'
                      ? 340
                      : 137
                }
                y={
                  wetland.id === 'W-01'
                    ? 120
                    : wetland.id === 'W-02'
                      ? 110
                      : 280
                }
                fontSize="10"
                fontWeight="800"
                fill="#14532D"
              >
                {wetland.id}
              </text>
            </g>
          ))}

        {/* Candidate wetlands */}
        {showCandidates &&
          candidateWetlands.map((candidate) => {
            const position =
              candidatePositions[candidate.candidateId]

            const style = probabilityStyle(
              candidate.probability,
            )

            const selected =
              selectedCandidate?.candidateId ===
              candidate.candidateId

            const radius = showProbability
              ? 18 + candidate.probability * 18
              : 28

            return (
              <g
                key={candidate.candidateId}
                onClick={() =>
                  onSelectCandidate?.(candidate)
                }
                className="cursor-pointer"
              >
                {showProbability && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={radius + 9}
                    fill={style.fill}
                    fillOpacity=".13"
                  />
                )}

                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius}
                  fill={style.fill}
                  fillOpacity=".72"
                  stroke={
                    selected
                      ? '#0F172A'
                      : style.stroke
                  }
                  strokeWidth={selected ? 4 : 2}
                  strokeDasharray="6 4"
                />

                <text
                  x={position.x}
                  y={position.y - 2}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="#FFFFFF"
                >
                  {candidate.candidateId}
                </text>

                <text
                  x={position.x}
                  y={position.y + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  fill="#FFFFFF"
                >
                  {(candidate.probability * 100).toFixed(0)}%
                </text>
              </g>
            )
          })}
      </svg>

      <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-600 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-600" />
            Known wetland
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-700" />
            High probability
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            Moderate probability
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 max-w-[230px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] leading-4 text-slate-500 shadow-sm">
        Schematic prototype only. Final candidate polygons
        will be generated from Kaduwela-wide model
        predictions and QGIS spatial post-processing.
      </div>
    </div>
  )
}