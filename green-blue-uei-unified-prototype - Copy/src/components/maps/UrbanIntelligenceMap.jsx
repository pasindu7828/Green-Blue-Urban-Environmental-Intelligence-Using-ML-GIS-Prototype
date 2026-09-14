import { useMemo } from 'react'
import { CRS } from 'leaflet'

import {
  MapContainer,
  Popup,
  Rectangle,
  Tooltip,
} from 'react-leaflet'

import {
  GRID_COLS,
  GRID_ROWS,
  gnSummaries,
  mapLegends,
  urbanGridCells,
} from '../../data/urbanData'

import {
  DEFAULT_FORECAST_YEAR,
  getForecastConservationClass,
  getForecastConservationScore,
  getForecastConflictClass,
  getForecastInterventionPriority,
  getForecastPressureClass,
  getForecastPressureScore,
  getForecastProbability,
} from '../../utils/urbanForecast'

// ============================================================
// COLOUR HELPERS
// ============================================================

const pressureColors = {
  Low: '#77c593',
  Medium: '#e7d36f',
  High: '#ee9a55',
  'Very High': '#dc6661',
}

const suitabilityColors = {
  'Highly suitable': '#72bddd',
  'Moderately suitable': '#8ccca6',
  'Low suitability': '#e6c96e',
  'Caution / conservation-sensitive':
    '#dd716c',
}

const conservationColors = {
  Critical: '#b83e3e',
  High: '#e47b45',
  Monitoring: '#e5c95e',
  'Stable Green': '#4ea76d',
  'Lower Current Threat': '#a8d8b7',
}

// Supports both the original 2030 prototype
// conflict classes and the new multi-year classes.
const conflictColors = {
  // Existing 2030 prototype classes
  'Critical Forecast–Planning Conflict':
    '#bd3f42',

  'Development Caution':
    '#e58a43',

  'Conservation Priority':
    '#4b9b66',

  'Managed Growth Opportunity':
    '#4e9ec0',

  'Monitoring / Low Urgency':
    '#b9c5c2',

  // New multi-year forecast classes
  'High Planning Conflict':
    '#bd3f42',

  'Moderate Planning Conflict':
    '#e58a43',

  'Conservation Caution':
    '#4b9b66',

  'Growth–Suitability Alignment':
    '#4e9ec0',

  'Low Conflict':
    '#b9c5c2',
}

// ============================================================
// HISTORICAL GREEN COLOURS
// ============================================================

function greenCoverColor(value) {
  if (value >= 65) {
    return '#3f8f58'
  }

  if (value >= 50) {
    return '#69ad72'
  }

  if (value >= 35) {
    return '#9ac783'
  }

  if (value >= 20) {
    return '#d5d98a'
  }

  return '#e4b56b'
}

function greenLossColor(value) {
  if (value >= 18) {
    return '#c94f45'
  }

  if (value >= 14) {
    return '#e47650'
  }

  if (value >= 10) {
    return '#e9a259'
  }

  if (value >= 6) {
    return '#e7cf75'
  }

  return '#9fca87'
}

function greenToBuiltColor(value) {
  if (value >= 12) {
    return '#c64e45'
  }

  if (value >= 9) {
    return '#e2734d'
  }

  if (value >= 6) {
    return '#eaa15d'
  }

  if (value >= 3) {
    return '#e4cf79'
  }

  return '#acd39a'
}

// ============================================================
// SAFE NUMBER
// ============================================================

function safeNumber(
  value,
  fallback = 0,
) {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

// ============================================================
// AVERAGE
// ============================================================

function average(
  items,
  getter,
) {
  if (!items.length) return 0

  return (
    items.reduce(
      (sum, item) =>
        sum +
        safeNumber(
          getter(item),
        ),
      0,
    ) / items.length
  )
}

// ============================================================
// DOMINANT CLASS
// ============================================================

function dominantClass(values) {
  if (!values.length) {
    return null
  }

  const counts = {}

  values.forEach((value) => {
    counts[value] =
      (counts[value] || 0) + 1
  })

  return Object.entries(counts)
    .sort(
      (a, b) =>
        b[1] - a[1],
    )[0]?.[0]
}

// ============================================================
// BUILD DYNAMIC GN / LOCALITY SUMMARIES
// ============================================================

function buildForecastGnSummaries(
  forecastYear,
) {
  return gnSummaries.map(
    (summary) => {
      const cells =
        urbanGridCells.filter(
          (cell) =>
            cell.gnId ===
            summary.id,
        )

      if (!cells.length) {
        return summary
      }

      const pressureScore =
        Math.round(
          average(
            cells,
            (cell) =>
              getForecastPressureScore(
                cell,
                forecastYear,
              ),
          ),
        )

      const pressureProbability =
        average(
          cells,
          (cell) =>
            getForecastProbability(
              cell,
              forecastYear,
            ),
        )

      const pressureClasses =
        cells.map((cell) =>
          getForecastPressureClass(
            cell,
            forecastYear,
          ),
        )

      const conservationScore =
        Math.round(
          average(
            cells,
            (cell) =>
              getForecastConservationScore(
                cell,
                forecastYear,
              ),
          ),
        )

      const conservationClasses =
        cells.map((cell) =>
          getForecastConservationClass(
            cell,
            forecastYear,
          ),
        )

      const conflictClasses =
        cells.map((cell) =>
          getForecastConflictClass(
            cell,
            forecastYear,
          ),
        )

      const interventionClasses =
        cells.map((cell) =>
          getForecastInterventionPriority(
            cell,
            forecastYear,
          ),
        )

      const criticalConflictCells =
        cells.filter((cell) => {
          const conflict =
            getForecastConflictClass(
              cell,
              forecastYear,
            )

          return (
            conflict ===
              'High Planning Conflict' ||
            conflict ===
              'Critical Forecast–Planning Conflict'
          )
        }).length

      const criticalConservationCells =
        cells.filter((cell) => {
          const conservation =
            getForecastConservationClass(
              cell,
              forecastYear,
            )

          return (
            conservation ===
              'Critical' ||
            conservation ===
              'High'
          )
        }).length

      return {
        ...summary,

        forecastYear,

        pressureScore,

        pressureProbability:
          Number(
            pressureProbability.toFixed(
              3,
            ),
          ),

        pressureClass:
          dominantClass(
            pressureClasses,
          ),

        conservationScore,

        conservationClass:
          dominantClass(
            conservationClasses,
          ),

        conflictClass:
          dominantClass(
            conflictClasses,
          ),

        interventionPriority:
          dominantClass(
            interventionClasses,
          ),

        criticalConflictCells,

        criticalConservationCells,
      }
    },
  )
}

// ============================================================
// GRID MAP VALUE
// ============================================================

function getGridMapInfo(
  cell,
  mode,
  forecastYear,
) {
  // ----------------------------------------------------------
  // HISTORICAL GREEN COVER
  // ----------------------------------------------------------

  if (mode === 'green2015') {
    return {
      color:
        greenCoverColor(
          cell.green2015,
        ),

      label:
        `${cell.green2015}% green cover`,
    }
  }

  if (mode === 'green2020') {
    return {
      color:
        greenCoverColor(
          cell.green2020,
        ),

      label:
        `${cell.green2020}% green cover`,
    }
  }

  if (mode === 'green2025') {
    return {
      color:
        greenCoverColor(
          cell.green2025,
        ),

      label:
        `${cell.green2025}% green cover`,
    }
  }

  // ----------------------------------------------------------
  // HISTORICAL GREEN LOSS
  // ----------------------------------------------------------

  if (mode === 'greenLoss') {
    return {
      color:
        greenLossColor(
          cell.greenLoss,
        ),

      label:
        `${cell.greenLoss}% green loss`,
    }
  }

  // ----------------------------------------------------------
  // HISTORICAL GREEN → BUILT
  // ----------------------------------------------------------

  if (mode === 'greenToBuilt') {
    return {
      color:
        greenToBuiltColor(
          cell.greenToBuilt,
        ),

      label:
        `${cell.greenToBuilt}% green→built conversion`,
    }
  }

  // ----------------------------------------------------------
  // DEVELOPMENT SUITABILITY
  // Static / planning-based
  // ----------------------------------------------------------

  if (mode === 'suitability') {
    return {
      color:
        suitabilityColors[
          cell.suitabilityClass
        ] || '#d4d4d4',

      label:
        `${cell.suitabilityClass} · ${cell.suitabilityScore}/100`,
    }
  }

  // ----------------------------------------------------------
  // FORECAST-INFORMED CONSERVATION
  // ----------------------------------------------------------

  if (mode === 'conservation') {
    const conservationClass =
      getForecastConservationClass(
        cell,
        forecastYear,
      )

    const conservationScore =
      getForecastConservationScore(
        cell,
        forecastYear,
      )

    return {
      color:
        conservationColors[
          conservationClass
        ] || '#d4d4d4',

      label:
        `${conservationClass} · ${conservationScore}/100`,
    }
  }

  // ----------------------------------------------------------
  // FORECAST–PLANNING CONFLICT
  // ----------------------------------------------------------

  if (mode === 'conflict') {
    const conflictClass =
      getForecastConflictClass(
        cell,
        forecastYear,
      )

    return {
      color:
        conflictColors[
          conflictClass
        ] || '#d4d4d4',

      label:
        conflictClass,
    }
  }

  // ----------------------------------------------------------
  // DEFAULT = MULTI-YEAR URBANIZATION PRESSURE
  // ----------------------------------------------------------

  const pressureClass =
    getForecastPressureClass(
      cell,
      forecastYear,
    )

  const probability =
    getForecastProbability(
      cell,
      forecastYear,
    )

  return {
    color:
      pressureColors[
        pressureClass
      ] || '#d4d4d4',

    label:
      `${pressureClass} · ${Math.round(
        probability * 100,
      )}%`,
  }
}

// ============================================================
// GN / LOCALITY MAP VALUE
// ============================================================

function getGnMapInfo(
  summary,
  mode,
) {
  // ----------------------------------------------------------
  // GREEN 2015
  // ----------------------------------------------------------

  if (mode === 'green2015') {
    return {
      color:
        greenCoverColor(
          summary.green2015,
        ),

      label:
        `${summary.green2015}% green cover`,
    }
  }

  // ----------------------------------------------------------
  // GREEN 2020
  // ----------------------------------------------------------

  if (mode === 'green2020') {
    return {
      color:
        greenCoverColor(
          summary.green2020,
        ),

      label:
        `${summary.green2020}% green cover`,
    }
  }

  // ----------------------------------------------------------
  // GREEN 2025
  // ----------------------------------------------------------

  if (mode === 'green2025') {
    return {
      color:
        greenCoverColor(
          summary.green2025,
        ),

      label:
        `${summary.green2025}% green cover`,
    }
  }

  // ----------------------------------------------------------
  // GREEN LOSS
  // ----------------------------------------------------------

  if (mode === 'greenLoss') {
    const loss = Math.max(
      0,
      safeNumber(
        summary.green2015,
      ) -
        safeNumber(
          summary.green2025,
        ),
    )

    return {
      color:
        greenLossColor(loss),

      label:
        `${loss.toFixed(1)}% green loss`,
    }
  }

  // ----------------------------------------------------------
  // GREEN → BUILT
  // ----------------------------------------------------------

  if (mode === 'greenToBuilt') {
    return {
      color:
        greenToBuiltColor(
          summary.greenToBuilt,
        ),

      label:
        `${summary.greenToBuilt}% green→built conversion`,
    }
  }

  // ----------------------------------------------------------
  // SUITABILITY
  // ----------------------------------------------------------

  if (mode === 'suitability') {
    return {
      color:
        suitabilityColors[
          summary.suitabilityClass
        ] || '#d4d4d4',

      label:
        `${summary.suitabilityClass} · ${summary.suitabilityScore}/100`,
    }
  }

  // ----------------------------------------------------------
  // CONSERVATION
  // ----------------------------------------------------------

  if (mode === 'conservation') {
    return {
      color:
        conservationColors[
          summary.conservationClass
        ] || '#d4d4d4',

      label:
        `${summary.conservationClass} · ${summary.conservationScore}/100`,
    }
  }

  // ----------------------------------------------------------
  // CONFLICT
  // ----------------------------------------------------------

  if (mode === 'conflict') {
    return {
      color:
        conflictColors[
          summary.conflictClass
        ] || '#d4d4d4',

      label:
        summary.conflictClass,
    }
  }

  // ----------------------------------------------------------
  // DEFAULT = PRESSURE
  // ----------------------------------------------------------

  return {
    color:
      pressureColors[
        summary.pressureClass
      ] || '#d4d4d4',

    label:
      `${summary.pressureClass} · ${summary.pressureScore}/100`,
  }
}

// ============================================================
// LEGENDS
// ============================================================

const greenCoverLegend = [
  {
    label:
      'Very high green cover',
    color: '#3f8f58',
  },
  {
    label:
      'High green cover',
    color: '#69ad72',
  },
  {
    label:
      'Moderate green cover',
    color: '#9ac783',
  },
  {
    label:
      'Low green cover',
    color: '#d5d98a',
  },
  {
    label:
      'Very low green cover',
    color: '#e4b56b',
  },
]

const greenLossLegend = [
  {
    label:
      'Very high loss',
    color: '#c94f45',
  },
  {
    label:
      'High loss',
    color: '#e47650',
  },
  {
    label:
      'Moderate loss',
    color: '#e9a259',
  },
  {
    label:
      'Low loss',
    color: '#e7cf75',
  },
  {
    label:
      'Stable / low change',
    color: '#9fca87',
  },
]

const greenToBuiltLegend = [
  {
    label:
      'Very high conversion',
    color: '#c64e45',
  },
  {
    label:
      'High conversion',
    color: '#e2734d',
  },
  {
    label:
      'Moderate conversion',
    color: '#eaa15d',
  },
  {
    label:
      'Low conversion',
    color: '#e4cf79',
  },
  {
    label:
      'Very low conversion',
    color: '#acd39a',
  },
]

// Multi-year conflict legend
const forecastConflictLegend = [
  {
    label:
      'High planning conflict',
    color: '#bd3f42',
  },
  {
    label:
      'Moderate planning conflict',
    color: '#e58a43',
  },
  {
    label:
      'Conservation caution',
    color: '#4b9b66',
  },
  {
    label:
      'Growth–suitability alignment',
    color: '#4e9ec0',
  },
  {
    label:
      'Low conflict',
    color: '#b9c5c2',
  },
]

// ============================================================
// GET LEGEND
// ============================================================

function getLegend(
  mode,
  forecastYear,
) {
  if (
    mode === 'green2015' ||
    mode === 'green2020' ||
    mode === 'green2025'
  ) {
    return greenCoverLegend
  }

  if (mode === 'greenLoss') {
    return greenLossLegend
  }

  if (mode === 'greenToBuilt') {
    return greenToBuiltLegend
  }

  if (mode === 'suitability') {
    return mapLegends.suitability
  }

  if (mode === 'conservation') {
    return mapLegends.conservation
  }

  if (mode === 'conflict') {
    return mapLegends.conflict
    }

  return mapLegends.pressure
}

// ============================================================
// MAP TITLE
// ============================================================

function modeTitle(
  mode,
  forecastYear,
) {
  const titles = {
    green2015:
      'Green Cover · 2015',

    green2020:
      'Green Cover · 2020',

    green2025:
      'Green Cover · 2025',

    greenLoss:
      'Historical Green Loss',

    greenToBuilt:
      'Green → Built Transition',

    suitability:
      'Development Suitability',
  }

  if (mode === 'pressure') {
    return `${forecastYear} Urbanization Pressure`
  }

  if (mode === 'conservation') {
    return `${forecastYear} Green Conservation Priority`
  }

  if (mode === 'conflict') {
    return `${forecastYear} Forecast–Planning Conflict`
  }

  return (
    titles[mode] ||
    `${forecastYear} Urbanization Pressure`
  )
}

// ============================================================
// COMPONENT
// ============================================================

export default function UrbanIntelligenceMap({
  mode = 'pressure',
  viewMode = 'grid',
  selectedId = null,
  highlightGnId = null,
  onSelect,
  height = 470,
  showLegend = true,
  forecastYear = DEFAULT_FORECAST_YEAR,
}) {
  // ----------------------------------------------------------
  // LEGEND
  // ----------------------------------------------------------

  const legend = useMemo(
    () =>
      getLegend(
        mode,
        forecastYear,
      ),
    [
      mode,
      forecastYear,
    ],
  )

  // ----------------------------------------------------------
  // DYNAMIC GN SUMMARIES
  // ----------------------------------------------------------

  const forecastGnSummaries =
    useMemo(
      () =>
        buildForecastGnSummaries(
          forecastYear,
        ),
      [forecastYear],
    )

  // ----------------------------------------------------------
  // GN LOOKUP
  // ----------------------------------------------------------

  const gnLookup = useMemo(
    () =>
      Object.fromEntries(
        forecastGnSummaries.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    [forecastGnSummaries],
  )

  // ----------------------------------------------------------
  // FIRST CELL PER GN
  // ----------------------------------------------------------

  const firstCellByGn =
    useMemo(() => {
      const lookup = {}

      urbanGridCells.forEach(
        (cell) => {
          if (
            !lookup[cell.gnId]
          ) {
            lookup[cell.gnId] =
              cell.gridId
          }
        },
      )

      return lookup
    }, [])

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#eaf1ef]"
      style={{
        height,
      }}
    >
      {/* ===================================================== */}
      {/* MAP TITLE */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2 shadow-sm backdrop-blur">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
          {viewMode === 'grid'
            ? 'Fine-scale grid view'
            : 'GN / locality summary view'}
        </div>

        <div className="mt-0.5 text-sm font-bold text-slate-800">
          {modeTitle(
            mode,
            forecastYear,
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* PROTOTYPE BADGE */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute right-4 top-4 z-[500] hidden rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-[10px] font-semibold text-amber-700 shadow-sm md:block">
        Prototype spatial data
      </div>

      {/* ===================================================== */}
      {/* LEAFLET MAP */}
      {/* ===================================================== */}

      <MapContainer
        crs={CRS.Simple}
        bounds={[
            [-0.35, -0.35],
            [
            GRID_ROWS + 0.35,
            GRID_COLS + 0.35,
            ],
        ]}
        boundsOptions={{
            padding: [25, 25],
        }}
        minZoom={2}
        maxZoom={7}
        zoomSnap={0.25}
        scrollWheelZoom={false}
        doubleClickZoom
        className="h-full w-full"
        zoomControl={false}
        >
        {urbanGridCells.map(
          (cell) => {
            const summary =
              gnLookup[
                cell.gnId
              ]

            const mapInfo =
              viewMode === 'gn'
                ? getGnMapInfo(
                    summary,
                    mode,
                  )
                : getGridMapInfo(
                    cell,
                    mode,
                    forecastYear,
                  )

            const activeId =
              viewMode === 'gn'
                ? cell.gnId
                : cell.gridId

            const isSelected =
              selectedId ===
              activeId

            const isGnHighlighted =
                viewMode === 'grid' &&
                highlightGnId &&
                cell.gnId === highlightGnId

            const isFirstGnCell =
              firstCellByGn[
                cell.gnId
              ] ===
              cell.gridId

            // -----------------------------------------------
            // DYNAMIC FORECAST VALUES FOR POPUP
            // -----------------------------------------------

            const pressureProbability =
              getForecastProbability(
                cell,
                forecastYear,
              )

            const pressureClass =
              getForecastPressureClass(
                cell,
                forecastYear,
              )

            const conservationClass =
              getForecastConservationClass(
                cell,
                forecastYear,
              )

            const conservationScore =
              getForecastConservationScore(
                cell,
                forecastYear,
              )

            const conflictClass =
              getForecastConflictClass(
                cell,
                forecastYear,
              )

            const interventionPriority =
              getForecastInterventionPriority(
                cell,
                forecastYear,
              )

            return (
              <Rectangle
                key={cell.gridId}
                bounds={[
                  [
                    cell.row,
                    cell.col,
                  ],

                  [
                    cell.row +
                      0.94,

                    cell.col +
                      0.94,
                  ],
                ]}
                pathOptions={{
                  color:
                    isSelected
                        ? '#102c28'
                        : isGnHighlighted
                        ? '#0f766e'
                        : viewMode === 'gn'
                            ? 'rgba(255,255,255,.25)'
                            : 'rgba(255,255,255,.7)',

                    weight:
                    isSelected
                        ? 3
                        : isGnHighlighted
                        ? 2
                        : viewMode === 'gn'
                            ? 0.4
                            : 0.7,

                  fillColor:
                    mapInfo.color,

                  fillOpacity:
                    isSelected
                      ? 0.92
                      : 0.8,
                }}
                eventHandlers={{
                  click: () =>
                    onSelect?.(
                      viewMode ===
                        'gn'
                        ? summary
                        : cell,
                    ),
                }}
              >
                {/* =========================================== */}
                {/* GRID TOOLTIP */}
                {/* =========================================== */}

                {viewMode ===
                  'grid' && (
                  <Tooltip
                    direction="top"
                    opacity={0.96}
                  >
                    <div className="min-w-[160px] text-xs leading-5">
                      <b>
                        {
                          cell.gridId
                        }
                      </b>

                      <br />

                      {
                        cell.gnDivision
                      }

                      <br />

                      {
                        mapInfo.label
                      }
                    </div>
                  </Tooltip>
                )}

                {/* =========================================== */}
                {/* GN LABEL */}
                {/* =========================================== */}

                {viewMode ===
                  'gn' &&
                  isFirstGnCell && (
                    <Tooltip
                      permanent
                      direction="center"
                      opacity={
                        0.94
                      }
                      className="urban-gn-label"
                    >
                      <div className="text-center text-[10px] font-bold leading-4">
                        {
                          summary.gnDivision
                        }
                      </div>
                    </Tooltip>
                  )}

                {/* =========================================== */}
                {/* POPUP */}
                {/* =========================================== */}

                <Popup>
                  {viewMode ===
                  'grid' ? (
                    <div className="min-w-[220px] text-xs leading-5">
                      <div className="mb-1 text-sm font-bold">
                        {
                          cell.gridId
                        }
                      </div>

                      Area:{' '}
                      {
                        cell.gnDivision
                      }

                      <br />

                      Green 2015:{' '}
                      {
                        cell.green2015
                      }
                      %

                      <br />

                      Green 2025:{' '}
                      {
                        cell.green2025
                      }
                      %

                      <br />

                      Green→Built:{' '}
                      {
                        cell.greenToBuilt
                      }
                      %

                      <br />

                      {forecastYear}{' '}
                      Pressure:{' '}
                      <b>
                        {Math.round(
                          pressureProbability *
                            100,
                        )}
                        %
                      </b>

                      <br />

                      Pressure class:{' '}
                      {
                        pressureClass
                      }

                      <br />

                      Suitability:{' '}
                      {
                        cell.suitabilityClass
                      }

                      <br />

                      {forecastYear}{' '}
                      Conservation:{' '}
                      {
                        conservationClass
                      }{' '}
                      (
                      {
                        conservationScore
                      }
                      /100)

                      <br />

                      Conflict:{' '}
                      {
                        conflictClass
                      }

                      <br />

                      Intervention:{' '}
                      {
                        interventionPriority
                      }
                    </div>
                  ) : (
                    <div className="min-w-[220px] text-xs leading-5">
                      <div className="mb-1 text-sm font-bold">
                        {
                          summary.gnDivision
                        }
                      </div>

                      Prototype summary area

                      <br />

                      Grid cells:{' '}
                      {
                        summary.cellCount
                      }

                      <br />

                      Green change:{' '}
                      {
                        summary.greenChange
                      }
                      %

                      <br />

                      {forecastYear}{' '}
                      Pressure:{' '}
                      {
                        summary.pressureScore
                      }
                      /100

                      <br />

                      Pressure class:{' '}
                      {
                        summary.pressureClass
                      }

                      <br />

                      Suitability:{' '}
                      {
                        summary.suitabilityClass
                      }

                      <br />

                      {forecastYear}{' '}
                      Conservation:{' '}
                      {
                        summary.conservationClass
                      }

                      <br />

                      Conflict:{' '}
                      {
                        summary.conflictClass
                      }

                      <br />

                      High conflict cells:{' '}
                      {
                        summary.criticalConflictCells
                      }
                    </div>
                  )}
                </Popup>
              </Rectangle>
            )
          },
        )}
      </MapContainer>

      {/* ===================================================== */}
      {/* LEGEND */}
      {/* ===================================================== */}

      {showLegend && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-[500] max-w-[220px] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Legend
          </div>

          <div className="space-y-1.5">
            {legend.map(
              (item) => (
                <div
                  key={
                    item.label
                  }
                  className="flex items-center gap-2 text-[10px] leading-4 text-slate-600"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-[3px] border border-black/10"
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* FOOT NOTE */}
      {/* ===================================================== */}

      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden max-w-[300px] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[9px] leading-4 text-slate-500 shadow-sm lg:block">
        Prototype analytical grid. GN/locality
        summaries are illustrative until
        official administrative boundaries are
        integrated.
      </div>
    </div>
  )
}