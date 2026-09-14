import { AlertTriangle, Brain, Database, LayoutDashboard, LineChart, Map, MapPin, Settings, SlidersHorizontal, TrendingUp, Thermometer, Workflow } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import ModuleLayout from './ModuleLayout'
import HeatAssistant from '../shared/HeatAssistant'

const navItems = [
  {to:'/heat/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {to:'/heat/map',label:'Heat Map',icon:Map},
  {to:'/heat/trends',label:'Trend Analysis',icon:LineChart},
  {to:'/heat/forecast',label:'Forecast',icon:TrendingUp},
  {to:'/heat/scenario',label:'Scenario Simulator',icon:SlidersHorizontal},
  {to:'/heat/xai',label:'Explainable AI',icon:Brain},
  {to:'/heat/priority',label:'Cooling Priority',icon:AlertTriangle},
  {to:'/heat/zone',label:'Zone Details',icon:MapPin},
  {to:'/heat/dataset',label:'Dataset',icon:Database},
  {to:'/heat/methodology',label:'Methodology',icon:Workflow},
  {to:'/heat/settings',label:'Settings',icon:Settings}
]

export default function HeatLayout(){
  const location=useLocation(); const searchable=['/heat/dashboard','/heat/map','/heat/zone'].includes(location.pathname)
  return <><ModuleLayout navItems={navItems} brand="KaduwelaHeat-XAI" subtitle="Urban Heat Intelligence" icon={Thermometer} headerTitle="Urban Heat Intelligence" headerSubtitle="Kaduwela Municipal Council · Research Prototype" footer={<><b className="text-white/75">Prototype demo data</b><br/>Projected and analytical values are simulated for proposal demonstration.</>} assistant accent="#2DD4BF" searchable={searchable}/><HeatAssistant/></>
}
