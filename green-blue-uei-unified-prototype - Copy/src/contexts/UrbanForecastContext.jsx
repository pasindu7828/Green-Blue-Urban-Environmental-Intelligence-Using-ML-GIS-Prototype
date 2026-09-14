import {
  createContext,
  useContext,
  useState,
} from 'react'

import {
  DEFAULT_FORECAST_YEAR,
  FORECAST_END_YEAR,
  FORECAST_START_YEAR,
} from '../utils/urbanForecast'

const UrbanForecastContext =
  createContext(null)

export function UrbanForecastProvider({
  children,
}) {
  const [
    forecastYear,
    setForecastYearState,
  ] = useState(
    DEFAULT_FORECAST_YEAR,
  )

  function setForecastYear(year) {
    const numericYear =
      Number(year)

    if (
      numericYear <
        FORECAST_START_YEAR ||
      numericYear >
        FORECAST_END_YEAR
    ) {
      return
    }

    setForecastYearState(
      numericYear,
    )
  }

  return (
    <UrbanForecastContext.Provider
      value={{
        forecastYear,
        setForecastYear,
      }}
    >
      {children}
    </UrbanForecastContext.Provider>
  )
}

export function useUrbanForecast() {
  const context =
    useContext(
      UrbanForecastContext,
    )

  if (!context) {
    throw new Error(
      'useUrbanForecast must be used inside UrbanForecastProvider',
    )
  }

  return context
}