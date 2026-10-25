import { apiClient } from './apiClient';
import { WeatherConditionData } from '../types';

export interface WeatherLocationOption {
  id: string;
  name: string;
  caseRef: string;
  latitude: number;
  longitude: number;
}

export const PRESET_INVESTIGATION_LOCATIONS: WeatherLocationOption[] = [
  {
    id: 'loc-ny',
    name: 'Manhattan, New York (Apex Tower Penthouse)',
    caseRef: 'NY-2026-0884',
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 'loc-la',
    name: 'Los Angeles, California (Silverlake Residence)',
    caseRef: 'LA-2026-0317',
    latitude: 34.0522,
    longitude: -118.2437
  },
  {
    id: 'loc-chicago',
    name: 'Chicago, Illinois (Loop Financial Vault)',
    caseRef: 'CH-2026-1192',
    latitude: 41.8781,
    longitude: -87.6298
  },
  {
    id: 'loc-london',
    name: 'London, UK (Docklands Cyber Facility)',
    caseRef: 'LN-2026-0422',
    latitude: 51.5074,
    longitude: -0.1278
  },
  {
    id: 'loc-tokyo',
    name: 'Tokyo, Japan (Shinjuku Quantum Lab)',
    caseRef: 'TK-2026-0914',
    latitude: 35.6762,
    longitude: 139.6503
  }
];

// WMO Weather Interpretation Codes (WW)
const WMO_CODE_MAP: Record<number, string> = {
  0: 'Clear Sky / High Visibility',
  1: 'Mainly Clear Atmospheric Band',
  2: 'Partly Cloudy / Sparse Overcast',
  3: 'Overcast / Low-Light Cloud Ceiling',
  45: 'Dense Fog / Optical Obscuration',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle / Surface Moisture',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle / Reduced Friction',
  61: 'Slight Rain / Acoustic Dampening',
  63: 'Moderate Rain / Rainwash Condition',
  65: 'Heavy Rain / Runoff & Washout',
  71: 'Slight Snow Fall',
  73: 'Moderate Snow Fall',
  75: 'Heavy Snow Fall / Trace Concealment',
  80: 'Rain Showers / Intermittent Visibility',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm / High EMP Fluctuations',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
};

export const weatherApi = {
  /**
   * Fetches real-time environmental atmospheric conditions from Open-Meteo
   */
  async getCurrentWeather(
    latitude: number = 40.7128,
    longitude: number = -74.0060,
    locationLabel: string = 'Manhattan, NY',
    signal?: AbortSignal
  ): Promise<WeatherConditionData> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;

    const raw = await apiClient.get<any>(url, { signal });

    const current = raw.current || {};
    const weatherCode = current.weather_code ?? 0;
    const conditionText = WMO_CODE_MAP[weatherCode] || 'Atmospheric Stasis / Clear';

    return {
      temperature: current.temperature_2m ?? 18.5,
      apparentTemperature: current.apparent_temperature ?? 17.8,
      relativeHumidity: current.relative_humidity_2m ?? 55,
      windSpeed: current.wind_speed_10m ?? 8.2,
      weatherCode,
      conditionText,
      time: current.time ? new Date(current.time).toLocaleString() : new Date().toLocaleString(),
      locationName: locationLabel,
      coordinates: {
        latitude,
        longitude
      }
    };
  }
};
