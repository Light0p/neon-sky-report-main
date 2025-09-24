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
import { Cloud, CloudRain, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AuthModal } from '@/components/AuthModal';
import { useNavigate } from 'react-router-dom';

export const WeatherApp = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setShowAuthModal(true);
    }
  };

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
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Updated Header */}
        <header className="flex items-center justify-between mb-12 relative">
          {/* Left spacer for centering */}
          <div className="w-12"></div>

          {/* Centered Title */}
          <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
            <CloudRain className="h-12 w-12 text-neon-blue animate-pulse" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Weather<span className="text-neon-cyan">Hub</span>
            </h1>
          </div>

          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="relative z-10 transition-transform hover:scale-105"
          >
            <Avatar className="h-12 w-12 border-2 border-neon-blue neon-glow cursor-pointer">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-card text-neon-blue font-bold">
                {isAuthenticated && user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </button>
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

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};
