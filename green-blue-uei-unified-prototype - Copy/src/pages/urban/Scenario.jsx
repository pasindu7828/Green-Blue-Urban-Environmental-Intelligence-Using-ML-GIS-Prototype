import { useMemo, useState } from 'react'
import { Gauge, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { DisclaimerBadges, Notice, PageHeader } from '../../components/shared/UrbanUI'

function Toggle({value,onChange}) { return <button onClick={()=>onChange(!value)} className={`relative h-7 w-12 rounded-full transition ${value?'bg-[#07865e]':'bg-[#ccdcd9]'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${value?'left-6':'left-1'}`}/></button> }
function Slider({label,value,setValue}) { return <label className="block"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-[#47645e]">{label}</span><b>{value}%</b></div><input type="range" min="0" max="100" value={value} onChange={e=>setValue(+e.target.value)} className="w-full accent-[#008765]"/></label> }

export default function Scenario() {
  const [green,setGreen]=useState(65), [density,setDensity]=useState(45), [road,setRoad]=useState(60), [wetland,setWetland]=useState(true), [caution,setCaution]=useState(true)
  const result = useMemo(()=>{
    const pressure = Math.round(42 + density*.28 + road*.12 - green*.20 - (caution?9:0) + (wetland?-4:3))
    const protect = Math.round(green*.72 + (wetland?16:0) + (caution?10:0))
    const suitability = Math.round(53 + road*.18 + density*.05 - (wetland?6:0) + (caution?2:-4) - green*.03)
    const p = pressure >= 70 ? 'Very High' : pressure >= 56 ? 'High' : pressure >= 42 ? 'Medium' : 'Low'
    const rec = wetland && green>65 ? 'Prioritize conservation with low-impact development.' : pressure>68 ? 'Requires mitigation before additional development.' : 'Suitable for controlled development with monitoring.'
    return {pressure,p,protect:Math.min(100,protect),suitability:Math.max(0,Math.min(100,suitability)),rec}
  },[green,density,road,wetland,caution])
  return (
    <div>
      <PageHeader eyebrow="Scenario / What-if" title="Simple planning scenario simulator" subtitle="Move the sliders to explore how conservation and development choices shift pressure and suitability outputs." />
      <DisclaimerBadges />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="card-pad"><h2 className="section-title">Scenario inputs</h2><div className="mt-6 space-y-7"><Slider label="Increase green conservation" value={green} setValue={setGreen}/><Slider label="Increase built-up density" value={density} setValue={setDensity}/><Slider label="Improve road accessibility" value={road} setValue={setRoad}/><div className="flex items-center justify-between rounded-2xl bg-[#f2f8f6] p-4"><div><b className="text-sm text-[#31544e]">Apply wetland / conservation constraint</b><p className="mt-1 text-xs text-[#718782]">Adds caution weighting to the scenario.</p></div><Toggle value={wetland} onChange={setWetland}/></div><div className="flex items-center justify-between rounded-2xl bg-[#f2f8f6] p-4"><div><b className="text-sm text-[#31544e]">Reduce development in caution zones</b><p className="mt-1 text-xs text-[#718782]">Lowers projected pressure where constraints apply.</p></div><Toggle value={caution} onChange={setCaution}/></div></div></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[[Gauge,'Predicted urbanization pressure',result.p,Math.min(100,result.pressure),'#ed8339'],[Leaf,'Green-cover protection score',`${result.protect}/100`,result.protect,'#07865e'],[ShieldCheck,'Suitability change',`${result.suitability}/100`,result.suitability,'#168cb8']].map(([Icon,t,v,p,c])=><div className="card-pad" key={t}><div className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf5f1] text-[#47645e]"><Icon size={19}/></div><div className="mt-4 text-sm text-[#667b77]">{t}</div><div className="mt-2 text-[30px] font-bold text-[#0a302c]">{v}</div><div className="progress-track"><div className="h-full rounded-full" style={{width:`${p}%`,background:c}}/></div></div>)}
          <div className="card-pad sm:col-span-2"><div className="flex items-center gap-2 text-sm font-semibold text-[#008765]"><Sparkles size={18}/> Planning recommendation</div><div className="mt-3 text-[22px] font-bold leading-8 text-[#143934]">{result.rec}</div><p className="muted mt-3">Live demo output generated only from the controls on this prototype page.</p></div>
        </div>
      </div>
      <div className="mt-5"><Notice tone="warning">These are demo scenario outputs generated from mock data for proposal demonstration only. They are not legal approvals, real measured results, or final development recommendations.</Notice></div>
    </div>
  )
}
