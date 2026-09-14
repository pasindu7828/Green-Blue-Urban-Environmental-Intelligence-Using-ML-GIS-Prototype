import { AlertTriangle, Info } from 'lucide-react'

export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

export function DisclaimerBadges({ legal = true }) {
  return (
    <div className="mb-7 flex flex-wrap gap-2">
      <span className="badge">Prototype demo data</span>
      <span className="badge">Pilot case-study: Kaduwela</span>
      <span className="badge">Planning-support output only</span>
      {legal && <span className="badge">Not a legal development approval system</span>}
    </div>
  )
}

export function MetricCard({ title, value, suffix, text, progress = 60, barClass = 'bg-[#07865e]', icon: Icon }) {
  return (
    <div className="card-pad min-h-[205px]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[15px] font-medium text-[#526a66]">{title}</div>
        {Icon && <div className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf5f1] text-[#49655f]"><Icon size={19} /></div>}
      </div>
      <div className="metric-value">{value}{suffix && <span className="ml-1 text-[17px] font-semibold text-[#3e5c57]">{suffix}</span>}</div>
      <div className="progress-track"><div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, Math.max(4, progress))}%` }} /></div>
      <p className="mt-4 text-[13px] leading-5 text-[#687d79]">{text}</p>
    </div>
  )
}

export function Notice({ children, tone = 'info' }) {
  const warning = tone === 'warning'
  return (
    <div className={`flex gap-3 rounded-2xl border px-4 py-3.5 text-sm ${warning ? 'border-[#ffd0a6] bg-[#fff6ec] text-[#a85c24]' : 'border-[#b9dfd4] bg-[#edf9f5] text-[#337367]'}`}>
      {warning ? <AlertTriangle className="mt-0.5 shrink-0" size={18} /> : <Info className="mt-0.5 shrink-0" size={18} />}
      <div>{children}</div>
    </div>
  )
}

export function ProgressRow({ label, value, suffix = '/100', color = '#07865e' }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
        <span className="text-[#607772]">{label}</span>
        <span className="font-semibold text-[#173a35]">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-[#e7f1ee]"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  )
}

export function PressureBadge({ level }) {
  const cls = level === 'Very High' ? 'badge-red' : level === 'High' ? 'badge-orange' : level === 'Medium' ? 'badge bg-[#fff8db] border-[#efd777] text-[#8c7410]' : 'badge-green'
  return <span className={cls}>{level} pressure</span>
}

export function SuitabilityBadge({ value }) {
  const cls = value === 'Highly suitable' ? 'badge-blue' : value?.startsWith('Caution') ? 'badge-red' : value === 'Low suitability' ? 'badge bg-[#f1f3f2] border-[#d7dedc] text-[#64736f]' : 'badge-green'
  return <span className={cls}>{value}</span>
}
