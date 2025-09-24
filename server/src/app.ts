import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database';
import { WeatherData, fetchWeatherFromAPI } from './WeatherApi';
import authRoutes from './routes/auth';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Interface for cache DB row
interface WeatherCacheRow {
  data: string;
}

// GET /api/weather/:city — check cache or fetch & cache (with optional auth)
app.get('/api/weather/:city', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const { city } = req.params;

  // Check cache (entries newer than 1 hour)
  const row = db
    .prepare(`
      SELECT data FROM weather_cache 
      WHERE city = ? AND datetime(cached_at) > datetime('now', '-1 hour')
    `)
    .get(city) as WeatherCacheRow | undefined;

  if (row) {
    return res.json(JSON.parse(row.data));
  }

  // Not cached → fetch from API, cache, then return
  try {
    const weatherData: WeatherData = await fetchWeatherFromAPI(city);
    
    db
      .prepare(`
        INSERT INTO weather_cache (city, data) VALUES (?, ?)
      `)
      .run(city, JSON.stringify(weatherData));

    return res.json(weatherData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

// POST /api/preferences — upsert user preferences (protected)
app.post('/api/preferences', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { favoriteCities, temperatureUnit } = req.body;
  const userId = req.user!.id;

  try {
    db
      .prepare(`
        INSERT INTO user_preferences (user_id, favorite_cities, temperature_unit) 
        VALUES (?, ?, ?) 
        ON CONFLICT(user_id) DO UPDATE SET 
          favorite_cities = excluded.favorite_cities, 
          temperature_unit = excluded.temperature_unit
      `)
      .run(userId.toString(), JSON.stringify(favoriteCities), temperatureUnit);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/preferences — get user preferences (protected)
app.get('/api/preferences', authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  try {
    const preferences = db
      .prepare('SELECT favorite_cities, temperature_unit FROM user_preferences WHERE user_id = ?')
      .get(userId.toString()) as any;

    if (preferences) {
      return res.json({
        favoriteCities: JSON.parse(preferences.favorite_cities || '[]'),
        temperatureUnit: preferences.temperature_unit || 'celsius'
      });
    }

    // Return defaults if no preferences found
    return res.json({
      favoriteCities: [],
      temperatureUnit: 'celsius'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
