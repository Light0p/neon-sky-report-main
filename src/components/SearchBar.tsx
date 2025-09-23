import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md mx-auto">
      <Input
        type="text"
        placeholder="Enter city name..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="bg-weather-card border-border text-foreground placeholder:text-muted-foreground 
                   focus:ring-2 focus:ring-neon-blue focus:border-transparent
                   rounded-xl px-4 py-3 text-lg"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || !city.trim()}
        className="bg-gradient-neon hover:shadow-neon text-primary-foreground 
                   px-6 py-3 rounded-xl font-medium transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Search className="h-5 w-5" />
      </Button>
    </form>
  );
};