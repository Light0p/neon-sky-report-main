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

const API_KEY = 'a8412402821304a7f6264d99b3a4e195';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherApi = {
  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const currentResponse = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!currentResponse.ok) {
        throw new Error('City not found');
      }
      
      const currentData = await currentResponse.json();
      
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Process forecast data for next 3 days
      const dailyForecasts = forecastData.list
        .filter((_: any, index: number) => index % 8 === 0)
        .slice(1, 4)
        .map((item: any) => ({
          date: item.dt_txt.split(' ')[0],
          day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          icon: getWeatherIcon(item.weather[0].main.toLowerCase()),
          maxTemp: Math.round(item.main.temp_max),
          minTemp: Math.round(item.main.temp_min),
        }));
      
      return {
        location: {
          name: currentData.name,
          country: currentData.sys.country,
        },
        current: {
          temperature: Math.round(currentData.main.temp),
          condition: currentData.weather[0].description,
          icon: getWeatherIcon(currentData.weather[0].main.toLowerCase()),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
          feelsLike: Math.round(currentData.main.feels_like),
        },
        forecast: dailyForecasts,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch weather data');
    }
  },
};

function getWeatherIcon(condition: string): string {
  switch (condition) {
    case 'clear':
      return 'sun';
    case 'clouds':
      return 'cloud';
    case 'rain':
    case 'drizzle':
      return 'rain';
    case 'snow':
      return 'snow';
    case 'mist':
    case 'fog':
    case 'haze':
      return 'mist';
    default:
      return 'cloud';
  }
}