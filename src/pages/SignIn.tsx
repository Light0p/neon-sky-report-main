import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, CloudRain } from 'lucide-react';
import React from 'react';

declare global {
  interface Window {
    google: any;
  }
}

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully.',
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = (response: any) => {
    setLoading(true);
    loginWithGoogle(response.credential)
      .then(() => {
        toast({
          title: 'Welcome!',
          description: 'You have been signed in with Google successfully.',
        });
        navigate(from, { replace: true });
      })
      .catch((error) => {
        toast({
          title: 'Google Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4 py-8 w-full overflow-x-hidden">
      <div className="w-full max-w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CloudRain className="h-12 w-12 text-neon-blue animate-pulse" />
            <h1 className="text-4xl font-bold text-foreground">
              Weather<span className="text-neon-cyan">Hub</span>
            </h1>
          </div>
          <p className="text-muted-foreground">Sign in to access your weather dashboard</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-neon-blue focus:border-neon-blue"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-neon-blue focus:border-neon-blue"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-neon-blue hover:bg-neon-blue/90 text-white font-semibold py-3 rounded-xl transition-all duration-300 neon-glow"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/50"></div>
            <span className="text-muted-foreground text-sm">or</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>

          {/* Google Sign In */}
          <div id="google-signin-button" className="w-full"></div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-neon-cyan hover:text-neon-blue transition-colors font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
