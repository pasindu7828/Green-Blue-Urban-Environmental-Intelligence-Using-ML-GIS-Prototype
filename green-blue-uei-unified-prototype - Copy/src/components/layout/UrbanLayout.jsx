import {
  BrainCircuit,
  GitBranch,
  Gauge,
  LayoutDashboard,
  Leaf,
  MapPinned,
  ShieldCheck,
  Trees,
} from 'lucide-react'

import ModuleLayout from './ModuleLayout'

const navItems = [
  {
    to: '/urban/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/urban/green-transition',
    label: 'Green Transition',
    icon: Leaf,
  },
  {
    to: '/urban/pressure',
    label: 'Urbanization Pressure',
    icon: Gauge,
  },
  {
    to: '/urban/suitability',
    label: 'Development Suitability',
    icon: ShieldCheck,
  },
  {
    to: '/urban/conservation',
    label: 'Green Conservation Priority',
    icon: Trees,
  },
  {
    to: '/urban/conflict',
    label: 'Conflict & Intervention',
    icon: MapPinned,
  },
  {
    to: '/urban/xai',
    label: 'Explainable AI',
    icon: BrainCircuit,
  },
  {
    to: '/urban/methodology',
    label: 'Methodology & Validation',
    icon: GitBranch,
  },
]

export default function UrbanLayout() {
  const extras = (
    <>
      <div className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-medium text-slate-700 md:block">
        Kaduwela Pilot
      </div>

      <div className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-medium text-amber-700 xl:block">
        Prototype Demo Data
      </div>
    </>
  )

  return (
    <ModuleLayout
      navItems={navItems}
      brand="Kaduwela Urban-Green"
      subtitle="Growth & Conservation Intelligence"
      icon={Leaf}
      headerTitle="Urban Green Transition, Urbanization Pressure & Conservation Intelligence"
      headerSubtitle="Kaduwela Municipal Council · Research Prototype"
      footer={
        <>
          <b className="text-white/75">
            Research prototype
          </b>
          <br />
          Planning-support outputs only. All displayed values are mock/demo data.
        </>
      }
      accent="#59C68B"
      headerExtras={extras}
    />
  )
}