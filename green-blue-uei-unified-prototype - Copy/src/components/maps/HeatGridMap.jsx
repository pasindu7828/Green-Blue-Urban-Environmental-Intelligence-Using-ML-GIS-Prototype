import { useEffect, useMemo } from 'react'
import { CRS } from 'leaflet'
import {
  MapContainer,
  Popup,
  Rectangle,
  Tooltip,
  useMap,
} from 'react-leaflet'

import {
  forecastZone,
  heatZones,
} from '../../data/heatData'

const heatColor = (lst) =>
  lst >= 37.5
    ? '#E0472B'
    : lst >= 35
      ? '#EA7C2B'
      : lst >= 31.5
        ? '#D9A441'
        : lst >= 28
          ? '#4A99B8'
          : '#2B6CB0'

const trendColor = (trend) =>
  ({
    'Persistent Hot': '#E0472B',
    Intensifying: '#EA7C2B',
    Emerging: '#D9A441',
    Diminishing: '#2F9E5B',
    'Persistent Cool': '#2B6CB0',
  })[trend] || '#94a3b8'

const priorityColor = (priority) =>
  priority === 'High'
    ? '#E0472B'
    : priority === 'Medium'
      ? '#D9A441'
      : '#2F9E5B'

function SearchMover({ area }) {
  const map = useMap()

  useEffect(() => {
    if (!area) return

    const matches = heatZones.filter(
      (zone) =>
        zone.areaName.toLowerCase() === area.toLowerCase(),
    )

    if (!matches.length) return

    const row =
      matches.reduce((sum, zone) => sum + zone.row, 0) /
      matches.length

    const col =
      matches.reduce((sum, zone) => sum + zone.col, 0) /
      matches.length

    map.setView([row, col], 1.8)
  }, [area, map])

  return null
}

function SelectedZoneMover({ zone }) {
  const map = useMap()

  useEffect(() => {
    if (!zone) return

    map.setView(
      [zone.row + 0.45, zone.col + 0.45],
      2.3,
    )
  }, [zone, map])

  return null
}

export default function HeatGridMap({
  mode = 'lst',
  height = 430,
  selectedId,
  onSelect,
  highlightArea = '',
  compact = false,
  minLst = null,

  // NEW — forecast support
  forecastYear = null,
  forecastModel = 'XGBoost',
}) {
  const zones = useMemo(
    () =>
      compact
        ? heatZones.filter((_, index) => index % 2 === 0)
        : heatZones,
    [compact],
  )

  const selectedZone = useMemo(
    () =>
      selectedId
        ? heatZones.find(
            (zone) => zone.zoneId === selectedId,
          )
        : null,
    [selectedId],
  )

  const getMapValue = (zone) => {
    if (mode === 'forecast' && forecastYear) {
      return forecastZone(
        zone,
        forecastYear,
        forecastModel,
      ).predicted
    }

    return zone.lst2025
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-[#e8efee]"
      style={{ height }}
    >
      <MapContainer
        crs={CRS.Simple}
        bounds={[
          [0, 0],
          [47, 47],
        ]}
        zoom={0}
        minZoom={-1}
        maxZoom={4}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl
      >
        <SearchMover area={highlightArea} />

        <SelectedZoneMover zone={selectedZone} />

        {zones.map((zone) => {
          const mapValue = getMapValue(zone)

          let color

          if (mode === 'trend') {
            color = trendColor(zone.trend)
          } else if (mode === 'priority') {
            color = priorityColor(zone.priority)
          } else if (mode === 'ndvi') {
            color = `hsl(${Math.round(
              90 + zone.ndvi * 70,
            )} 45% 48%)`
          } else if (mode === 'ndbi') {
            color = `hsl(${Math.round(
              45 - zone.ndbi * 35,
            )} 75% 55%)`
          } else {
            // LST and Forecast both use thermal colours
            color = heatColor(mapValue)
          }

          const isArea =
            highlightArea &&
            zone.areaName.toLowerCase() ===
              highlightArea.toLowerCase()

          const isSelected =
            selectedId === zone.zoneId

          const tooltipValue =
            mode === 'trend'
              ? zone.trend
              : mode === 'priority'
                ? `${zone.priority} priority`
                : mode === 'forecast'
                  ? `Projected ${forecastYear}: ${mapValue}°C`
                  : `LST ${zone.lst2025}°C`

          return (
            <Rectangle
              key={zone.zoneId}
              bounds={[
                [zone.row, zone.col],
                [zone.row + 0.92, zone.col + 0.92],
              ]}
              pathOptions={{
                color:
                  isSelected || isArea
                    ? '#102c28'
                    : 'rgba(255,255,255,.55)',

                weight: isSelected
                  ? 2.5
                  : isArea
                    ? 1.8
                    : 0.35,

                fillColor: color,

                fillOpacity:
                  minLst !== null &&
                  zone.lst2025 < minLst
                    ? 0.18
                    : 0.78,
              }}
              eventHandlers={{
                click: () => onSelect?.(zone),
              }}
            >
              <Tooltip
                direction="top"
                opacity={0.94}
              >
                <div className="text-xs">
                  <b>{zone.zoneId}</b>
                  {' · '}
                  {zone.areaName}

                  <br />

                  {tooltipValue}
                </div>
              </Tooltip>

              <Popup>
                <div className="min-w-[190px] text-xs leading-5">
                  <b>{zone.zoneId}</b>

                  <br />

                  Area: {zone.areaName}

                  <br />

                  {mode === 'forecast' &&
                  forecastYear ? (
                    <>
                      Projected LST ({forecastYear}):{' '}
                      <b>{mapValue}°C</b>
                      <br />
                      Current LST (2025):{' '}
                      {zone.lst2025}°C
                    </>
                  ) : (
                    <>
                      LST: {zone.lst2025}°C
                    </>
                  )}

                  <br />

                  Trend: {zone.trend}

                  <br />

                  NDVI: {zone.ndvi}

                  <br />

                  Built-up Density:{' '}
                  {zone.buildingDensity}/100

                  <br />

                  Cooling Priority: {zone.priority}
                </div>
              </Popup>
            </Rectangle>
          )
        })}
      </MapContainer>
    </div>
  )
}