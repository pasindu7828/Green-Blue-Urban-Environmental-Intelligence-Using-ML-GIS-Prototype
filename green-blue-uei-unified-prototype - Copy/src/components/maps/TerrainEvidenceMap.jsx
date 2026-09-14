import { terrainEvidenceZones } from '../../data/wetlandData'

const zoneShapes = {
  'A-001':
    'M95 95 C132 70 179 76 194 111 C210 147 178 170 137 165 C102 160 74 125 95 95Z',

  'A-002':
    'M270 72 C307 51 351 64 365 99 C378 132 352 157 314 152 C277 147 248 102 270 72Z',

  'A-003':
    'M445 91 C480 66 527 77 542 112 C555 145 528 170 491 165 C457 161 427 123 445 91Z',

  'A-004':
    'M165 270 C201 240 246 252 259 287 C270 319 242 344 205 338 C170 332 143 298 165 270Z',
}

const labelPositions = {
  'A-001': { x: 122, y: 125 },
  'A-002': { x: 294, y: 110 },
  'A-003': { x: 469, y: 126 },
  'A-004': { x: 190, y: 300 },
}


function getValue(zone, layer) {
  if (layer === 'relativeElevation') {
    return zone.relativeElevation
  }

  if (layer === 'elevation') {
    return zone.meanElevation
  }

  if (layer === 'slope') {
    return zone.meanSlope
  }

  if (layer === 'twi') {
    return zone.twi
  }

  if (layer === 'flowAccumulation') {
    return zone.flowAccumulation
  }

  if (layer === 'depressionIndex') {
    return zone.depressionIndex
  }

  if (layer === 'drainDistance') {
    return zone.drainDistance
  }

  if (layer === 'builtupPct') {
    return zone.builtupPct
  }

  return 0
}


function getLayerRange(layer) {
  const values = terrainEvidenceZones.map((zone) =>
    getValue(zone, layer),
  )

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}


function normalizedValue(value, min, max) {
  if (max === min) return 0.5

  return (value - min) / (max - min)
}


function evidenceColor(value, layer) {
  const { min, max } = getLayerRange(layer)

  let normalized = normalizedValue(value, min, max)

  // For relative elevation and drain distance,
  // lower values may represent stronger lowland /
  // drainage-related susceptibility evidence.
  if (
    layer === 'relativeElevation' ||
    layer === 'drainDistance'
  ) {
    normalized = 1 - normalized
  }

  if (normalized >= 0.75) return '#DC2626'
  if (normalized >= 0.5) return '#F97316'
  if (normalized >= 0.25) return '#EAB308'

  return '#22C55E'
}


function formatValue(value, layer) {
  if (layer === 'relativeElevation') {
    return `${value} m`
  }

  if (layer === 'elevation') {
    return `${value} m`
  }

  if (layer === 'slope') {
    return `${value}°`
  }

  if (layer === 'twi') {
    return value
  }

  if (layer === 'flowAccumulation') {
    return value
  }

  if (layer === 'depressionIndex') {
    return value
  }

  if (layer === 'drainDistance') {
    return `${value} m`
  }

  if (layer === 'builtupPct') {
    return `${value}%`
  }

  return value
}


const layerLabels = {
  relativeElevation: 'Relative Lowland',
  elevation: 'Mean Elevation',
  slope: 'Mean Slope',
  twi: 'Topographic Wetness Index',
  flowAccumulation: 'Flow Accumulation',
  depressionIndex: 'Depression Index',
  drainDistance: 'Drain Distance',
  builtupPct: 'Built-up Percentage',
}


export default function TerrainEvidenceMap({
  selectedZone,
  onSelectZone,
  activeLayer = 'relativeElevation',
  showDrainage = true,
  showEvents = true,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#EAF3F1]">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-teal-800 shadow">
        {layerLabels[activeLayer]}
      </div>


      <svg
        viewBox="0 0 700 450"
        className="h-full min-h-[520px] w-full"
      >
        {/* Kaduwela schematic boundary */}
        <path
          d="M65 52 C160 20 266 42 350 29 C451 16 557 45 616 107 C662 156 657 245 620 324 C579 406 467 418 360 404 C250 389 142 416 79 344 C22 279 24 142 65 52Z"
          fill="#F8FAFC"
          stroke="#94A3B8"
          strokeWidth="3"
          strokeDasharray="8 6"
        />


        {/* Drainage */}
        {showDrainage && (
          <>
            <path
              d="M0 218 C125 178 238 233 354 195 C478 154 576 209 700 166"
              fill="none"
              stroke="#3B9EC2"
              strokeWidth="11"
              opacity=".55"
            />

            <path
              d="M188 15 C202 99 238 159 228 236 C218 309 248 369 292 438"
              fill="none"
              stroke="#67BED0"
              strokeWidth="6"
              opacity=".42"
            />
          </>
        )}


        {/* Evidence zones */}
        {terrainEvidenceZones.map((zone) => {
          const value = getValue(zone, activeLayer)

          const color = evidenceColor(
            value,
            activeLayer,
          )

          const selected =
            selectedZone?.zoneId === zone.zoneId

          return (
            <g
              key={zone.zoneId}
              onClick={() => onSelectZone?.(zone)}
              className="cursor-pointer"
            >
              <path
                d={zoneShapes[zone.zoneId]}
                fill={color}
                fillOpacity=".72"
                stroke={selected ? '#0F172A' : color}
                strokeWidth={selected ? 4 : 2}
              />

              <text
                x={labelPositions[zone.zoneId].x}
                y={labelPositions[zone.zoneId].y}
                fontSize="10"
                fontWeight="800"
                fill="#FFFFFF"
              >
                {zone.zoneId}
              </text>

              <text
                x={labelPositions[zone.zoneId].x}
                y={labelPositions[zone.zoneId].y + 14}
                fontSize="8"
                fontWeight="700"
                fill="#FFFFFF"
              >
                {formatValue(value, activeLayer)}
              </text>
            </g>
          )
        })}


        {/* Historical event points */}
        {showEvents &&
          terrainEvidenceZones.map((zone, index) => {
            if (!zone.historicalEvents) return null

            const positions = [
              [158, 188],
              [354, 180],
              [505, 212],
              [222, 350],
            ]

            const [x, y] = positions[index]

            return (
              <g key={`event-${zone.zoneId}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#1E3A8A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="800"
                  fill="#FFFFFF"
                >
                  {zone.historicalEvents}
                </text>
              </g>
            )
          })}
      </svg>


      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] text-slate-600 shadow-sm">
        <div className="mb-2 font-semibold">
          Relative evidence intensity
        </div>

        <div className="flex flex-wrap gap-3">
          <LegendDot
            color="#22C55E"
            label="Lower"
          />

          <LegendDot
            color="#EAB308"
            label="Moderate"
          />

          <LegendDot
            color="#F97316"
            label="Higher"
          />

          <LegendDot
            color="#DC2626"
            label="Strongest"
          />
        </div>
      </div>


      <div className="absolute bottom-4 right-4 max-w-[245px] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[9px] leading-4 text-slate-500 shadow-sm">
        Prototype visualization only. Final terrain layers
        will be generated from DEM and municipal GIS data in
        QGIS rather than from schematic zones.
      </div>
    </div>
  )
}


function LegendDot({
  color,
  label,
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color }}
      />

      {label}
    </div>
  )
}