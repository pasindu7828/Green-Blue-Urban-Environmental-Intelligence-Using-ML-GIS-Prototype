import { useMemo, useState } from 'react'

import {
  Droplets,
  Layers,
  MapPin,
  Search,
} from 'lucide-react'

import WetlandMap from '../../components/maps/WetlandMap'
import Badge from '../../components/ui/Badge'

import { wetlands } from '../../data/wetlandData'


export default function WetlandInventory() {
  const [search, setSearch] = useState('')
  const [condition, setCondition] = useState('All')
  const [confidence, setConfidence] = useState('All')

  const [selectedWetland, setSelectedWetland] = useState(
    wetlands[0] || null,
  )


  // =========================================================
  // FILTERED WETLANDS
  // =========================================================
  const filteredWetlands = useMemo(() => {
    const query = search.trim().toLowerCase()

    return wetlands.filter((wetland) => {
      const matchesSearch =
        !query ||
        wetland.wetlandId.toLowerCase().includes(query) ||
        wetland.name.toLowerCase().includes(query) ||
        wetland.zone.toLowerCase().includes(query)

      const matchesCondition =
        condition === 'All' ||
        wetland.condition === condition

      const matchesConfidence =
        confidence === 'All' ||
        wetland.confidence === confidence

      return (
        matchesSearch &&
        matchesCondition &&
        matchesConfidence
      )
    })
  }, [search, condition, confidence])


  // =========================================================
  // SUMMARY
  // =========================================================
  const totalArea = useMemo(() => {
    return wetlands.reduce(
      (sum, wetland) => sum + wetland.currentArea,
      0,
    )
  }, [])


  const fragmentedCount = wetlands.filter(
    (wetland) =>
      wetland.condition === 'Fragmented' ||
      wetland.condition === 'Persistent Loss',
  ).length


  const highConfidenceCount = wetlands.filter(
    (wetland) => wetland.confidence === 'High',
  ).length


  // =========================================================
  // BADGES
  // =========================================================
  const conditionVariant = (value) => {
    if (value === 'Persistent Loss') return 'red'
    if (value === 'Fragmented') return 'amber'
    if (value === 'Seasonally Variable') return 'blue'
    return 'green'
  }


  const confidenceVariant = (value) => {
    if (value === 'High') return 'green'
    if (value === 'Moderate') return 'amber'
    return 'slate'
  }


  return (
    <div>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="mb-5">
        <div className="eyebrow">
          Part 1 · Wetland Intelligence
        </div>

        <h1 className="mt-1 text-[24px] font-bold tracking-[-.03em] text-slate-900">
          Wetland Inventory & Explorer
        </h1>

        <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500">
          Explore currently mapped urban wetlands within the
          Kaduwela Municipal Council area and review their
          current extent, condition, fragmentation and mapping
          confidence.
        </p>
      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card-pad">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Known Wetlands
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {wetlands.length}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Prototype reference inventory
              </p>
            </div>

            <Droplets
              size={22}
              className="text-teal-700"
            />
          </div>
        </div>


        <div className="card-pad">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Current Mapped Area
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalArea.toFixed(1)} ha
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Across prototype wetlands
              </p>
            </div>

            <Layers
              size={22}
              className="text-blue-600"
            />
          </div>
        </div>


        <div className="card-pad">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Fragmented / Loss
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {fragmentedCount}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Current condition classification
              </p>
            </div>

            <MapPin
              size={22}
              className="text-orange-600"
            />
          </div>
        </div>


        <div className="card-pad">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                High Confidence
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {highConfidenceCount}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Current mapped observations
              </p>
            </div>

            <MapPin
              size={22}
              className="text-green-600"
            />
          </div>
        </div>
      </div>


      {/* =====================================================
          SEARCH + FILTERS
      ===================================================== */}
      <div className="mt-5 card-pad">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Search Wetland
            </span>

            <div className="relative mt-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by ID, name or area..."
                className="control pl-9"
              />
            </div>
          </label>


          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Condition
            </span>

            <select
              value={condition}
              onChange={(event) =>
                setCondition(event.target.value)
              }
              className="control mt-1"
            >
              <option value="All">All Conditions</option>
              <option value="Persistent Loss">
                Persistent Loss
              </option>
              <option value="Fragmented">
                Fragmented
              </option>
              <option value="Seasonally Variable">
                Seasonally Variable
              </option>
              <option value="Relatively Stable">
                Relatively Stable
              </option>
            </select>
          </label>


          <label>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Confidence
            </span>

            <select
              value={confidence}
              onChange={(event) =>
                setConfidence(event.target.value)
              }
              className="control mt-1"
            >
              <option value="All">
                All Confidence Levels
              </option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </label>
        </div>
      </div>


      {/* =====================================================
          MAIN INVENTORY SECTION
      ===================================================== */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[360px_1fr]">
        {/* LIST */}
        <div className="card-pad">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">
                Wetland Inventory
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                {filteredWetlands.length} wetland
                {filteredWetlands.length !== 1 ? 's' : ''}{' '}
                shown
              </p>
            </div>
          </div>


          <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {filteredWetlands.map((wetland) => {
              const isSelected =
                selectedWetland?.wetlandId ===
                wetland.wetlandId

              return (
                <button
                  key={wetland.wetlandId}
                  type="button"
                  onClick={() =>
                    setSelectedWetland(wetland)
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                        {wetland.wetlandId}
                      </p>

                      <h3 className="mt-1 text-[12px] font-bold text-slate-900">
                        {wetland.name}
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {wetland.zone}
                      </p>
                    </div>

                    <p className="text-[12px] font-bold text-slate-900">
                      {wetland.currentArea.toFixed(1)} ha
                    </p>
                  </div>


                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant={conditionVariant(
                        wetland.condition,
                      )}
                    >
                      {wetland.condition}
                    </Badge>

                    <Badge
                      variant={confidenceVariant(
                        wetland.confidence,
                      )}
                    >
                      {wetland.confidence}
                    </Badge>
                  </div>
                </button>
              )
            })}


            {filteredWetlands.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <Search
                  size={24}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-[11px] font-semibold text-slate-700">
                  No wetlands match the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>


        {/* MAP */}
        <div className="card-pad">
          <div className="mb-4">
            <h2 className="section-title">
              Current Wetland Map
            </h2>

            <p className="mt-1 text-[11px] text-slate-500">
              Select a wetland from the inventory or click its
              polygon on the prototype map.
            </p>
          </div>


          <WetlandMap
            selected={selectedWetland}
            onSelect={setSelectedWetland}
            height={560}
          />
        </div>
      </div>


      {/* =====================================================
          SELECTED WETLAND DETAILS
      ===================================================== */}
      {selectedWetland && (
        <div className="mt-5 card-pad">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <div className="eyebrow">
                Current Wetland Profile
              </div>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedWetland.wetlandId} —{' '}
                {selectedWetland.name}
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                {selectedWetland.zone} · Current mapped year{' '}
                {selectedWetland.currentYear}
              </p>
            </div>


            <div className="flex flex-wrap gap-2">
              <Badge
                variant={conditionVariant(
                  selectedWetland.condition,
                )}
              >
                {selectedWetland.condition}
              </Badge>

              <Badge
                variant={confidenceVariant(
                  selectedWetland.confidence,
                )}
              >
                {selectedWetland.confidence} confidence
              </Badge>
            </div>
          </div>


          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="soft-panel">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Current Area
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.currentArea.toFixed(1)} ha
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Patch Count
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.patchCount}
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Largest Patch Index
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {selectedWetland.lpi}%
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Condition
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedWetland.condition}
              </p>
            </div>


            <div className="soft-panel">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Mapping Confidence
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {selectedWetland.confidence}
              </p>
            </div>
          </div>


          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Reference Source
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-700">
              {selectedWetland.source}
            </p>
          </div>
        </div>
      )}


      {/* =====================================================
          NOTICE
      ===================================================== */}
      <div className="mt-5 data-note">
        <b>Prototype Demo —</b> wetland names, areas,
        conditions, fragmentation values and locations shown
        here are mock demonstration records. The final system
        will replace these schematic wetlands with validated
        QGIS/GeoJSON wetland polygons and research-derived
        attributes.
      </div>
    </div>
  )
}