export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`card-pad ${className}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="muted mt-1">{subtitle}</p>}
      <div className="mt-5 h-[300px]">{children}</div>
    </div>
  )
}
