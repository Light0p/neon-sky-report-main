import fetch from 'node-fetch';

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    day: string;
    icon: string;
    maxTemp: number;
    minTemp: number;
  }>;
}

interface RawApiResponse {
  location: { name: string; country: string };
  current: {
    temp_c: number;
    condition: { text: string; icon: string };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: { icon: string };
      };
    }>;
  };
}

const API_BASE_URL = 'https://api.weatherapi.com/v1';
const API_KEY = process.env.WEATHER_API_KEY!;

export async function fetchWeatherFromAPI(city: string): Promise<WeatherData> {
  const response = await fetch(
    `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no&alerts=no`
  );
  if (!response.ok) {
    throw new Error('City not found');
  }
  const raw = (await response.json()) as RawApiResponse;

  return {
    location: {
      name: raw.location.name,
      country: raw.location.country,
    },
    current: {
      temperature: raw.current.temp_c,
      condition: raw.current.condition.text,
      icon: raw.current.condition.icon,
      humidity: raw.current.humidity,
      windSpeed: raw.current.wind_kph,
      feelsLike: raw.current.feelslike_c,
    },
    forecast: raw.forecast.forecastday.map((day) => ({
      date: day.date,
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
      icon: day.day.condition.icon,
      maxTemp: day.day.maxtemp_c,
      minTemp: day.day.mintemp_c,
    })),
  };
}
