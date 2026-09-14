import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import MockMap from '../../components/maps/UrbanMockMap'
import ChartCard from '../../components/shared/UrbanChartCard'
import { urbanGrowth, zones } from '../../data/urbanData'
import { DisclaimerBadges, PageHeader } from '../../components/shared/UrbanUI'

const insightCards = [
  ['Road-side Expansion Corridor', 'Strong ribbon-growth signal along high-access road segments.'],
  ['Athurugiriya Growth Zone', 'Fast outward expansion with high green-to-built-up conversion.'],
  ['Malabe Urban Edge', 'Existing urban edge is extending into adjacent lower-density land.'],
  ['Green-to-built-up conversion', 'Conversion hotspots align with accessible development fronts.'],
  ['Expansion direction', 'Demo pattern indicates outward growth from town centres and major roads.']
]

export default function UrbanizationPattern() {
  const [start, setStart] = useState(2015)
  const [type, setType] = useState('All')
  const [pressure, setPressure] = useState('All')
  const filtered = useMemo(() => zones.filter(z => (type==='All'||z.developmentType===type) && (pressure==='All'||z.urbanPressure===pressure)), [type, pressure])
  const zoneBars = filtered.map(z => ({name:z.zoneName.split(' ')[0], growth:z.builtUpGrowth}))
  const scatter = filtered.map(z => ({road:z.roadAccess,growth:z.builtUpGrowth,name:z.zoneName}))
  return (
    <div>
      <PageHeader eyebrow="Urbanization Pattern Analysis" title="Where and how urban growth is forming" subtitle="Requested by the municipal council: pattern analysis of expansion direction, corridors and conversion behaviour." />
      <DisclaimerBadges />
      <div className="card-pad mb-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-[#45625d]">Year range</span><b>{start} → 2025</b></div><input className="w-full accent-[#008765]" type="range" min="2015" max="2024" step="1" value={start} onChange={e=>setStart(+e.target.value)} /></div>
        <label className="text-sm font-semibold text-[#45625d]">Development type<select className="control mt-2 w-full" value={type} onChange={e=>setType(e.target.value)}><option>All</option><option>Residential</option><option>Commercial</option><option>Mixed</option><option>Road-side Expansion</option></select></label>
        <label className="text-sm font-semibold text-[#45625d]">Pressure level<select className="control mt-2 w-full" value={pressure} onChange={e=>setPressure(e.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option><option>Very High</option></select></label>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
        <div className="card p-3"><MockMap mode="pressure" growthOverlay showConservation showWater /></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {insightCards.map(([title,text],i)=><div key={title} className="card-pad"><div className="text-[11px] font-bold uppercase tracking-[.15em] text-[#008765]">Pattern {String(i+1).padStart(2,'0')}</div><h3 className="mt-2 font-bold text-[#173b36]">{title}</h3><p className="muted mt-2">{text}</p></div>)}
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <ChartCard title="Built-up area growth over time" className="xl:col-span-1"><ResponsiveContainer width="100%" height="100%"><LineChart data={urbanGrowth.filter(d=>+d.year>=start)} margin={{left:-12,right:8}}><CartesianGrid/><XAxis dataKey="year"/><YAxis unit="%"/><Tooltip/><Line type="monotone" dataKey="area" name="Built-up share" stroke="#dd7332" strokeWidth={3} dot={{r:5}}/></LineChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Development growth by zone"><ResponsiveContainer width="100%" height="100%"><BarChart data={zoneBars} margin={{left:-12,right:8}}><CartesianGrid/><XAxis dataKey="name"/><YAxis unit="%"/><Tooltip/><Bar dataKey="growth" name="Built-up growth" fill="#07865e" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Road proximity vs built-up growth"><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{left:-5,right:15}}><CartesianGrid/><XAxis type="number" dataKey="road" name="Road score" domain={[40,100]}/><YAxis type="number" dataKey="growth" name="Growth" unit="%"/><Tooltip cursor={{strokeDasharray:'4 4'}}/><Scatter data={scatter} fill="#188bb8"/></ScatterChart></ResponsiveContainer></ChartCard>
      </div>
      <div className="card-pad mt-6"><h2 className="section-title">Pattern interpretation</h2><p className="muted mt-2">The demo logic emphasizes stronger built-up growth near main roads, close to town centres, at existing urban edges, and in zones where green-to-built-up conversion is high. This page demonstrates the type of spatial pattern evidence the final research workflow would visualize; it does not present measured municipal results.</p></div>
    </div>
  )
}
