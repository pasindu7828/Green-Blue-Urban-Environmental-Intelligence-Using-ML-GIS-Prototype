import { Activity, BarChart3, Building2, GitBranch, LayoutDashboard, Leaf, Map, ShieldAlert, SlidersHorizontal } from 'lucide-react'
import ModuleLayout from './ModuleLayout'
const navItems=[
 {to:'/river/overview',label:'Overview',icon:LayoutDashboard},
 {to:'/river/map',label:'River Corridor Map',icon:Map},
 {to:'/river/morphology',label:'Morphological Change',icon:BarChart3},
 {to:'/river/movement',label:'Riverbank Movement',icon:Activity},
 {to:'/river/vegetation',label:'Vegetation Buffer',icon:Leaf},
 {to:'/river/encroachment',label:'Built-up Encroachment',icon:Building2},
 {to:'/river/risk',label:'Risk Intelligence',icon:ShieldAlert},
 {to:'/river/scenario',label:'Scenario / What-if',icon:SlidersHorizontal},
 {to:'/river/methodology',label:'Methodology',icon:GitBranch}
]
export default function RiverLayout(){const extras=<div className="hidden rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-[10px] font-medium text-sky-700 xl:block">Kelani River – Kaduwela pilot</div>;return <ModuleLayout navItems={navItems} brand="Green-Blue UEI" subtitle="River Corridor Intelligence" icon={Activity} headerTitle="Urban River Corridor Morphological Change & Riverbank Encroachment Risk Intelligence" headerSubtitle="Green-Blue Urban Environmental Intelligence System · Sri Lankan urban river corridors" footer={<><b className="text-white/75">Prototype demo data</b><br/>Planning-support only — not engineering erosion/flood-depth prediction.</>} accent="#56B7D7" headerExtras={extras}/>}
