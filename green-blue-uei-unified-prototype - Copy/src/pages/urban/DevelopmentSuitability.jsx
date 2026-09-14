import {
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  MapPinned,
  Navigation,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Trees,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  DisclaimerBadges,
  PageHeader,
  SuitabilityBadge,
} from '../../components/shared/UrbanUI'

import UrbanIntelligenceMap from '../../components/maps/UrbanIntelligenceMap'

import {
  gnSummaries,
  urbanGridCells,
} from '../../data/urbanData'

// ============================================================
// SUITABILITY COLOURS
// ============================================================

const suitabilityColours = {
  'Highly suitable': '#72bddd',

  'Moderately suitable': '#8ccca6',

  'Low suitability': '#e6c96e',

  'Caution / conservation-sensitive':
    '#dd716c',
}

// ============================================================
// SUITABILITY CRITERIA
// ============================================================

const criteria = [
  {
    key: 'planning',
    label:
      'Fewer Planning Constraints',
    shortLabel:
      'Planning Conditions',
    importance: 27,
    icon: ShieldCheck,
    explanation:
      'Fewer planning and environmental constraints improve suitability.',
  },

  {
    key: 'roadAccess',
    label: 'Road Accessibility',
    shortLabel:
      'Road Access',
    importance: 26,
    icon: Route,
    explanation:
      'Better road access can support managed development.',
  },

  {
    key: 'townAccess',
    label:
      'Access to Urban Centres',
    shortLabel:
      'Urban Centre Access',
    importance: 18,
    icon: Navigation,
    explanation:
      'Closer access to urban and growth centres improves accessibility.',
  },

  {
    key: 'terrain',
    label: 'Terrain Condition',
    shortLabel: 'Terrain',
    importance: 16,
    icon: Trees,
    explanation:
      'Lower slope generally provides better development conditions.',
  },

  {
    key: 'roadDensity',
    label: 'Road Network',
    shortLabel:
      'Road Network',
    importance: 13,
    icon: MapPinned,
    explanation:
      'Existing road connectivity supports access to development areas.',
  },
]

// ============================================================
// HELPERS
// ============================================================

function clamp(
  value,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      Number(value || 0),
    ),
  )
}

function average(
  items,
  getter,
) {
  if (!items.length) {
    return 0
  }

  return (
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          getter(item) || 0,
        ),
      0,
    ) / items.length
  )
}

// ============================================================
// GRID CRITERION SCORES
// ============================================================

function getCellCriterionScores(
  cell,
) {
  return {
    planning:
      Math.round(
        clamp(
          100 -
            Number(
              cell.planningConstraint ||
                0,
            ),
        ),
      ),

    roadAccess:
      Math.round(
        clamp(
          cell.roadAccess,
        ),
      ),

    townAccess:
      Math.round(
        clamp(
          100 -
            Math.min(
              Number(
                cell.distanceToTown ||
                  0,
              ) * 11,
              100,
            ),
        ),
      ),

    terrain:
      Math.round(
        clamp(
          100 -
            Number(
              cell.slope || 0,
            ) * 6,
        ),
      ),

    roadDensity:
      Math.round(
        clamp(
          cell.roadDensity,
        ),
      ),
  }
}

// ============================================================
// GN CRITERION SCORES
// ============================================================

function getGnCriterionScores(
  gnId,
) {
  const cells =
    urbanGridCells.filter(
      (cell) =>
        cell.gnId === gnId,
    )

  if (!cells.length) {
    return {
      planning: 0,
      roadAccess: 0,
      townAccess: 0,
      terrain: 0,
      roadDensity: 0,
    }
  }

  const scores =
    cells.map(
      (cell) =>
        getCellCriterionScores(
          cell,
        ),
    )

  return {
    planning:
      Math.round(
        average(
          scores,
          (item) =>
            item.planning,
        ),
      ),

    roadAccess:
      Math.round(
        average(
          scores,
          (item) =>
            item.roadAccess,
        ),
      ),

    townAccess:
      Math.round(
        average(
          scores,
          (item) =>
            item.townAccess,
        ),
      ),

    terrain:
      Math.round(
        average(
          scores,
          (item) =>
            item.terrain,
        ),
      ),

    roadDensity:
      Math.round(
        average(
          scores,
          (item) =>
            item.roadDensity,
        ),
      ),
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DevelopmentSuitability() {
  const [
    viewMode,
    setViewMode,
  ] = useState('grid')

  const [
    selected,
    setSelected,
  ] = useState(null)

  // ==========================================================
  // SUITABILITY CLASS SUMMARY
  // ==========================================================

  const suitabilitySummary =
    useMemo(() => {
      const classes = [
        'Highly suitable',
        'Moderately suitable',
        'Low suitability',
        'Caution / conservation-sensitive',
      ]

      return classes.map(
        (label) => ({
          label,

          count:
            urbanGridCells.filter(
              (cell) =>
                cell.suitabilityClass ===
                label,
            ).length,
        }),
      )
    }, [])

  // ==========================================================
  // GRID RANKING
  // ==========================================================

  const rankedCells =
    useMemo(() => {
      return [
        ...urbanGridCells,
      ].sort(
        (a, b) =>
          Number(
            b.suitabilityScore ||
              0,
          ) -
          Number(
            a.suitabilityScore ||
              0,
          ),
      )
    }, [])

  // ==========================================================
  // GN RANKING
  // ==========================================================

  const gnRanking =
    useMemo(() => {
      return [
        ...gnSummaries,
      ]
        .sort(
          (a, b) =>
            Number(
              b.suitabilityScore ||
                0,
            ) -
            Number(
              a.suitabilityScore ||
                0,
            ),
        )
        .map(
          (item) => ({
            id:
              item.id,

            area:
              item.gnDivision,

            score:
              Number(
                item.suitabilityScore ||
                  0,
              ),

            suitabilityClass:
              item.suitabilityClass,
          }),
        )
    }, [])

  // ==========================================================
  // SELECTED ITEM
  // ==========================================================

  const selectedItem =
    selected ||
    (viewMode === 'grid'
      ? rankedCells[0]
      : gnSummaries.find(
          (item) =>
            item.id ===
            gnRanking[0]?.id,
        ) ||
        gnSummaries[0])

  const selectedId =
    viewMode === 'grid'
      ? selectedItem?.gridId
      : selectedItem?.id

  // ==========================================================
  // SELECTED CRITERIA
  // ==========================================================

  const selectedCriteria =
    useMemo(() => {
      if (!selectedItem) {
        return []
      }

      const scores =
        viewMode === 'grid'
          ? getCellCriterionScores(
              selectedItem,
            )
          : getGnCriterionScores(
              selectedItem.id,
            )

      return criteria.map(
        (criterion) => ({
          ...criterion,

          score:
            scores[
              criterion.key
            ],
        }),
      )
    }, [
      selectedItem,
      viewMode,
    ])

  // ==========================================================
  // SELECTED SUITABILITY SCORE
  // ==========================================================

  const selectedSuitabilityScore =
    Number(
      selectedItem?.suitabilityScore ||
        0,
    )

  const selectedSuitabilityClass =
    selectedItem?.suitabilityClass ||
    'Low suitability'

  // ==========================================================
  // VIEW CHANGE
  // ==========================================================

  function changeView(mode) {
    setViewMode(mode)
    setSelected(null)
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <PageHeader
        eyebrow="Land Development Suitability"
        title="Where Is Development More Appropriate?"
        subtitle="Compare locations using planning conditions, road access, access to urban centres, terrain and road connectivity."
        right={
          <span className="badge-green">
            GIS-MCDA / AHP
          </span>
        }
      />

      <DisclaimerBadges />

      {/* ===================================================== */}
      {/* SIMPLE EXPLANATION */}
      {/* ===================================================== */}



      {/* ===================================================== */}
      {/* CLASS SUMMARY */}
      {/* ===================================================== */}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {suitabilitySummary.map(
          (item) => (
            <SuitabilitySummaryCard
              key={item.label}
              label={
                getSimpleClassName(
                  item.label,
                )
              }
              originalLabel={
                item.label
              }
              count={
                item.count
              }
              total={
                urbanGridCells.length
              }
              color={
                suitabilityColours[
                  item.label
                ]
              }
            />
          ),
        )}
      </div>

      {/* ===================================================== */}
      {/* MAIN MAP */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="section-title">
              Development Suitability
              Map
            </h2>

            <p className="muted mt-1 max-w-3xl">
              Select a grid cell or
              view average suitability
              by GN/locality area.
            </p>
          </div>

          {/* VIEW TOGGLE */}

          <div className="flex w-fit rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() =>
                changeView(
                  'grid',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                viewMode ===
                'grid'
                  ? 'bg-[#0F2E28] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              Grid View
            </button>

            <button
              type="button"
              onClick={() =>
                changeView(
                  'gn',
                )
              }
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                viewMode ===
                'gn'
                  ? 'bg-[#0F2E28] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              GN Summary
            </button>
          </div>
        </div>

        {/* MAP + SIMPLE DETAIL */}

        <div className="mt-5 grid gap-5 xl:h-[470px] xl:grid-cols-[minmax(0,1fr)_330px]">
          <UrbanIntelligenceMap
            mode="suitability"
            viewMode={
              viewMode
            }
            selectedId={
              selectedId
            }
            onSelect={
              setSelected
            }
            height={470}
          />

          <SelectedAreaPanel
            item={
              selectedItem
            }
            viewMode={
              viewMode
            }
            selectedCriteria={
              selectedCriteria
            }
          />
        </div>
      </section>

      {/* ===================================================== */}
      {/* WHY IS THIS AREA SUITABLE */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* ------------------------------------------------- */}
          {/* CRITERIA */}
          {/* ------------------------------------------------- */}

          <div>
            <div>
              <h2 className="section-title">
                Why Is This Area
                Suitable?
              </h2>

              <p className="muted mt-1">
                Higher scores mean better
                conditions for
                development. Importance
                shows how strongly each
                factor contributes to the
                final score.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {selectedCriteria.map(
                (criterion) => (
                  <SimpleCriterion
                    key={
                      criterion.key
                    }
                    criterion={
                      criterion
                    }
                  />
                ),
              )}
            </div>
          </div>

          {/* ------------------------------------------------- */}
          {/* FINAL SCORE */}
          {/* ------------------------------------------------- */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
              <SlidersHorizontal
                size={20}
              />
            </div>

            <div className="mt-4 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Combined Result
            </div>

            <h3 className="mt-2 text-lg font-bold text-emerald-950">
              Final Suitability Score
            </h3>

            <div className="mt-4 text-4xl font-bold text-emerald-900">
              {
                selectedSuitabilityScore
              }
              <span className="text-lg text-emerald-700">
                /100
              </span>
            </div>

            <div className="mt-4">
              <SuitabilityBadge
                value={
                  selectedSuitabilityClass
                }
              />
            </div>

            {/* SIMPLE FORMULA */}

            <div className="mt-6 rounded-xl bg-white p-4">
              <div className="text-center text-[11px] font-semibold leading-5 text-slate-600">
                Factor condition
                <span className="mx-2 text-emerald-600">
                  ×
                </span>
                Importance
                <span className="mx-2 text-emerald-600">
                  →
                </span>
                Final suitability
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-emerald-800">
              {
                buildSuitabilityMessage(
                  selectedSuitabilityClass,
                  selectedSuitabilityScore,
                )
              }
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* GN COMPARISON */}
      {/* ===================================================== */}

      <section className="card-pad mt-7">
        <div>
          <h2 className="section-title">
            Compare GN / Locality
            Areas
          </h2>

          <p className="muted mt-1">
            Higher bars indicate stronger
            average development
            suitability.
          </p>
        </div>

        <div className="mt-5 h-[360px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                gnRanking
              }
              layout="vertical"
              margin={{
                top: 5,
                right: 35,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={
                  false
                }
              />

              <XAxis
                type="number"
                domain={[
                  0,
                  100,
                ]}
                tick={{
                  fontSize: 10,
                }}
              />

              <YAxis
                type="category"
                dataKey="area"
                width={95}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip
                content={
                  <GnTooltip />
                }
              />

              <Bar
                dataKey="score"
                name="Suitability Score"
                fill="#4e9ec0"
                radius={[
                  0,
                  6,
                  6,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SuitabilitySummaryCard({
  label,
  originalLabel,
  count,
  total,
  color,
}) {
  const percent =
    total > 0
      ? (count / total) *
        100
      : 0

  return (
    <div className="card-pad">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            {label}
          </div>

          <div className="mt-2 text-3xl font-bold text-slate-900">
            {count}
          </div>

          <div className="mt-1 text-[10px] text-slate-400">
            {percent.toFixed(
              0,
            )}
            % of grid cells
          </div>
        </div>

        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
          style={{
            backgroundColor:
              color,
          }}
          title={
            originalLabel
          }
        >
          <MapPinned
            size={17}
          />
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(
              4,
              percent,
            )}%`,

            backgroundColor:
              color,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================
// SELECTED AREA PANEL
// ============================================================

function SelectedAreaPanel({
  item,
  viewMode,
  selectedCriteria,
}) {
  if (!item) {
    return null
  }

  const score =
    Number(
      item.suitabilityScore ||
        0,
    )

  const suitabilityClass =
    item.suitabilityClass ||
    'Low suitability'

  return (
    <div className="card-pad h-full min-h-0 overflow-y-auto">
      {/* AREA NAME */}

      <div className="eyebrow">
        {viewMode === 'grid'
          ? 'Selected Grid Cell'
          : 'Selected GN / Locality'}
      </div>

      <h3 className="mt-2 text-xl font-bold text-slate-900">
        {viewMode === 'grid'
          ? item.gridId
          : item.gnDivision}
      </h3>

      {viewMode ===
        'grid' && (
        <p className="mt-1 text-xs text-slate-500">
          {
            item.gnDivision
          }
        </p>
      )}

      {viewMode ===
        'gn' && (
        <p className="mt-1 text-xs text-slate-500">
          {
            item.cellCount
          }{' '}
          fine-scale grid cells
        </p>
      )}

      {/* CLASS */}

      <div className="mt-4">
        <SuitabilityBadge
          value={
            suitabilityClass
          }
        />
      </div>

      {/* SCORE */}

      <div className="mt-5 rounded-2xl bg-blue-50 p-5 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
          Suitability Score
        </div>

        <div className="mt-2 text-4xl font-bold text-blue-950">
          {score}
        </div>

        <div className="text-xs text-blue-700">
          /100
        </div>
      </div>

      {/* SIMPLE CONDITIONS */}

      <div className="mt-5">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Key Conditions
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {selectedCriteria
            .slice(
              0,
              4,
            )
            .map(
              (criterion) => {
                const Icon =
                  criterion.icon

                return (
                  <div
                    key={
                      criterion.key
                    }
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        size={13}
                        className="text-slate-400"
                      />

                      <div className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                        {
                          criterion.shortLabel
                        }
                      </div>
                    </div>

                    <div className="mt-2 text-sm font-bold text-slate-800">
                      {
                        criterion.score
                      }
                      /100
                    </div>
                  </div>
                )
              },
            )}
        </div>
      </div>

      {/* MESSAGE */}

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          What does this mean?
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          {
            buildSuitabilityMessage(
              suitabilityClass,
              score,
            )
          }
        </p>
      </div>
    </div>
  )
}

// ============================================================
// SIMPLE CRITERION
// ============================================================

function SimpleCriterion({
  criterion,
}) {
  const Icon =
    criterion.icon

  return (
    <div>
      {/* TOP */}

      <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-emerald-700">
            <Icon
              size={16}
            />
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800">
              {
                criterion.label
              }
            </div>

            <div className="mt-0.5 text-[10px] text-slate-400">
              Importance:{' '}
              <b>
                {
                  criterion.importance
                }
                %
              </b>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            {
              criterion.score
            }
            /100
          </div>

          <div className="text-[9px] text-slate-400">
            Area score
          </div>
        </div>
      </div>

      {/* BAR */}

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{
            width: `${criterion.score}%`,
          }}
        />
      </div>

      {/* EXPLANATION */}

      <p className="mt-2 text-[10px] leading-4 text-slate-500">
        {
          criterion.explanation
        }
      </p>
    </div>
  )
}

// ============================================================
// GN TOOLTIP
// ============================================================

function GnTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null
  }

  const item =
    payload[0]?.payload

  if (!item) {
    return null
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="font-bold text-slate-900">
        {item.area}
      </div>

      <div className="mt-2 text-slate-600">
        Suitability:{' '}
        <b>
          {item.score}/100
        </b>
      </div>

      <div className="mt-1 text-slate-500">
        {
          getSimpleClassName(
            item.suitabilityClass,
          )
        }
      </div>
    </div>
  )
}

// ============================================================
// SIMPLE CLASS NAME
// ============================================================

function getSimpleClassName(
  value,
) {
  if (
    value ===
    'Highly suitable'
  ) {
    return 'Highly Suitable'
  }

  if (
    value ===
    'Moderately suitable'
  ) {
    return 'Moderately Suitable'
  }

  if (
    value ===
    'Low suitability'
  ) {
    return 'Low Suitability'
  }

  return 'Caution / Sensitive'
}

// ============================================================
// SUITABILITY MESSAGE
// ============================================================

function buildSuitabilityMessage(
  suitabilityClass,
  score,
) {
  if (
    suitabilityClass ===
    'Highly suitable'
  ) {
    return `This area scores ${score}/100. Its current planning, accessibility and terrain conditions are comparatively favorable for managed development.`
  }

  if (
    suitabilityClass ===
    'Moderately suitable'
  ) {
    return `This area scores ${score}/100. Development may be possible, but some conditions still require planning review.`
  }

  if (
    suitabilityClass ===
    'Low suitability'
  ) {
    return `This area scores ${score}/100. Several conditions reduce its development suitability and require closer review.`
  }

  return `This area scores ${score}/100. Stronger planning or environmental constraints are present, so development requires greater caution.`
}