// Service to fetch NOAA weather data
import axios from 'axios';

const NOAA_API_BASE = 'https://api.weather.gov';

export const fetchWeatherData = async (latitude, longitude) => {
  try {
    // Get grid point data
    const gridResponse = await axios.get(`${NOAA_API_BASE}/points/${latitude},${longitude}`);
    const { properties } = gridResponse.data;
    
    // Get forecast URL for the specific location
    const forecastUrl = properties.forecast;
    const forecastResponse = await axios.get(forecastUrl);
    
    const { periods } = forecastResponse.data.properties;
    const current = periods[0];
    
    return {
      temperature: current.temperature,
      temperatureUnit: current.temperatureUnit,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      shortForecast: current.shortForecast,
      detailedForecast: current.detailedForecast,
      icon: current.icon,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    return null;
  }
};

export const fetchUVIndex = async (latitude, longitude) => {
  try {
    // NOAA UV Index API
    const response = await axios.get(`https://www.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`);
    return {
      uvIndex: response.data.result.uv,
      safeExposureTime: response.data.result.safe_exposure_time,
    };
  } catch (error) {
    console.warn('UV Index not available:', error);
    return null;
  }
};
