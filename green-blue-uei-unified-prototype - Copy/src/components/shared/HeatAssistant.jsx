import { Bot, Send, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { forecastZone, heatZones } from '../../data/heatData'

function answerQuestion(text){
  const q=text.toLowerCase()
  const zoneMatch=q.match(/kd[-\s]?(\d{1,4})/i)
  const yearMatch=q.match(/20(2[6-9]|3[0-5])/)
  const zone=zoneMatch ? heatZones[Number(zoneMatch[1])-1] : null
  if(q.includes('highest lst') || q.includes('hottest zone')){
    const hottest=heatZones.reduce((a,b)=>a.lst2025>b.lst2025?a:b)
    return `${hottest.zoneId} (${hottest.areaName}) has the highest 2025 demo LST in the loaded dataset at ${hottest.lst2025}°C.`
  }
  if((q.includes('how many') || q.includes('count')) && q.includes('high priority')){
    return `${heatZones.filter(z=>z.priority==='High').length} zones are marked High cooling priority in the loaded demo dataset.`
  }
  if(zone && (q.includes('forecast') || yearMatch)){
    const year=yearMatch ? Number(yearMatch[0]) : 2030
    const f=forecastZone(zone,year)
    return `${zone.zoneId} (${zone.areaName}) is projected at ${f.predicted}°C in ${year} using the prototype XGBoost-style forecast function, with a demo range of ${f.low}–${f.high}°C.`
  }
  if(zone && q.includes('trend')) return `${zone.zoneId} (${zone.areaName}) is classified as ${zone.trend} in the demo trend dataset.`
  if(zone && (q.includes('lst') || q.includes('temperature'))) return `${zone.zoneId} (${zone.areaName}) has a 2025 demo LST of ${zone.lst2025}°C.`
  if(q.includes('emerging')) return `${heatZones.filter(z=>z.trend==='Emerging').length} loaded grid records are currently tagged Emerging in the generated demo dataset.`
  return 'I can answer dataset-grounded questions such as “Which zone has the highest LST?”, “How many zones are high priority?”, “What is the forecast for KD-0847 in 2030?”, or “What is the trend for KD-1203?”.'
}

export default function HeatAssistant(){
  const {assistantOpen,setAssistantOpen}=useApp()
  const [input,setInput]=useState('')
  const [messages,setMessages]=useState([{role:'assistant',text:'Ask a question about the loaded heat demo dataset.'}])
  const examples=useMemo(()=>['Which zone has the highest LST?','How many zones are high priority?','Forecast KD-0847 in 2030'],[])
  if(!assistantOpen) return null
  const send=(text=input)=>{
    if(!text.trim()) return
    setMessages(m=>[...m,{role:'user',text},{role:'assistant',text:answerQuestion(text)}]);setInput('')
  }
  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/20" onMouseDown={()=>setAssistantOpen(false)}>
      <aside className="absolute bottom-0 right-0 top-0 flex w-full max-w-md flex-col bg-white shadow-2xl" onMouseDown={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-2 font-bold"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0F2E28] text-[#2DD4BF]"><Bot size={18}/></div>AI Planning Assistant</div><button onClick={()=>setAssistantOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100"><X size={18}/></button></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map((m,i)=><div key={i} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-5 ${m.role==='user'?'ml-auto bg-[#0F2E28] text-white':'bg-slate-100 text-slate-700'}`}>{m.text}</div>)}</div>
        <div className="border-t border-slate-100 p-4"><div className="mb-3 flex flex-wrap gap-2">{examples.map(e=><button key={e} onClick={()=>send(e)} className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] text-slate-600 hover:bg-slate-200">{e}</button>)}</div><div className="flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} className="control" placeholder="Ask about a zone or forecast..."/><button onClick={()=>send()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0F2E28] text-[#2DD4BF]"><Send size={17}/></button></div><div className="mt-2 text-[10px] text-slate-400">Prototype assistant: answers are computed directly from local dummy JSON/data functions.</div></div>
      </aside>
    </div>
  )
}
