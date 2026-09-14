import { useMemo, useState } from 'react'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import HeatGridMap from '../../components/maps/HeatGridMap'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

import {
  heatZones,
  trendStats,
  zoneHistory,
} from '../../data/heatData'

import { useApp } from '../../contexts/AppContext'


const variant = (trend) =>
  trend === 'Persistent Hot'
    ? 'red'
    : trend === 'Intensifying'
      ? 'orange'
      : trend === 'Emerging'
        ? 'amber'
        : trend === 'Diminishing'
          ? 'green'
          : 'blue'


export default function TrendAnalysis() {
  const { showToast } = useApp()

  const [category, setCategory] = useState('All')
  const [review, setReview] = useState('All')
  const [query, setQuery] = useState('')

  // Default selected zone = KD-0847
  const [selected, setSelected] = useState(heatZones[846])

  const [reviewedOverride, setReviewedOverride] =
    useState(false)


  const filtered = useMemo(() => {
    return heatZones.filter((zone) => {
      const matchesCategory =
        category === 'All' ||
        zone.trend === category

      const matchesReview =
        review === 'All' ||
        (
          review === 'Reviewed'
            ? reviewedOverride || zone.reviewed
            : !(reviewedOverride || zone.reviewed)
        )

      const matchesQuery =
        !query ||
        zone.zoneId
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        zone.areaName
          .toLowerCase()
          .includes(query.toLowerCase())

      return (
        matchesCategory &&
        matchesReview &&
        matchesQuery
      )
    })
  }, [
    category,
    review,
    query,
    reviewedOverride,
  ])


  const handleZoneSelection = (zoneId) => {
    const zone = heatZones.find(
      (item) => item.zoneId === zoneId,
    )

    if (zone) {
      setSelected(zone)
    }
  }


  return (
    <div>
      {/* =====================================================
          PAGE HEADER + FILTERS
      ===================================================== */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[24px] font-bold">
            Trend Analysis
          </h1>

          <p className="text-[11px] text-slate-500">
            2015–2025 Mann-Kendall trend classification ·
            prototype data
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* TREND CATEGORY */}
          <select
            className="control w-auto"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            title="Trend category"
          >
            <option value="All">
              All trend categories
            </option>

            {trendStats.map((trend) => (
              <option
                key={trend.name}
                value={trend.name}
              >
                {trend.name}
              </option>
            ))}
          </select>


          {/* REVIEW STATUS */}
          <select
            className="control w-auto"
            value={review}
            onChange={(event) =>
              setReview(event.target.value)
            }
            title="Review status"
          >
            <option value="All">
              All review statuses
            </option>

            <option value="Reviewed">
              Reviewed
            </option>

            <option value="Not Reviewed">
              Not Reviewed
            </option>
          </select>


          {/* =================================================
              NEW — ZONE SELECTION DROPDOWN
          ================================================= */}
          <select
            className="control w-[235px]"
            value={selected?.zoneId || ''}
            onChange={(event) =>
              handleZoneSelection(event.target.value)
            }
            title="Select grid zone"
          >
            {heatZones.map((zone) => (
              <option
                key={zone.zoneId}
                value={zone.zoneId}
              >
                {zone.zoneId} — {zone.areaName}
              </option>
            ))}
          </select>


          {/* SEARCH */}
          <input
            className="control w-[190px]"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search zone or area"
          />


          {/* MARK REVIEWED */}
          <Button
            variant="secondary"
            onClick={() => {
              setReviewedOverride(true)

              showToast(
                'All demo trend records marked as reviewed.',
              )
            }}
          >
            Mark all reviewed
          </Button>
        </div>
      </div>


      {/* =====================================================
          TREND SUMMARY CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {trendStats.map((trend) => (
          <div
            key={trend.name}
            className="card p-4"
          >
            <div
              className="h-1.5 w-8 rounded-full"
              style={{
                background: trend.color,
              }}
            />

            <div className="mt-3 text-[10px] font-semibold uppercase text-slate-500">
              {trend.name}
            </div>

            <div className="mt-1 text-[28px] font-bold">
              {trend.value}
            </div>

            <div className="text-[10px] text-slate-400">
              {(
                (trend.value / 2194) *
                100
              ).toFixed(1)}
              % of grid
            </div>
          </div>
        ))}
      </div>


      {/* =====================================================
          TREND MAP + HIGHLIGHTED ZONES
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
        {/* MAP */}
        <div className="card-pad">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="section-title">
                Trend classification map
              </h2>

              <p className="mb-4 text-[11px] text-slate-500">
                Categorised by direction and significance
                of LST change
              </p>
            </div>

            {selected && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
                  Selected Zone
                </p>

                <p className="mt-0.5 text-[11px] font-bold text-slate-800">
                  {selected.zoneId} —{' '}
                  {selected.areaName}
                </p>
              </div>
            )}
          </div>

          <HeatGridMap
            mode="trend"
            height={520}
            selectedId={selected?.zoneId}
            onSelect={setSelected}
          />
        </div>


        {/* HIGHLIGHTED ZONE LIST */}
        <div className="card-pad">
          <h2 className="section-title">
            Highlighted zones
          </h2>

          <p className="mb-3 text-[11px] text-slate-500">
            Select a zone to view its 11-year series
          </p>

          <div className="max-h-[470px] space-y-3 overflow-y-auto pr-1">
            {filtered
              .slice(0, 14)
              .map((zone) => (
                <button
                  key={zone.zoneId}
                  onClick={() =>
                    setSelected(zone)
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected?.zoneId ===
                    zone.zoneId
                      ? 'border-teal-400 bg-teal-50/40 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <b className="text-[12px]">
                      Zone {zone.zoneId}
                    </b>

                    <Badge
                      variant={variant(
                        zone.trend,
                      )}
                    >
                      {zone.trend}
                    </Badge>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500">
                    {zone.areaName}
                    {' · '}
                    {zone.reviewed ||
                    reviewedOverride
                      ? 'Reviewed'
                      : 'Not reviewed'}
                  </div>
                </button>
              ))}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-[11px] font-semibold text-slate-600">
                  No zones match the current filters.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setCategory('All')
                    setReview('All')
                    setQuery('')
                  }}
                  className="mt-2 text-[10px] font-semibold text-teal-700 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* =====================================================
          SELECTED ZONE HISTORICAL CHART
      ===================================================== */}
      {selected && (
        <div className="mt-5 card-pad">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title">
                Selected zone historical LST —{' '}
                {selected.zoneId}
              </h2>

              <p className="text-[11px] text-slate-500">
                {selected.areaName}
                {' · '}
                {selected.trend}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-600">
                2015–2025
              </span>

              <Badge
                variant={variant(
                  selected.trend,
                )}
              >
                {selected.trend}
              </Badge>
            </div>
          </div>

          <div className="mt-4 h-[280px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={zoneHistory(selected)}
                margin={{
                  top: 10,
                  right: 20,
                  left: 5,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="year"
                  tick={{
                    fontSize: 10,
                    fill: '#64748b',
                  }}
                />

                <YAxis
                  domain={[
                    'dataMin - 1',
                    'dataMax + 1',
                  ]}
                  unit="°C"
                  tick={{
                    fontSize: 10,
                    fill: '#64748b',
                  }}
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(
                      2,
                    )}°C`,
                    'LST',
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border:
                      '1px solid #e2e8f0',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="lst"
                  stroke="#E0472B"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: '#E0472B',
                  }}
                  activeDot={{
                    r: 5,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}