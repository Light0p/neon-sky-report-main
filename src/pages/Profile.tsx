import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CloudRain, User, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
                <Card className="w-full max-w-md bg-gradient-card rounded-2xl p-8 shadow-card border border-border/20">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
                        <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
                        <Link to="/">
                            <Button className="bg-neon-blue hover:bg-neon-blue/90 text-white neon-glow">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-primary">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <Link to="/" className="flex items-center gap-3">
                        <CloudRain className="h-8 w-8 text-neon-blue" />
                        <h1 className="text-2xl font-bold text-foreground">
                            Weather<span className="text-neon-cyan">Hub</span>
                        </h1>
                    </Link>
                </header>

                {/* Profile Content */}
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <Card className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border/20">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-neon-blue neon-glow">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-gradient-card text-neon-blue text-2xl font-bold">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                                </AvatarFallback>
                            </Avatar>


                            <div className="text-center sm:text-left flex-1">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    {user?.name || 'Weather Explorer'}
                                </h2>
                                <p className="text-neon-cyan text-lg mb-1">{user?.email}</p>
                                <p className="text-muted-foreground">Member since {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/20 text-center">
                            <h3 className="text-2xl font-bold text-neon-blue mb-2">0</h3>
                            <p className="text-muted-foreground">Cities Searched</p>
                        </Card>
                        <Card className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/20 text-center">
                            <h3 className="text-2xl font-bold text-neon-cyan mb-2">0</h3>
                            <p className="text-muted-foreground">Favorites</p>
                        </Card>
                        <Card className="bg-gradient-card rounded-xl p-6 shadow-card border border-border/20 text-center">
                            <h3 className="text-2xl font-bold text-neon-green mb-2">0</h3>
                            <p className="text-muted-foreground">Forecasts Viewed</p>
                        </Card>
                    </div>

                    {/* Actions */}
                    <Card className="bg-gradient-card rounded-2xl p-6 shadow-card border border-border/20">
                        <h3 className="text-xl font-bold text-foreground mb-4">Account Actions</h3>
                        <div className="space-y-3">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-foreground hover:text-neon-blue border border-border/50 hover:border-neon-blue/50"
                            >
                                <Settings className="h-4 w-4 mr-3" />
                                Account Settings
                            </Button>
                            <Button
                                onClick={logout}
                                variant="ghost"
                                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border border-border/50 hover:border-destructive/50"
                            >
                                <LogOut className="h-4 w-4 mr-3" />
                                Sign Out
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
