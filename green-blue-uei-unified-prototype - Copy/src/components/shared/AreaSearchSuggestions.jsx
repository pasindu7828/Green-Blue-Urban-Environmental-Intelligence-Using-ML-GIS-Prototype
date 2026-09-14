import { MapPin } from 'lucide-react'
import { localities } from '../../data/heatData'
export default function AreaSearchSuggestions({query,onSelect}){
  if(!query?.trim()) return null
  const q=query.toLowerCase()
  const exact=localities.filter(n=>n.toLowerCase().includes(q)).slice(0,5)
  const fallback=exact.length?exact:localities.map(n=>({n,score:Math.abs(n.length-q.length)})).sort((a,b)=>a.score-b.score).slice(0,4).map(x=>x.n)
  return <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-card"><div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{exact.length?'Matching areas':'Closest matching areas'}</div><div className="flex flex-wrap gap-2">{fallback.map(name=><button key={name} onClick={()=>onSelect(name)} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600 hover:border-teal-300 hover:bg-teal-50"><MapPin size={12}/>{name}</button>)}</div></div>
}
