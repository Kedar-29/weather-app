export type Units = "metric" | "imperial";

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

export interface WindData {
  speed: number;
  deg: number;
}

/** Current /weather response */
export interface CurrentWeatherResponse {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  base?: string;
  main: MainWeatherData;
  visibility?: number;
  wind: WindData;
  clouds?: { all: number };
  dt: number;
  sys?: { country?: string; sunrise?: number; sunset?: number };
  timezone?: number;
  id?: number;
  name: string;
  cod?: number;
}

/** OneCall simplified payload */
export interface HourlyPoint {
  dt: number;
  temp: number;
  pop?: number;
}

export interface DailyTemp { day: number; min: number; max: number; }

export interface DailyPoint { dt: number; temp: DailyTemp; pop?: number; }

export interface OneCallPayload {
  lat: number;
  lon: number;
  timezone: string;
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_deg?: number;
    uvi?: number;
    weather: WeatherCondition[];
  };
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}
