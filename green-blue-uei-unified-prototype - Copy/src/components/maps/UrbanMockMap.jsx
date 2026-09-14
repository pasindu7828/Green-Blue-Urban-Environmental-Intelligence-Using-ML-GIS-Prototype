import { zones } from '../../data/urbanData'

const shapes = {
  malabe: 'M65,52 L230,44 L249,126 L135,162 L64,128 Z',
  athurugiriya: 'M265,40 L424,48 L450,136 L278,143 Z',
  roadside: 'M468,45 L662,59 L667,151 L476,140 Z',
  battaramulla: 'M66,167 L251,171 L262,263 L75,262 Z',
  kaduwela: 'M279,154 L425,148 L439,248 L295,258 Z',
  wetland: 'M465,160 L667,168 L664,270 L458,262 Z',
  greenbelt: 'M68,278 L236,276 L244,394 L74,394 Z',
  mixed: 'M272,277 L665,288 L662,391 L282,392 Z'
}

function fillFor(zone, mode) {
  if (mode === 'suitability') {
    if (zone.suitabilityClass === 'Highly suitable') return '#8dcbe6'
    if (zone.suitabilityClass.startsWith('Caution')) return '#e26d6d'
    if (zone.suitabilityClass === 'Low suitability') return '#acdcae'
    return '#e8c96e'
  }
  if (mode === 'green') {
    if (zone.greenChange > 0) return '#a7dfb5'
    if (zone.greenChange > -10) return '#d8e69d'
    if (zone.greenChange > -18) return '#eaae68'
    return '#dd7070'
  }
  if (zone.urbanPressure === 'Very High') return '#dd6f70'
  if (zone.urbanPressure === 'High') return '#ee9f58'
  if (zone.urbanPressure === 'Medium') return '#e6d37e'
  return '#b9e3bd'
}

export default function MockMap({ selectedId, onSelect, mode = 'pressure', showWater = true, showConservation = true, showLabels = true, growthOverlay = false }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#c7dcd7] bg-[#dff4f5]">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-[#cddedb] bg-white/95 px-3 py-2 text-[12px] font-medium shadow">Stylized mock GIS canvas · Kaduwela pilot area</div>
      <svg viewBox="0 0 730 430" className="block h-auto min-h-[360px] w-full select-none" role="img" aria-label="Stylized mock GIS map of Kaduwela pilot zones">
        <defs>
          <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#b8dcdd" strokeWidth="1" opacity=".55" /></pattern>
          <marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 z" fill="#bd5f2e" /></marker>
        </defs>
        <rect width="730" height="430" fill="url(#grid)" />
        {showWater && <path d="M0,391 C110,352 244,430 385,386 C524,342 633,410 730,365" fill="none" stroke="#4eadd2" strokeWidth="8" opacity=".85" />}
        <path d="M18,151 L710,163" stroke="#9ca8aa" strokeWidth="5" />
        <path d="M260,0 L280,421" stroke="#a7aeaf" strokeWidth="4" />
        <path d="M445,0 L460,421" stroke="#afb6b7" strokeWidth="4" />
        {zones.map((zone) => (
          <g key={zone.id} onClick={() => onSelect?.(zone)} className="cursor-pointer">
            <path
              d={shapes[zone.id]}
              fill={fillFor(zone, mode)}
              fillOpacity=".95"
              stroke={selectedId === zone.id ? '#173b37' : zone.wetlandWaterConstraint && showWater ? '#168fbd' : zone.conservationFlag && showConservation ? '#c34f4a' : '#35514d'}
              strokeWidth={selectedId === zone.id ? 4 : zone.wetlandWaterConstraint || zone.conservationFlag ? 3 : 1.6}
              strokeDasharray={(zone.wetlandWaterConstraint && showWater) || (zone.conservationFlag && showConservation) ? '7 5' : '0'}
              className="transition-all hover:brightness-105"
            />
            {showLabels && <>
              <text x={zone.id === 'malabe' ? 104 : zone.id === 'athurugiriya' ? 305 : zone.id === 'roadside' ? 505 : zone.id === 'battaramulla' ? 94 : zone.id === 'kaduwela' ? 314 : zone.id === 'wetland' ? 495 : zone.id === 'greenbelt' ? 95 : 314} y={zone.id === 'malabe' ? 98 : zone.id === 'athurugiriya' ? 92 : zone.id === 'roadside' ? 99 : zone.id === 'battaramulla' ? 218 : zone.id === 'kaduwela' ? 210 : zone.id === 'wetland' ? 216 : zone.id === 'greenbelt' ? 336 : 337} fontSize="13" fontWeight="700" fill="#123631">{zone.zoneName.length > 22 ? zone.zoneName.slice(0, 20) + '…' : zone.zoneName}</text>
              <text x={zone.id === 'malabe' ? 104 : zone.id === 'athurugiriya' ? 305 : zone.id === 'roadside' ? 505 : zone.id === 'battaramulla' ? 94 : zone.id === 'kaduwela' ? 314 : zone.id === 'wetland' ? 495 : zone.id === 'greenbelt' ? 95 : 314} y={zone.id === 'malabe' ? 116 : zone.id === 'athurugiriya' ? 110 : zone.id === 'roadside' ? 117 : zone.id === 'battaramulla' ? 236 : zone.id === 'kaduwela' ? 228 : zone.id === 'wetland' ? 234 : zone.id === 'greenbelt' ? 354 : 355} fontSize="9.7" fill="#3f5d58">{zone.urbanPressure} pressure · score {zone.pressureScore}</text>
            </>}
          </g>
        ))}
        {growthOverlay && <>
          <path d="M95,107 C175,95 245,95 330,90" stroke="#bd5f2e" strokeWidth="5" fill="none" markerEnd="url(#arrow)" opacity=".9" />
          <path d="M355,217 C445,205 510,190 584,126" stroke="#bd5f2e" strokeWidth="5" fill="none" markerEnd="url(#arrow)" opacity=".9" />
          <path d="M336,340 C410,318 515,315 620,320" stroke="#bd5f2e" strokeWidth="5" fill="none" markerEnd="url(#arrow)" opacity=".9" />
          <circle cx="375" cy="205" r="54" fill="#ef7b39" opacity=".12" stroke="#ef7b39" strokeWidth="3" strokeDasharray="7 6" />
        </>}
      </svg>
    </div>
  )
}
