export const localities = [
  'Malabe','Kaduwela Town','Athurugiriya','Kothalawala','Talangama','Hokandara','Battaramulla Boundary','Welivita','Ranala','Hewagama','Nawagamuwa','Korathota','Biyagama Edge','Dedigamuwa','Pore','Thalahena','Arangala','Weliwita North','Bomiriya','Millennium City Edge'
]

const clamp = (v,min,max)=>Math.max(min,Math.min(max,v))
const round = (v,d=1)=>Number(v.toFixed(d))

function trendFor(id){
  if (id === 847) return 'Intensifying'
  if (id === 1203) return 'Persistent Hot'
  if (id === 562 || id === 339) return 'Emerging'
  if (id === 2011) return 'Diminishing'
  if (id <= 123) return 'Persistent Hot'
  if (id <= 275) return 'Intensifying'
  if (id <= 519) return 'Emerging'
  if (id <= 2031) return 'Diminishing'
  return 'Persistent Cool'
}

function priorityFor(id){
  if (id === 847 || id === 1203 || id === 562) return 'High'
  if (id <= 184) return 'High'
  if (id <= 696) return 'Medium'
  return 'Low'
}

export const heatZones = Array.from({length:2194},(_,idx)=>{
  const idNum = idx+1
  const row = Math.floor(idx/47)
  const col = idx%47
  const dx=(col-25)/25
  const dy=(row-27)/24
  const distance=Math.sqrt(dx*dx+dy*dy)
  const urbanCore=Math.max(0,1-distance)
  const wave=(Math.sin(idNum*1.37)+Math.cos(idNum*.73))*0.45
  let lst2025=round(28.4 + urbanCore*9.2 + wave,1)
  const locality=localities[(Math.floor(row/10)*4 + Math.floor(col/12))%localities.length]
  let ndvi=round(clamp(.68-urbanCore*.48+(Math.sin(idNum)*.06),.10,.82),2)
  let ndbi=round(clamp(.22+urbanCore*.55+(Math.cos(idNum*.9)*.05),.08,.86),2)
  let trend=trendFor(idNum)
  let priority=priorityFor(idNum)
  const overrides={
    847:{areaName:'Udumulla',lst2025:38.4,trend:'Intensifying',ndvi:.21,ndbi:.72,priority:'High'},
    1203:{areaName:'Kaduwela Town',lst2025:39.1,trend:'Persistent Hot',ndvi:.18,ndbi:.79,priority:'High'},
    562:{areaName:'Malabe',lst2025:36.8,trend:'Emerging',ndvi:.28,ndbi:.66,priority:'High'},
    1890:{areaName:'Hokandara',lst2025:37.5,trend:'Intensifying',ndvi:.25,ndbi:.69,priority:'Medium'},
    339:{areaName:'Malabe',lst2025:35.9,trend:'Emerging',ndvi:.31,ndbi:.61,priority:'Medium'},
    2011:{areaName:'Welivita',lst2025:30.4,trend:'Diminishing',ndvi:.57,ndbi:.34,priority:'Low'}
  }[idNum]
  if(overrides){ lst2025=overrides.lst2025; ndvi=overrides.ndvi; ndbi=overrides.ndbi; trend=overrides.trend; priority=overrides.priority }
  const distanceToWater=round(90 + Math.abs(Math.sin(idNum*.37))*620,0)
  const roadDensity=round(clamp(22+urbanCore*60+(Math.cos(idNum*.22)*7),10,94),0)
  const buildingDensity=round(clamp(ndbi*100 + 6,12,94),0)
  const ndwi=round(clamp(.38-urbanCore*.3+Math.sin(idNum*.18)*.04,-.12,.55),2)
  const evi=round(clamp(ndvi*.86+0.04,.08,.74),2)
  const albedo=round(clamp(.13+ndbi*.17,.12,.29),2)
  const nightLights=round(clamp(18+urbanCore*72+Math.cos(idNum*.31)*5,5,96),0)
  const areaName=overrides?.areaName || locality
  const confidence = lst2025>36 ? 'Moderate' : lst2025>32 ? 'High' : 'High'
  return {
    id:idNum, zoneId:`KD-${String(idNum).padStart(4,'0')}`, row,col, areaName,
    lat:6.88 + row*.0031, lng:79.92 + col*.0031,
    lst2025, ndvi, ndbi, ndwi, evi, albedo,
    buildingDensity, roadDensity, distanceToWater,
    distanceToRoad:round(15+Math.abs(Math.sin(idNum*.27))*260,0),
    distanceToMainRoad:round(80+Math.abs(Math.cos(idNum*.19))*780,0),
    lcz: ndbi>.68?'LCZ 2 — Compact midrise':ndbi>.48?'LCZ 6 — Open low-rise':'LCZ A — Dense trees',
    // Prototype adjacency fields mirror the final research schema.
    // Final values will be replaced by GEE neighborhood-derived features.
    ndviAdj:round(clamp(ndvi + Math.sin(idNum*.11)*.035,.08,.85),2),
    ndbiAdj:round(clamp(ndbi + Math.cos(idNum*.13)*.035,.05,.90),2),
    greenMask:round(clamp(ndvi*.95 + .08,.05,.90),2),
    nightLights, trend, priority, confidence,
    reviewed: idNum%4!==0
  }
})

export const heatSummary = {
  totalZones:2194, highPriority:187, meanLst:35.2, emerging:64, predicted2030Increase:2.1
}

export const topPriorityZones = [847,1203,562,1890,339].map((id)=>heatZones[id-1])

export const areaMeanTrend = [
  {year:2015,lst:30.63},{year:2016,lst:30.75},{year:2017,lst:30.78},{year:2018,lst:30.77},{year:2019,lst:30.75},{year:2020,lst:30.69},{year:2021,lst:30.68},{year:2022,lst:30.67},{year:2023,lst:30.61},{year:2024,lst:30.58},{year:2025,lst:30.54}
]

export const forecastArea = [
  ...areaMeanTrend,
  {year:2026,lst:31.0,forecast:true},{year:2027,lst:31.25,forecast:true},{year:2028,lst:31.48,forecast:true},{year:2029,lst:31.74,forecast:true},{year:2030,lst:32.02,forecast:true},{year:2031,lst:32.18,forecast:true},{year:2032,lst:32.31,forecast:true},{year:2033,lst:32.45,forecast:true},{year:2034,lst:32.57,forecast:true},{year:2035,lst:32.70,forecast:true}
]

export const modelComparison = [
  {model:'Random Forest',r2:.89,rmse:1.42,mae:1.08},
  {model:'XGBoost',r2:.92,rmse:1.21,mae:.94,best:true},
  {model:'LightGBM',r2:.91,rmse:1.25,mae:.97},
  {model:'NGBoost',r2:.90,rmse:1.30,mae:1.02,uncertainty:true}
]

export const trendStats = [
  {name:'Persistent Hot',value:123,color:'#E0472B'},
  {name:'Intensifying',value:152,color:'#EA7C2B'},
  {name:'Emerging',value:244,color:'#D9A441'},
  {name:'Diminishing',value:1512,color:'#2F9E5B'},
  {name:'Persistent Cool',value:163,color:'#2B6CB0'}
]

export const landCover = [
  {name:'Built-up',value:12.9,color:'#E0472B'},
  {name:'Vegetation',value:67.0,color:'#2F9E5B'},
  {name:'Water',value:4.6,color:'#2B6CB0'},
  {name:'Mixed',value:15.5,color:'#D9A441'}
]

export const shapFeatures = [
  {name:'Built-up Density (NDBI)',value:34,color:'#E0472B'},
  {name:'Adjacency Built-up (NDBI_ADJ)',value:22,color:'#E9842A'},
  {name:'Vegetation Deficit (NDVI)',value:19,color:'#D9A441'},
  {name:'Distance to Water',value:14,color:'#2B6CB0'},
  {name:'Albedo',value:11,color:'#168A82'}
]

export const shapOverTime = [
  {year:2015,built:24,adj:15,vegetation:29,water:18,albedo:14},
  {year:2020,built:29,adj:19,vegetation:24,water:16,albedo:12},
  {year:2025,built:34,adj:22,vegetation:19,water:14,albedo:11}
]

export function forecastZone(zone,year,model='XGBoost'){
  const delta=year-2025
  const modelFactor={"Random Forest":.24,XGBoost:.27,LightGBM:.26,NGBoost:.25}[model] ?? .27
  const heatFactor=(zone.ndbi-zone.ndvi)*.20
  const predicted=round(zone.lst2025 + delta*(modelFactor+heatFactor),1)
  const uncertainty=round(.65 + delta*.05 + (model==='NGBoost'?.1:0),1)
  return {predicted,low:round(predicted-uncertainty,1),high:round(predicted+uncertainty,1),uncertainty}
}


// Prototype-only direct feature perturbation used to demonstrate the final
// Stage 9 interaction. It is deliberately labelled as demo logic in the UI.
// The final implementation should replace this function with the validated
// trained NGBoost scenario model and calibrated predictive distribution.
export function scenarioPrototype(zone,{greenPP=0,builtPP=0}={}){
  const boundedGreen=Math.max(-30,Math.min(30,greenPP))
  const boundedBuilt=Math.max(-30,Math.min(30,builtPP))
  const predicted=round(zone.lst2025 - boundedGreen*.042 + boundedBuilt*.032,1)
  const change=round(predicted-zone.lst2025,2)
  const uncertainty=round(.65 + Math.abs(boundedGreen)*.004 + Math.abs(boundedBuilt)*.004,2)
  return {
    predicted,
    change,
    uncertainty,
    low:round(predicted-uncertainty,1),
    high:round(predicted+uncertainty,1),
  }
}

export function prototypeImpactPotential(zone){
  // Standardized demo intervention: +10 percentage points green cover.
  // This makes the priority page visibly consume Stage 9-style output.
  const result=scenarioPrototype(zone,{greenPP:10,builtPP:0})
  const cooling=Math.max(0,-result.change)
  return Math.max(0,Math.min(100,Math.round(cooling/0.42*100)))
}

export function zoneHistory(zone){
  const slope=zone.trend==='Persistent Hot'?.16:zone.trend==='Intensifying'?.22:zone.trend==='Emerging'?.14:zone.trend==='Diminishing'?-.08:-.03
  return Array.from({length:11},(_,i)=>({year:2015+i,lst:round(zone.lst2025 - slope*(10-i) + Math.sin((zone.id+i)*.63)*.18,1)}))
}



// Prototype future feature snapshot used only to demonstrate how a forecast
// prediction can be explained. Final values must come from the validated
// feature-forecasting pipeline described in the research methodology.
export function forecastFeatureSnapshot(zone, year){
  const delta=Math.max(0,year-2025)
  return {
    year,
    ndvi:round(clamp(zone.ndvi-delta*.008,.05,.90),2),
    ndbi:round(clamp(zone.ndbi+delta*.010,.05,.95),2),
    ndviAdj:round(clamp(zone.ndviAdj-delta*.007,.05,.90),2),
    ndbiAdj:round(clamp(zone.ndbiAdj+delta*.009,.05,.95),2),
    buildingDensity:round(clamp(zone.buildingDensity+delta*.75,0,100),1),
    albedo:round(clamp(zone.albedo+delta*.001,.08,.35),3),
    distanceToWater:zone.distanceToWater,
  }
}

// SHAP-style prototype contribution deltas for explaining WHY a forecast
// changed between two years. These are UI demonstration values, not final
// SHAP outputs. Final research output will be computed from the trained model.
export function forecastExplanation(zone, year, compareYear=year-1, model='XGBoost'){
  const current=forecastFeatureSnapshot(zone,year)
  const previous=forecastFeatureSnapshot(zone,compareYear)
  const pred=forecastZone(zone,year,model).predicted
  const prevPred=compareYear<=2025 ? zone.lst2025 : forecastZone(zone,compareYear,model).predicted
  const factors=[
    {name:'Built-up (NDBI)', feature:'NDBI', previous:previous.ndbi, current:current.ndbi, contribution:round((current.ndbi-previous.ndbi)*32,2)},
    {name:'Vegetation (NDVI)', feature:'NDVI', previous:previous.ndvi, current:current.ndvi, contribution:round((previous.ndvi-current.ndvi)*28,2)},
    {name:'Adjacency built-up', feature:'NDBI_ADJ', previous:previous.ndbiAdj, current:current.ndbiAdj, contribution:round((current.ndbiAdj-previous.ndbiAdj)*25,2)},
    {name:'Adjacency vegetation', feature:'NDVI_ADJ', previous:previous.ndviAdj, current:current.ndviAdj, contribution:round((previous.ndviAdj-current.ndviAdj)*22,2)},
    {name:'Building density', feature:'Building density', previous:previous.buildingDensity, current:current.buildingDensity, contribution:round((current.buildingDensity-previous.buildingDensity)*.018,2)},
  ].sort((a,b)=>Math.abs(b.contribution)-Math.abs(a.contribution))
  return {year,compareYear,model,predicted:pred,previousPred:prevPred,change:round(pred-prevPred,2),factors,current,previous}
}

export function getDatasetRows(){
  const rows=[]
  heatZones.forEach(zone=>{
    zoneHistory(zone).forEach(({year,lst})=>rows.push({
      zoneId:zone.zoneId,areaName:zone.areaName,year,lst,
      ndvi:round(zone.ndvi-(2025-year)*.006,2),ndbi:round(zone.ndbi-(2025-year)*.008,2),ndwi:zone.ndwi,evi:zone.evi,albedo:zone.albedo,
      ndviAdj:round(zone.ndviAdj-(2025-year)*.005,2),ndbiAdj:round(zone.ndbiAdj-(2025-year)*.007,2),greenMask:zone.greenMask,
      buildingDensity:Math.max(5,zone.buildingDensity-(2025-year)),roadDensity:zone.roadDensity,
      distanceToWater:zone.distanceToWater,distanceToRoad:zone.distanceToRoad,distanceToMainRoad:zone.distanceToMainRoad,lcz:zone.lcz,nightLights:Math.max(2,zone.nightLights-(2025-year)*2),trend:zone.trend,priority:zone.priority
    }))
  })
  return rows
}
