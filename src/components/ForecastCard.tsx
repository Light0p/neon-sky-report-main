import sunIcon from '@/assets/sun.png';
import cloudIcon from '@/assets/cloud.png';
import rainIcon from '@/assets/rain.png';
import snowIcon from '@/assets/snow.png';
import mistIcon from '@/assets/mist.png';

interface ForecastCardProps {
  day: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
}

const iconMap = {
  sun: sunIcon,
  cloud: cloudIcon,
  rain: rainIcon,
  snow: snowIcon,
  mist: mistIcon,
};

export const ForecastCard = ({ day, icon, maxTemp, minTemp }: ForecastCardProps) => {
  return (
    <div className="bg-gradient-card rounded-xl p-6 text-center card-hover slide-up
                    min-w-[140px] flex-1">
      <div className="text-lg font-medium text-foreground mb-3">
        {day}
      </div>
      
      <div className="w-12 h-12 mx-auto mb-4">
        <img
          src={iconMap[icon as keyof typeof iconMap]}
          alt={`${day} weather`}
          className="w-full h-full"
        />
      </div>
      
      <div className="space-y-1">
        <div className="text-xl font-semibold text-neon-blue">
          {maxTemp}°
        </div>
        <div className="text-sm text-muted-foreground">
          {minTemp}°
        </div>
      </div>
    </div>
  );
};