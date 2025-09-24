import { WeatherData } from '@/services/weatherApi';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard = ({ weather }: WeatherCardProps) => {
  const { location, current } = weather;

  return (
    <div className="bg-gradient-card rounded-2xl p-8 shadow-card card-hover fade-in">
      {/* Location */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">{location.name}</h2>
        <p className="text-muted-foreground text-lg">{location.country}</p>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="text-center">
          <div className="text-6xl font-light text-neon-blue mb-2 pulse-neon">
            {current.temperature}°
          </div>
          <p className="text-xl text-foreground capitalize">{current.condition}</p>
        </div>

        <div className="w-20 h-20 flex items-center justify-center">
          <img
            src={`https:${current.icon}`}
            alt={current.condition}
            className="w-16 h-16 drop-shadow-lg"
          />
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="bg-weather-card rounded-xl p-4">
          <div className="text-2xl font-semibold text-neon-cyan">{current.feelsLike}°</div>
          <div className="text-sm text-muted-foreground">Feels like</div>
        </div>
        <div className="bg-weather-card rounded-xl p-4">
          <div className="text-2xl font-semibold text-neon-cyan">{current.humidity}%</div>
          <div className="text-sm text-muted-foreground">Humidity</div>
        </div>
        <div className="bg-weather-card rounded-xl p-4">
          <div className="text-2xl font-semibold text-neon-cyan">{current.windSpeed}</div>
          <div className="text-sm text-muted-foreground">km/h</div>
        </div>
      </div>
    </div>
  );
};
