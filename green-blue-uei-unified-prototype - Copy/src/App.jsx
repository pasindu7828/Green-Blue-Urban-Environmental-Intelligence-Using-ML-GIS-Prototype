import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Toast from './components/shared/Toast'
import Login from './pages/Login'
import ProjectHome from './pages/ProjectHome'
import UrbanLayout from './components/layout/UrbanLayout'
import HeatLayout from './components/layout/HeatLayout'
import WetlandLayout from './components/layout/WetlandLayout'
import RiverLayout from './components/layout/RiverLayout'

import UrbanOverview from './pages/urban/Overview'
import GreenTransition from './pages/urban/GreenTransition'
import PressurePrediction from './pages/urban/PressurePrediction'
import DevelopmentSuitability from './pages/urban/DevelopmentSuitability'
import ConservationPriority from './pages/urban/ConservationPriority'
import ConflictIntervention from './pages/urban/ConflictIntervention'
import UrbanExplainableAI from './pages/urban/ExplainableAI'
import UrbanMethodology from './pages/urban/Methodology'
import { UrbanForecastProvider } from './contexts/UrbanForecastContext'

import HeatDashboard from './pages/heat/Dashboard'
import HeatMap from './pages/heat/HeatMap'
import TrendAnalysis from './pages/heat/TrendAnalysis'
import Forecast from './pages/heat/Forecast'
import HeatScenario from './pages/heat/ScenarioSimulator'
import ExplainableAI from './pages/heat/ExplainableAI'
import CoolingPriority from './pages/heat/CoolingPriority'
import ZoneDetails from './pages/heat/ZoneDetails'
import Dataset from './pages/heat/Dataset'
import Settings from './pages/heat/Settings'
import HeatMethodology from './pages/heat/Methodology'

import WetlandDashboard from './pages/wetland/Dashboard'
import WetlandInventory from './pages/wetland/WetlandInventory'
import WetlandHistory from './pages/wetland/WetlandHistory'
import CandidateDetection from './pages/wetland/CandidateDetection'
import FutureProjection from './pages/wetland/FutureProjection'
import Waterlogging from './pages/wetland/Waterlogging'
import TerrainEvidence from './pages/wetland/TerrainEvidence'
import MethodologyValidation from './pages/wetland/MethodologyValidation'

import RiverOverview from './pages/river/Overview'
import RiverMapPage from './pages/river/RiverMapPage'
import Morphology from './pages/river/Morphology'
import RiverbankMovement from './pages/river/RiverbankMovement'
import VegetationBuffer from './pages/river/VegetationBuffer'
import Encroachment from './pages/river/Encroachment'
import RiskIntelligence from './pages/river/RiskIntelligence'
import RiverScenario from './pages/river/Scenario'
import RiverMethodology from './pages/river/Methodology'

function Guard({children}){
  const location=useLocation()
  const authed=localStorage.getItem('gbuei_auth')==='1'
  if(!authed) return <Navigate to="/" replace state={{from:location.pathname}}/>
  return children
}

export default function App(){
  return <><Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/project-home" element={<Guard><ProjectHome/></Guard>}/>

    <Route path="/urban" element={<Guard><UrbanForecastProvider><UrbanLayout/></UrbanForecastProvider></Guard>}>
      <Route index element={<Navigate to="dashboard" replace />} />

      <Route path="dashboard" element={<UrbanOverview />} />
      <Route path="green-transition" element={<GreenTransition />} />
      <Route path="pressure" element={<PressurePrediction />} />
      <Route path="suitability" element={<DevelopmentSuitability />} />
      <Route path="conservation" element={<ConservationPriority />} />
      <Route path="conflict" element={<ConflictIntervention />} />
      <Route path="xai" element={<UrbanExplainableAI />} />
      <Route path="methodology" element={<UrbanMethodology />} />
    </Route>

    <Route path="/heat" element={<Guard><HeatLayout/></Guard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/>
      <Route path="dashboard" element={<HeatDashboard/>}/>
      <Route path="map" element={<HeatMap/>}/>
      <Route path="trends" element={<TrendAnalysis/>}/>
      <Route path="forecast" element={<Forecast/>}/>
      <Route path="scenario" element={<HeatScenario/>}/>
      <Route path="xai" element={<ExplainableAI/>}/>
      <Route path="priority" element={<CoolingPriority/>}/>
      <Route path="zone" element={<ZoneDetails/>}/>
      <Route path="dataset" element={<Dataset/>}/>
      <Route path="methodology" element={<HeatMethodology/>}/>
      <Route path="settings" element={<Settings/>}/>
    </Route>

    <Route path="/wetland" element={<Guard><WetlandLayout/></Guard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/>

      <Route path="dashboard" element={<WetlandDashboard/>}/>
      <Route path="inventory" element={<WetlandInventory/>}/>
      <Route path="history" element={<WetlandHistory/>}/>
      <Route path="candidates" element={<CandidateDetection/>}/>
      <Route path="future" element={<FutureProjection/>}/>
      <Route path="waterlogging" element={<Waterlogging/>}/>
      <Route path="evidence" element={<TerrainEvidence/>}/>
      <Route path="methodology" element={<MethodologyValidation/>}/>
    </Route>

    <Route path="/river" element={<Guard><RiverLayout/></Guard>}>
      <Route index element={<Navigate to="overview" replace/>}/>
      <Route path="overview" element={<RiverOverview/>}/>
      <Route path="map" element={<RiverMapPage/>}/>
      <Route path="morphology" element={<Morphology/>}/>
      <Route path="movement" element={<RiverbankMovement/>}/>
      <Route path="vegetation" element={<VegetationBuffer/>}/>
      <Route path="encroachment" element={<Encroachment/>}/>
      <Route path="risk" element={<RiskIntelligence/>}/>
      <Route path="scenario" element={<RiverScenario/>}/>
      <Route path="methodology" element={<RiverMethodology/>}/>
    </Route>

    <Route path="*" element={<Navigate to="/project-home" replace/>}/>
  </Routes><Toast/></>
}
