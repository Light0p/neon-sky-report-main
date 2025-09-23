import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-24 w-24 text-neon-blue mx-auto mb-6 animate-pulse" />
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! Page not found</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-gradient-neon hover:shadow-neon text-primary-foreground px-8 py-3 rounded-xl font-medium"
        >
          <Home className="mr-2 h-5 w-5" />
          Return to WeatherHub
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
