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

    let waterTemperature = null;
    let waterTemperatureUnit = null;

    try {
      const stationsResponse = await axios.get(
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&radius=25&lat=${latitude}&lon=${longitude}&units=metric`
      );

      const stations = stationsResponse.data?.stations || [];
      const station = stations[0];

      if (station?.id) {
        const now = new Date();
        const dateString = now.toISOString().slice(0, 10).replace(/-/g, '');

        const waterResponse = await axios.get(
          `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&application=Anchor&station=${station.id}&begin_date=${dateString}&end_date=${dateString}&units=metric&time_zone=gmt&format=json`
        );

        const values = waterResponse.data?.data || [];
        const latestReading = values[values.length - 1];

        if (latestReading) {
          waterTemperature = Number(latestReading.v);
          waterTemperatureUnit = 'C';
        }
      }
    } catch (waterError) {
      console.warn('Water temperature unavailable from NOAA stations:', waterError);
    }

    return {
      temperature: current.temperature,
      temperatureUnit: current.temperatureUnit,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      waterTemperature,
      waterTemperatureUnit,
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
