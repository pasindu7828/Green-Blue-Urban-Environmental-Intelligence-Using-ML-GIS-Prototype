import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import MockMap from '../../components/maps/UrbanMockMap'
import { zones } from '../../data/urbanData'
import { DisclaimerBadges, PageHeader, PressureBadge, ProgressRow, SuitabilityBadge } from '../../components/shared/UrbanUI'

const layerNames = ['Green Cover 2015','Green Cover 2020','Green Cover 2025','Built-up Expansion','Urbanization Pattern','Urbanization Pressure','Land Development Suitability','Conservation / Caution Zones']

function Toggle({ checked, onChange }) {
  return <button onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-[#07865e]' : 'bg-[#cbdcda]'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} /></button>
}

export default function MapDashboard() {
  const [selected, setSelected] = useState(zones[2])
  const [layers, setLayers] = useState(() => Object.fromEntries(layerNames.map(n => [n, ['Green Cover 2025','Urbanization Pressure','Conservation / Caution Zones'].includes(n)])))
  const mode = layers['Land Development Suitability'] ? 'suitability' : layers['Urbanization Pressure'] ? 'pressure' : 'green'
  const toggle = (name, value) => setLayers(l => ({...l, [name]: value}))
  const selectedId = selected?.id
  const legend = useMemo(() => [['#4aa36c','Stable green cover'],['#9bd9a8','Green recovery'],['#9aa2a5','Built-up area'],['#e4cf70','Moderate pressure'],['#ef9b50','High pressure'],['#df6e6e','Very high pressure / caution']], [])

  return (
    <div>
      <PageHeader eyebrow="Interactive Map Dashboard" title="Zone-level planning canvas" subtitle="A stylized GIS-style canvas over mock polygons. Toggle layers and click a zone to open its detail panel." />
      <DisclaimerBadges />
      <div className="grid items-start gap-4 xl:grid-cols-[225px_minmax(0,1fr)_282px]">
        <div className="card-pad">
          <h3 className="text-[15px] font-bold uppercase tracking-wide text-[#506863]">Layers</h3>
          <div className="mt-4 space-y-2.5">
            {layerNames.map(name => <div key={name} className="flex items-center justify-between gap-2 rounded-2xl border border-[#d0e0dd] px-3 py-2.5 text-sm text-[#163b36]"><span>{name}</span><Toggle checked={layers[name]} onChange={v => toggle(name, v)} /></div>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-3"><MockMap selectedId={selectedId} onSelect={setSelected} mode={mode} showWater={layers['Conservation / Caution Zones'] || layers['Green Cover 2025']} showConservation={layers['Conservation / Caution Zones']} /></div>
          <div className="card-pad">
            <h3 className="font-bold text-[#143934]">Legend</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {legend.map(([color,label]) => <div key={label} className="flex items-center gap-2 text-xs text-[#607772]"><span className="h-3.5 w-3.5 rounded" style={{background:color}} />{label}</div>)}
              <div className="flex items-center gap-2 text-xs text-[#607772]"><span className="h-3.5 w-3.5 rounded border-2 border-dashed border-[#168fbd]" />Wetland / water constraint</div>
              <div className="flex items-center gap-2 text-xs text-[#607772]"><span className="h-3.5 w-3.5 rounded border-2 border-dashed border-[#c34f4a]" />Conservation-sensitive caution</div>
            </div>
          </div>
        </div>
        <div className="card-pad xl:sticky xl:top-[92px]">
          <div className="flex items-start justify-between gap-2"><h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0c312d]">{selected.zoneName}</h2><button className="text-[#758984]" onClick={()=>setSelected(zones[2])}><X size={18}/></button></div>
          <div className="mt-4 flex flex-wrap gap-2"><PressureBadge level={selected.urbanPressure}/><SuitabilityBadge value={selected.suitabilityClass}/></div>
          <div className="mt-5 divide-y divide-[#d5e2df] text-sm">
            <div className="flex justify-between py-3"><span className="text-[#6c807b]">Green change</span><b>{selected.greenChange}%</b></div>
            <div className="flex justify-between py-3"><span className="text-[#6c807b]">Built-up increase</span><b>+{selected.builtUpGrowth}%</b></div>
          </div>
          <div className="space-y-5 pt-4"><ProgressRow label="Road accessibility score" value={selected.roadAccess}/><ProgressRow label="Building density score" value={selected.buildingDensity}/></div>
          <div className="mt-2 divide-y divide-[#d5e2df] text-sm">
            <div className="flex justify-between py-3"><span className="text-[#6c807b]">Distance to town centre</span><b>{selected.distanceToTown} km</b></div>
          </div>
          <div className="py-3"><ProgressRow label="Suitability score" value={selected.suitabilityScore}/></div>
          <div className="flex justify-between border-y border-[#d5e2df] py-3 text-sm"><span className="text-[#6c807b]">Constraint level</span><b>{selected.constraintLevel}</b></div>
          <div className="mt-4 rounded-2xl border border-[#aad8ca] bg-[#eef8f4] p-4"><div className="text-[11px] font-bold uppercase text-[#008765]">Recommendation</div><div className="mt-1 text-sm leading-6 text-[#1e4741]">{selected.recommendation}</div><div className="mt-2 text-[11px] text-[#7a918c]">Planning-support guidance only — not a legal approval.</div></div>
        </div>
      </div>
    </div>
  )
}
