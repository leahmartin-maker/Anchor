import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const NOAA_BASE = 'https://api.weather.gov';

const toFahrenheit = (celsiusValue) => {
  if (celsiusValue === null || celsiusValue === undefined || Number.isNaN(Number(celsiusValue))) {
    return null;
  }

  return ((Number(celsiusValue) * 9) / 5) + 32;
};

const parseNumeric = (value) => {
  if (value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseFeet = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return value;

  const cleaned = String(value).replace(/[^\d.\-–—to\s]/g, '').trim();
  const match = cleaned.match(/-?\d*\.?\d+/);
  if (!match) return null;

  const numeric = Number(match[0]);
  if (Number.isNaN(numeric)) return null;
  return numeric;
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

const formatWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
};

const getMoonIcon = (phase) => {
  const normalized = ((phase % 1) + 1) % 1;

  if (normalized < 0.0625 || normalized >= 0.9375) return '🌑';
  if (normalized < 0.1875) return '🌒';
  if (normalized < 0.3125) return '🌓';
  if (normalized < 0.4375) return '🌔';
  if (normalized < 0.5625) return '🌕';
  if (normalized < 0.6875) return '🌖';
  if (normalized < 0.8125) return '🌗';
  return '🌘';
};

const getRipCurrentRisk = ({ windMph, waveHeightFt }) => {
  const wind = Number(windMph) || 0;
  const wave = Number(waveHeightFt) || 0;
  const score = (wind >= 15 ? 1 : 0) + (wind >= 25 ? 1 : 0) + (wave >= 3 ? 1 : 0) + (wave >= 5 ? 1 : 0);

  if (score >= 3) return { label: 'High', tone: 'bg-red-500/90 text-white' };
  if (score >= 2) return { label: 'Moderate', tone: 'bg-amber-400/90 text-slate-900' };
  if (score >= 1) return { label: 'Low', tone: 'bg-emerald-400/90 text-slate-900' };
  return { label: 'Very Low', tone: 'bg-cyan-400/90 text-slate-900' };
};

const getNextSunEvent = (sunrise, sunset, now) => {
  const sunriseTime = sunrise ? new Date(sunrise) : null;
  const sunsetTime = sunset ? new Date(sunset) : null;

  if (!sunriseTime || !sunsetTime) return { label: 'Sunrise', time: '—' };

  if (now < sunriseTime) {
    return { label: 'Sunrise', time: sunriseTime };
  }

  if (now < sunsetTime) {
    return { label: 'Sunset', time: sunsetTime };
  }

  return { label: 'Sunrise', time: sunriseTime };
};

const getNearestStation = async (latitude, longitude) => {
  const response = await axios.get(
    `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&radius=25&lat=${latitude}&lon=${longitude}&units=english`
  );

  const stations = response.data?.stations || [];
  if (!stations.length) return null;

  return stations[0];
};

const getWaterTemperature = async (stationId) => {
  if (!stationId) return null;

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const response = await axios.get(
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&application=Anchor&station=${stationId}&begin_date=${today}&end_date=${today}&units=english&time_zone=gmt&format=json`
  );

  const values = response.data?.data || [];
  const latest = values[values.length - 1];
  const value = parseNumeric(latest?.v);

  if (value === null) return null;
  return toFahrenheit(value);
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
      waveHeightFt: waveHeightFt !== null ? Math.round(waveHeightFt * 10) / 10 : null,
      swellPeriodSec: swellPeriodSec !== null ? Math.round(swellPeriodSec) : null,
    };
  } catch (error) {
    console.warn('NOAA wave forecast unavailable', error);
    return { waveHeightFt: null, swellPeriodSec: null };
  }
};

const getTideInfo = async (stationId) => {
  if (!stationId) return { currentTideFt: null, nextHigh: null, nextLow: null };

  const now = new Date();
  const startDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 10);
  const endDate = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0, 10);

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
};

const getOpenMeteoData = async (latitude, longitude) => {
  const response = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m,uv_index&daily=uv_index_max,sunrise,sunset,moon_phase&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
  );

  const current = response.data?.current || {};
  const daily = response.data?.daily || {};
  const rise = daily.sunrise?.[0];
  const set = daily.sunset?.[0];
  const moonPhase = parseNumeric(daily.moon_phase?.[0]);

  return {
    airTempF: parseNumeric(current.temperature_2m),
    uvIndex: parseNumeric(current.uv_index ?? daily.uv_index_max?.[0]),
    windMph: parseNumeric(current.wind_speed_10m),
    windDirectionDegrees: parseNumeric(current.wind_direction_10m),
    sunrise: rise || null,
    sunset: set || null,
    moonPhase: moonPhase !== null ? moonPhase : null,
  };
};

export default function WeatherHUD() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (!navigator.geolocation) {
          setLoading(false);
          return;
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

        const stationId = station?.id;
        const [waterTempF, tideInfo] = await Promise.all([
          getWaterTemperature(stationId),
          getTideInfo(stationId),
        ]);

        if (!active) return;

        const now = new Date();
        const tideLabel = tideInfo.nextHigh && tideInfo.nextLow
          ? (tideInfo.nextHigh.time.getTime() < tideInfo.nextLow.time.getTime() ? 'High' : 'Low')
          : 'Tide';

        const nextSunEvent = getNextSunEvent(openMeteo.sunrise, openMeteo.sunset, now);
        const ripRisk = getRipCurrentRisk({
          windMph: openMeteo.windMph,
          waveHeightFt: waveForecast.waveHeightFt,
        });

        setWeather({
          airTempF: openMeteo.airTempF,
          uvIndex: openMeteo.uvIndex,
          windMph: openMeteo.windMph,
          windDirection: openMeteo.windDirectionDegrees,
          waterTempF: waterTempF,
          waveHeightFt: waveForecast.waveHeightFt,
          swellPeriodSec: waveForecast.swellPeriodSec,
          currentTideFt: tideInfo.currentTideFt,
          nextHigh: tideInfo.nextHigh,
          nextLow: tideInfo.nextLow,
          tideLabel,
          sunrise: openMeteo.sunrise,
          sunset: openMeteo.sunset,
          moonPhase: openMeteo.moonPhase,
          nextSunEvent,
          ripRisk,
        });
      } catch (error) {
        console.warn('WeatherHUD fetch error:', error);
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
    if (!weather) return [];

    return [
      {
        key: 'air-temp',
        placement: 'left-4 top-4',
        title: 'Air Temp',
        value: weather.airTempF !== null ? `${Math.round(weather.airTempF)}°F` : '—',
        subtext: 'Surface air',
      },
      {
        key: 'uv-index',
        placement: 'left-1/2 top-4 -translate-x-1/2',
        title: 'UV Index',
        value: weather.uvIndex !== null ? `${Math.round(weather.uvIndex)}` : '—',
        subtext: 'Exposure',
      },
      {
        key: 'wind',
        placement: 'right-4 top-4',
        title: 'Wind',
        value: weather.windMph !== null ? `${Math.round(weather.windMph)} mph` : '—',
        subtext: weather.windDirection !== null ? `${formatWindDirection(weather.windDirection)} wind` : 'Direction',
      },
      {
        key: 'water-temp',
        placement: 'left-4 top-1/2 -translate-y-1/2',
        title: 'Water Temp',
        value: weather.waterTempF !== null ? `${Math.round(weather.waterTempF)}°F` : '—',
        subtext: 'Surface water',
      },
      {
        key: 'waves',
        placement: 'right-4 top-1/2 -translate-y-1/2',
        title: 'Wave / Swell',
        value: `${weather.waveHeightFt !== null ? `${weather.waveHeightFt.toFixed(1)} ft` : '—'} / ${weather.swellPeriodSec !== null ? `${weather.swellPeriodSec}s` : '—'}`,
        subtext: 'Height / period',
      },
      {
        key: 'risk',
        placement: 'left-4 bottom-4',
        title: 'Rip Current',
        value: weather.ripRisk.label,
        subtext: `${weather.windMph !== null ? `${Math.round(weather.windMph)} mph wind` : 'Wind'} · ${weather.waveHeightFt !== null ? `${weather.waveHeightFt.toFixed(1)} ft swell` : 'Wave data'}`,
      },
      {
        key: 'tide',
        placement: 'left-1/2 bottom-4 -translate-x-1/2',
        title: 'Tide',
        value: `${weather.currentTideFt !== null ? `${weather.currentTideFt.toFixed(1)} ft` : '—'}`,
        subtext: `${weather.nextHigh ? `Next high ${formatTime(weather.nextHigh.time)}` : 'Next high —'} · ${weather.nextLow ? `Next low ${formatTime(weather.nextLow.time)}` : 'Next low —'}`,
      },
      {
        key: 'moon',
        placement: 'right-4 bottom-4',
        title: 'Moon / Sun',
        value: `${weather.moonPhase !== null ? getMoonIcon(weather.moonPhase) : '🌙'} ${weather.nextSunEvent.time ? formatTime(weather.nextSunEvent.time) : '—'}`,
        subtext: weather.nextSunEvent.label,
      },
    ];
  }, [weather]);

  if (loading) {
    return (
      <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
        <div className="rounded-full border border-white/20 bg-slate-950/70 px-4 py-2 text-xs font-medium text-slate-100 shadow-lg backdrop-blur-sm">
          Loading ocean conditions…
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`absolute ${card.placement} min-w-[180px] max-w-[220px] rounded-2xl border border-white/20 bg-slate-950/70 px-3 py-2 text-white shadow-lg backdrop-blur-sm`}
        >
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/80">
            {card.title}
          </div>
          <div className="text-lg font-bold tracking-tight text-white">{card.value}</div>
          <div className="mt-1 text-[10px] leading-relaxed text-slate-200/80 whitespace-pre-line">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
}
