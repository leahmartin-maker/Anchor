import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const NOAA_BASE = 'https://api.weather.gov';

const parseNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const toFahrenheit = (celsiusValue) => {
  const value = parseNumeric(celsiusValue);
  if (value === null) return null;
  return ((value * 9) / 5) + 32;
};

const parseFeet = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;

  const cleaned = String(value).replace(/[^\d.\-–—to\s]/g, '').trim();
  const match = cleaned.match(/-?\d*\.?\d+/);
  if (!match) return null;

  const numeric = Number(match[0]);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatTime = (value) => {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
};

const formatNoaaDate = (date) => {
  const normalized = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return normalized.toISOString().slice(0, 10).replace(/-/g, '');
};

const getNextSunEvent = (sunrise, sunset, now) => {
  const sunriseTime = sunrise ? new Date(sunrise) : null;
  const sunsetTime = sunset ? new Date(sunset) : null;

  if (!sunriseTime || !sunsetTime) return { time: null };
  if (now < sunriseTime) return { time: sunriseTime };
  if (now < sunsetTime) return { time: sunsetTime };
  return { time: sunriseTime };
};

const getRipCurrentRisk = ({ windMph, waveHeightFt }) => {
  const wind = Number(windMph) || 0;
  const wave = Number(waveHeightFt) || 0;
  const score = (wind >= 15 ? 1 : 0) + (wind >= 25 ? 1 : 0) + (wave >= 3 ? 1 : 0) + (wave >= 5 ? 1 : 0);

  if (score >= 3) return 'High';
  if (score >= 2) return 'Moderate';
  if (score >= 1) return 'Low';
  return 'Very Low';
};

const getOpenMeteoData = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,uv_index&daily=uv_index_max,sunrise,sunset,moon_phase&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
    );

    const current = response.data?.current || {};
    const daily = response.data?.daily || {};
    const moonPhase = parseNumeric(daily.moon_phase?.[0]);

    return {
      airTempF: parseNumeric(current.temperature_2m),
      uvIndex: parseNumeric(current.uv_index ?? daily.uv_index_max?.[0]),
      windMph: parseNumeric(current.wind_speed_10m),
      windDirectionDegrees: parseNumeric(current.wind_direction_10m),
      sunrise: daily.sunrise?.[0] || null,
      sunset: daily.sunset?.[0] || null,
      moonPhase: moonPhase !== null ? moonPhase : null,
    };
  } catch (error) {
    console.warn('Open-Meteo data unavailable:', error);
    return {
      airTempF: null,
      uvIndex: null,
      windMph: null,
      windDirectionDegrees: null,
      sunrise: null,
      sunset: null,
      moonPhase: null,
    };
  }
};

const getNearestStation = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&radius=25&lat=${latitude}&lon=${longitude}&units=english`
    );

    const stations = response.data?.stations || [];
    return stations.length ? stations[0] : null;
  } catch (error) {
    console.warn('NOAA station lookup failed:', error);
    return null;
  }
};

const getWaterTemperature = async (stationId) => {
  if (!stationId) return null;

  try {
    const today = formatNoaaDate(new Date());
    const response = await axios.get(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&application=Anchor&station=${stationId}&begin_date=${today}&end_date=${today}&units=english&time_zone=gmt&format=json`
    );

    const values = response.data?.data || [];
    const latest = values[values.length - 1];
    const value = parseNumeric(latest?.v);
    return value === null ? null : toFahrenheit(value);
  } catch (error) {
    console.warn('Water temperature unavailable:', error);
    return null;
  }
};

const getWaveForecast = async (latitude, longitude) => {
  try {
    const pointsResponse = await axios.get(`${NOAA_BASE}/points/${latitude},${longitude}`);
    const properties = pointsResponse.data?.properties || {};
    const gridId = properties.gridId;
    const gridX = properties.gridX;
    const gridY = properties.gridY;

    if (!gridId || gridX === undefined || gridY === undefined) {
      return { waveHeightFt: null, swellPeriodSec: null };
    }

    const forecastResponse = await axios.get(
      `${NOAA_BASE}/gridpoints/${gridId}/${gridX},${gridY}/forecast?units=us`
    );

    const periods = forecastResponse.data?.properties?.periods || [];
    const first = periods.find((period) => period.waveHeight || period.wavePeriod || period.swellPeriod) || periods[0];

    const waveHeightFt = parseFeet(first?.waveHeight || first?.waveHeightFt || first?.waveHeightValue || first?.waveHeightSummary);
    const swellPeriodSec = parseNumeric(first?.swellPeriod || first?.wavePeriod || first?.swellPeriodSec);

    return {
      waveHeightFt: waveHeightFt !== null ? Number(waveHeightFt.toFixed(1)) : null,
      swellPeriodSec: swellPeriodSec !== null ? Math.round(swellPeriodSec) : null,
    };
  } catch (error) {
    console.warn('Wave forecast unavailable:', error);
    return { waveHeightFt: null, swellPeriodSec: null };
  }
};

const getTideInfo = async (stationId) => {
  if (!stationId) return { currentTideFt: null, nextHigh: null, nextLow: null };

  try {
    const now = new Date();
    const startDate = formatNoaaDate(new Date(now.getTime() - (60 * 60 * 1000)));
    const endDate = formatNoaaDate(new Date(now.getTime() + (48 * 60 * 60 * 1000)));

    const response = await axios.get(
      `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=Anchor&station=${stationId}&begin_date=${startDate}&end_date=${endDate}&datum=MLLW&time_zone=gmt&units=feet&format=json`
    );

    const predictions = response.data?.predictions || [];
    if (!predictions.length) {
      return { currentTideFt: null, nextHigh: null, nextLow: null };
    }

    const byTime = predictions
      .map((item) => ({
        time: new Date(item.t),
        height: parseNumeric(item.v),
      }))
      .filter((item) => item.time && Number.isFinite(item.height));

    if (!byTime.length) {
      return { currentTideFt: null, nextHigh: null, nextLow: null };
    }

    const nowMs = now.getTime();
    const nearest = byTime.reduce((closest, item) => {
      const diff = Math.abs(item.time.getTime() - nowMs);
      if (!closest || diff < closest.diff) {
        return { item, diff };
      }
      return closest;
    }, null)?.item;

    const upcoming = byTime.filter((item) => item.time.getTime() >= nowMs);
    const nextHigh = upcoming.reduce((best, item) => {
      if (!best || item.height > best.height) return item;
      return best;
    }, null);

    const nextLow = upcoming.reduce((best, item) => {
      if (!best || item.height < best.height) return item;
      return best;
    }, null);

    return {
      currentTideFt: nearest ? Number(nearest.height.toFixed(1)) : null,
      nextHigh: nextHigh ? { time: nextHigh.time, height: Number(nextHigh.height.toFixed(1)) } : null,
      nextLow: nextLow ? { time: nextLow.time, height: Number(nextLow.height.toFixed(1)) } : null,
    };
  } catch (error) {
    console.warn('Tide data unavailable:', error);
    return { currentTideFt: null, nextHigh: null, nextLow: null };
  }
};

export default function WeatherHUD() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is unavailable on this device.');
        }

        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 600000,
          });
        });

        const { latitude, longitude } = position.coords;
        const [openMeteo, station, waveForecast] = await Promise.all([
          getOpenMeteoData(latitude, longitude),
          getNearestStation(latitude, longitude),
          getWaveForecast(latitude, longitude),
        ]);

        const stationId = station?.id || null;
        const [waterTempF, tideInfo] = await Promise.all([
          getWaterTemperature(stationId),
          getTideInfo(stationId),
        ]);

        if (!active) return;

        setWeather({
          airTempF: openMeteo.airTempF,
          uvIndex: openMeteo.uvIndex,
          windMph: openMeteo.windMph,
          waterTempF,
          waveHeightFt: waveForecast.waveHeightFt,
          swellPeriodSec: waveForecast.swellPeriodSec,
          currentTideFt: tideInfo.currentTideFt,
          nextSunEvent: getNextSunEvent(openMeteo.sunrise, openMeteo.sunset, new Date()),
          ripRisk: getRipCurrentRisk({
            windMph: openMeteo.windMph,
            waveHeightFt: waveForecast.waveHeightFt,
          }),
        });
        setError(null);
      } catch (err) {
        console.warn('WeatherHUD fetch error:', err);
        if (active) {
          setWeather({
            airTempF: null,
            uvIndex: null,
            windMph: null,
            waterTempF: null,
            waveHeightFt: null,
            swellPeriodSec: null,
            currentTideFt: null,
            nextSunEvent: { time: null },
            ripRisk: '—',
          });
          setError(err?.message || 'Weather data unavailable');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(() => {
    const data = weather || {
      airTempF: null,
      uvIndex: null,
      windMph: null,
      waterTempF: null,
      waveHeightFt: null,
      swellPeriodSec: null,
      currentTideFt: null,
      nextSunEvent: { time: null },
      ripRisk: '—',
    };

    return [
      {
        key: 'air-temp',
        icon: 'thermometer',
        value: data.airTempF !== null ? `${Math.round(data.airTempF)}°F` : '—',
        className: 'left-3 top-3',
        width: 110,
      },
      {
        key: 'uv-index',
        icon: 'sun',
        value: data.uvIndex !== null ? `${Math.round(data.uvIndex)}` : '—',
        className: 'left-1/2 top-3 -translate-x-1/2',
        width: 94,
      },
      {
        key: 'wind',
        icon: 'wind',
        value: data.windMph !== null ? `${Math.round(data.windMph)} mph` : '—',
        className: 'right-3 top-3',
        width: 110,
      },
      {
        key: 'water-temp',
        icon: 'water',
        value: data.waterTempF !== null ? `${Math.round(data.waterTempF)}°F` : '—',
        className: 'left-3 top-1/2 -translate-y-1/2',
        width: 110,
      },
      {
        key: 'waves',
        icon: 'wave',
        value: `${data.waveHeightFt !== null ? `${data.waveHeightFt.toFixed(1)} ft` : '—'} / ${data.swellPeriodSec !== null ? `${data.swellPeriodSec}s` : '—'}`,
        className: 'right-3 top-1/2 -translate-y-1/2',
        width: 150,
      },
      {
        key: 'rip-current',
        icon: 'alert',
        value: data.ripRisk || '—',
        className: 'left-3 bottom-3',
        width: 110,
      },
      {
        key: 'tide',
        icon: 'tide',
        value: data.currentTideFt !== null ? `${data.currentTideFt.toFixed(1)} ft` : '—',
        className: 'left-1/2 bottom-3 -translate-x-1/2',
        width: 120,
      },
      {
        key: 'moon-sun',
        icon: data.nextSunEvent?.time ? 'sun' : 'moon',
        value: data.nextSunEvent?.time ? formatTime(data.nextSunEvent.time) : '—',
        className: 'right-3 bottom-3',
        width: 118,
      },
    ];
  }, [weather]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30" style={{ inset: 10 }}>
      {cards.map((card) => (
        <div
          key={card.key}
          className={`absolute ${card.className} flex items-center justify-between gap-2 rounded-[12px] border border-white/10 bg-black/75 px-2.5 py-2 shadow-lg backdrop-blur-sm`}
          style={{
            width: card.width,
            minHeight: 42,
            padding: '8px 10px',
            opacity: 0.8,
          }}
        >
          <div className="flex h-5 w-5 items-center justify-center text-white/90">
            {loading ? (
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-white/35 border-t-white animate-spin" />
            ) : (
              <WeatherIcon type={card.icon} />
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end overflow-hidden text-right">
            {loading ? (
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-white/35 border-t-white animate-spin" />
            ) : (
              <span className="text-[13px] font-bold leading-none text-white">{card.value}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WeatherIcon({ type }) {
  const base = 'h-4 w-4 stroke-current fill-none stroke-[1.8]';

  switch (type) {
    case 'thermometer':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M14 4.5a2.5 2.5 0 1 0-5 0V13a4.5 4.5 0 1 0 5 0V4.5Z" />
          <path d="M12 15.5v-7" />
          <path d="M12 15.5a2 2 0 1 1 0 4a2 2 0 0 1 0-4Z" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M12 3.5c3.2 4.1 5 6.1 5 8.7A5 5 0 1 1 7 12.2c0-2.6 1.8-4.6 5-8.7Z" />
        </svg>
      );
    case 'wind':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M3 9h12a2 2 0 1 0-2-2" />
          <path d="M3 15h15a2 2 0 1 1-2 2" />
          <path d="M4 12h16" />
        </svg>
      );
    case 'sun':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2L5.6 5.6" />
        </svg>
      );
    case 'wave':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M2 14c2.3 0 2.3-2 4.5-2s2.2 2 4.5 2 2.2-2 4.5-2 2.2 2 4.5 2" />
          <path d="M2 18c2.3 0 2.3-2 4.5-2s2.2 2 4.5 2 2.2-2 4.5-2 2.2 2 4.5 2" />
        </svg>
      );
    case 'alert':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M12 3.5 21 19H3L12 3.5Z" />
          <path d="M12 8.5v4.8" />
          <path d="M12 17.2h.01" />
        </svg>
      );
    case 'tide':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M5 15c2-2 3.8-2 5.6 0s3.6 2 5.4 0 3.1-2 5 0" />
          <path d="M5 11c2-2 3.8-2 5.6 0s3.6 2 5.4 0 3.1-2 5 0" />
        </svg>
      );
    case 'moon':
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <path d="M14.8 3.8A7.5 7.5 0 1 0 20.2 13a6 6 0 0 1-5.4-9.2Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={base} aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
