import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import HeatGridMap from '../../components/maps/HeatGridMap'
import Badge from '../../components/ui/Badge'
import { heatZones, shapFeatures, shapOverTime, forecastExplanation, modelComparison } from '../../data/heatData'

const trendCategories=['All','Persistent Hot','Intensifying','Emerging','Diminishing','Persistent Cool']

export default function ExplainableAI(){
 const [params]=useSearchParams()
 const linkedZone=params.get('zone')
 const linkedYear=Number(params.get('year'))||null
 const linkedCompare=Number(params.get('compare'))||null
 const linkedModel=params.get('model')||'XGBoost'
 const initialZone=linkedZone && heatZones.some(z=>z.zoneId===linkedZone) ? linkedZone : 'KD-0847'
 const [zoneId,setZoneId]=useState(initialZone)
 const [trend,setTrend]=useState('All')
 const [futureYear,setFutureYear]=useState(linkedYear || 2030)
 const [futureModel,setFutureModel]=useState(linkedModel || 'XGBoost')
 const zone=heatZones.find(z=>z.zoneId===zoneId)||heatZones[846]

 const factors=useMemo(()=>shapFeatures.map((f,i)=>{
   const boosts={
     'Persistent Hot':[5,3,-1,0,0],
     'Intensifying':[3,4,1,0,0],
     'Emerging':[1,1,5,1,0],
     'Diminishing':[-2,-1,4,1,1],
     'Persistent Cool':[-3,-2,5,3,1],
   }
   const trendBoost=(boosts[trend]||[0,0,0,0,0])[i]||0
   return {...f,value:Math.max(5,Math.round(f.value+(zone.ndbi-.6)*12-(zone.ndvi-.3)*7+trendBoost))}
 }),[zone,trend])

 const forecastWhy=useMemo(()=>{
   return forecastExplanation(zone,futureYear,2025,futureModel)
 },[zone,futureYear,futureModel])

 return <div>
  <div className="mb-5">
    <h1 className="text-[24px] font-bold">Explainable AI</h1>
    <p className="text-[11px] text-slate-500">Understand why the heat model makes predictions · SHAP-style prototype/demo values only</p>
  </div>

  <div className="mb-5 grid gap-3 md:grid-cols-2">
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
      <p className="text-[9px] font-bold uppercase tracking-wide text-teal-700">1 · Future forecast explanation</p>
      <p className="mt-1 text-[12px] font-bold text-slate-900">Why is a selected future LST predicted?</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-600">
        Use the Future Forecast Explanation section below to compare 2025 with a selected year such as 2030 and see which forecasted factors push the predicted LST higher or lower.
      </p>
    </div>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">2 · Historical / trend explanation</p>
      <p className="mt-1 text-[12px] font-bold text-slate-900">Why do different heat-trend groups behave differently?</p>
      <p className="mt-1 text-[10px] leading-4 text-slate-600">
        Trend-conditioned and temporal SHAP compare model drivers for Persistent Hot, Intensifying, Emerging, Diminishing and Persistent Cool zones, and across historical years.
      </p>
    </div>
  </div>

  <div className="data-note mb-5">Final research output will use real SHAP values from the validated trained model. Values on this page are prototype demonstrations only.</div>

  <div className="mb-5 rounded-2xl border border-teal-200 bg-teal-50 p-5">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wide text-teal-700">Future forecast explanation</p>
        <h2 className="mt-1 text-[18px] font-bold text-slate-900">Why does the model predict {futureYear} LST for {zone.zoneId}?</h2>
        <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-600">
          This compares the latest observed condition in <b>2025</b> with the selected future year. Final research output will use SHAP values from the validated forecast/LST model; the values below are prototype demonstrations.
        </p>
      </div>
      <Badge variant="amber">Demo SHAP-style explanation</Badge>
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <label className="text-[10px] font-semibold text-slate-500">ZONE
        <select value={zoneId} onChange={e=>setZoneId(e.target.value)} className="control mt-1">
          {heatZones.slice(0,1400).filter((_,i)=>i%7===0||i===846||i===1202).map(z=><option key={z.zoneId} value={z.zoneId}>{z.zoneId} — {z.areaName}</option>)}
        </select>
      </label>
      <label className="text-[10px] font-semibold text-slate-500">FORECAST YEAR
        <select value={futureYear} onChange={e=>setFutureYear(Number(e.target.value))} className="control mt-1">
          {Array.from({length:10},(_,i)=>2026+i).map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label className="text-[10px] font-semibold text-slate-500">MODEL
        <select value={futureModel} onChange={e=>setFutureModel(e.target.value)} className="control mt-1">
          {modelComparison.map(m=><option key={m.model} value={m.model}>{m.model}</option>)}
        </select>
      </label>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl bg-white p-3"><p className="text-[9px] text-slate-400">2025 latest LST</p><p className="text-[18px] font-bold">{forecastWhy.previousPred}°C</p></div>
      <div className="rounded-xl bg-white p-3"><p className="text-[9px] text-slate-400">{futureYear} predicted LST</p><p className="text-[18px] font-bold text-[#E0472B]">{forecastWhy.predicted}°C</p></div>
      <div className="rounded-xl bg-white p-3"><p className="text-[9px] text-slate-400">Change from 2025</p><p className={`text-[18px] font-bold ${forecastWhy.change>=0?'text-[#E0472B]':'text-emerald-700'}`}>{forecastWhy.change>=0?'+':''}{forecastWhy.change}°C</p></div>
    </div>

    <div className="mt-4 overflow-x-auto rounded-xl border border-teal-100 bg-white">
      <table className="table-base">
        <thead><tr><th>Factor</th><th>2025</th><th>{futureYear} forecast</th><th>Feature change</th><th>Model contribution change</th></tr></thead>
        <tbody>{forecastWhy.factors.map(f=>{const delta=Number((f.current-f.previous).toFixed(3));return <tr key={f.feature}><td><b>{f.name}</b></td><td>{f.previous}</td><td>{f.current}</td><td className={delta>0?'text-[#E0472B]':delta<0?'text-emerald-700':''}>{delta>0?'↑ ':delta<0?'↓ ':''}{delta}</td><td>{f.contribution>0?'↑ stronger warming contribution':f.contribution<0?'↓ weaker warming contribution':'little change'} ({f.contribution>0?'+':''}{f.contribution})</td></tr>})}</tbody>
      </table>
    </div>

    <div className="mt-4 rounded-xl border border-teal-100 bg-white p-4 text-[10px] leading-5 text-slate-600">
      <b>Simple meaning:</b> Forecast tells <b>what may happen</b>. This section explains <b>why the model predicts that future condition compared with 2025</b>. It explains model behaviour, not a guaranteed real-world causal effect.
    </div>
  </div>

  <div className="grid gap-5 xl:grid-cols-[.75fr_1.45fr]">
   <div className="card-pad"><h2 className="section-title">Historical / trend analysis controls</h2><label className="mt-4 block text-[10px] font-semibold text-slate-500">ZONE<select value={zoneId} onChange={e=>setZoneId(e.target.value)} className="control mt-1">{heatZones.slice(0,1400).filter((_,i)=>i%7===0||i===846||i===1202).map(z=><option key={z.zoneId} value={z.zoneId}>{z.zoneId} — {z.areaName}</option>)}</select></label><label className="mt-4 block text-[10px] font-semibold text-slate-500">TREND CATEGORY<select value={trend} onChange={e=>setTrend(e.target.value)} className="control mt-1">{trendCategories.map(t=><option key={t}>{t}</option>)}</select></label><div className="mt-4 rounded-2xl bg-slate-50 p-4 text-[11px] leading-5 text-slate-600"><b>Zone {zone.zoneId}</b> in {zone.areaName} is classified <b>{zone.trend}</b> at {zone.lst2025}°C. The displayed values demonstrate how final SHAP outputs will be explored by trend class.</div><div className="mt-4"><HeatGridMap compact height={260} selectedId={zone.zoneId} onSelect={z=>setZoneId(z.zoneId)}/></div></div>
   <div className="card-pad"><div className="flex items-center justify-between"><div><h2 className="section-title">Historical trend-group explanation (Trend-conditioned SHAP)</h2><p className="text-[10px] text-slate-400">Feature attribution for zone {zone.zoneId} · filter: {trend}</p></div><Badge variant="amber">Demo model output</Badge></div><div className="mt-4 h-[350px]"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={factors} margin={{left:80,right:20}}><CartesianGrid/><XAxis type="number" unit="%"/><YAxis dataKey="name" type="category" width={170}/><Tooltip/><Bar dataKey="value" fill="#E0472B" radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></div><div className="mt-3 text-[11px] text-slate-500">Final analysis will compare why persistent-hot, intensifying, emerging, diminishing and persistent-cool zones differ, rather than relying on one blended SHAP explanation.</div></div>
  </div>
  <div className="mt-5 card-pad"><h2 className="section-title">Historical driver change over time (Temporal SHAP)</h2><p className="text-[11px] text-slate-500">Separate from future-forecast explanation: this demonstrates temporal SHAP tracking across observed/modelled historical years 2015 / 2020 / 2025.</p><div className="mt-4 h-[320px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={shapOverTime}><CartesianGrid/><XAxis dataKey="year"/><YAxis unit="%"/><Tooltip/><Legend/><Line dataKey="built" name="Built-up Density" stroke="#E0472B" strokeWidth={2}/><Line dataKey="adj" name="Adjacency Built-up" stroke="#E9842A" strokeWidth={2}/><Line dataKey="vegetation" name="Vegetation Deficit" stroke="#D9A441" strokeWidth={2}/><Line dataKey="water" name="Distance to Water" stroke="#2B6CB0" strokeWidth={2}/><Line dataKey="albedo" name="Albedo" stroke="#168A82" strokeWidth={2}/></LineChart></ResponsiveContainer></div></div>
 </div>
}
