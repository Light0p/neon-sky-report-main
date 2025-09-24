import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WeatherData, fetchWeatherFromAPI } from '@/services/weatherApi';
import { SearchBar } from './SearchBar';
import { WeatherCard } from './WeatherCard';
import { ForecastCard } from './ForecastCard';
import { useAuth } from '@/contexts/AuthContext';
import UserMenu from './UserMenu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Cloud, CloudRain } from 'lucide-react';

export const WeatherApp = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    try {
      const weatherData = await fetchWeatherFromAPI(city);
      setWeather(weatherData);
      toast({
        title: "Weather Updated",
        description: `Successfully loaded weather for ${weatherData.location.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-full">
        {/* Header */}
        <header className="w-full max-w-full overflow-x-hidden mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <CloudRain className="h-8 w-8 sm:h-12 sm:w-12 text-neon-blue animate-pulse" />
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground text-center sm:text-left">
                Weather<span className="text-neon-cyan">Hub</span>
              </h1>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link to="/signin" className="flex-1 sm:flex-none">
                    <Button 
                      variant="ghost" 
                      className="w-full sm:w-auto text-foreground hover:text-neon-blue border border-border/50 hover:border-neon-blue/50 transition-colors text-sm px-3 py-2"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto bg-neon-blue hover:bg-neon-blue/90 text-white neon-glow text-sm px-3 py-2">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Welcome Message or Description */}
        <div className="text-center mb-8">
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Get real-time weather updates for any city worldwide
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center">
            <Cloud className="h-16 w-16 text-neon-blue animate-pulse mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">Loading weather data...</p>
          </div>
        )}

        {/* Weather Content */}
        {weather && !isLoading && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Current Weather */}
            <WeatherCard weather={weather} />

            {/* 3-Day Forecast */}
            <div className="fade-in">
              <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
                3-Day Forecast
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weather.forecast.map((forecast, index) => (
                  <ForecastCard
                    key={index}
                    day={forecast.day}
                    icon={forecast.icon}
                    maxTemp={forecast.maxTemp}
                    minTemp={forecast.minTemp}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message */}
        {!weather && !isLoading && (
          <div className="text-center max-w-md mx-auto fade-in">
            <Cloud className="h-24 w-24 text-neon-blue/50 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Welcome to WeatherHub
            </h2>
            <p className="text-muted-foreground">
              Search for any city to get started with real-time weather updates and
              forecasts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
