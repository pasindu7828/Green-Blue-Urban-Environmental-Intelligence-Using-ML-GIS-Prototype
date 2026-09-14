import {
  BadgeCheck,
  Droplets,
  History,
  Layers,
  LayoutDashboard,
  Map,
  Radar,
  TrendingUp,
} from 'lucide-react'

import ModuleLayout from './ModuleLayout'

const navItems = [
  {
    to: '/wetland/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/wetland/inventory',
    label: 'Wetland Inventory',
    icon: Map,
  },
  {
    to: '/wetland/history',
    label: 'History & Change',
    icon: History,
  },
  {
    to: '/wetland/candidates',
    label: 'Candidate Detection',
    icon: Radar,
  },
  {
    to: '/wetland/future',
    label: 'Future Projection',
    icon: TrendingUp,
  },
  {
    to: '/wetland/waterlogging',
    label: 'Waterlogging',
    icon: Droplets,
  },
  {
    to: '/wetland/evidence',
    label: 'Terrain & Evidence',
    icon: Layers,
  },
  {
    to: '/wetland/methodology',
    label: 'Methodology & Validation',
    icon: BadgeCheck,
  },
]

export default function WetlandLayout() {
  return (
    <ModuleLayout
      navItems={navItems}
      brand="Kaduwela WIS"
      subtitle="Wetland Intelligence System"
      icon={Droplets}
      headerTitle="Kaduwela Wetland Intelligence System"
      headerSubtitle="Kaduwela Municipal Council · Research Prototype"
      footer={
        <>
          <b className="text-white/75">Research prototype</b>
          <br />
          All mapped results and numerical values are mock/demo outputs until
          replaced by validated research results.
        </>
      }
      accent="#4FD1C5"
    />
  )
}