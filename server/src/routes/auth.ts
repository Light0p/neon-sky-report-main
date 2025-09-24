import express from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import db from '../database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many authentication attempts, please try again later' }
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId: number, email: string, name: string) => {
  const jwtSecret = process.env.JWT_SECRET!;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

  const accessToken = jwt.sign(
    { userId, email, name },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as unknown as undefined
  );

  const refreshToken = jwt.sign(
    { userId },
    jwtRefreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as unknown as undefined
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(userId, refreshToken, expiresAt.toISOString());

  return { accessToken, refreshToken };
};

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, passwordHash, name);

    const userId = result.lastInsertRowid as number;

    const { accessToken, refreshToken } = generateTokens(userId, email, name);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, email, name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT id, email, password_hash, name FROM users WHERE email = ?').get(email) as any;

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.name);

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return res.status(400).json({ error: 'Google account must have email and name' });
    }

    let user = db.prepare('SELECT id, email, name FROM users WHERE google_id = ? OR email = ?').get(googleId, email) as any;

    if (user) {
      if (!user.google_id) {
        db.prepare('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?')
          .run(googleId, picture, user.id);
      }
    } else {
      const result = db.prepare(
        'INSERT INTO users (email, google_id, name, avatar_url, email_verified) VALUES (?, ?, ?, ?, TRUE)'
      ).run(email, googleId, name, picture);

      user = {
        id: result.lastInsertRowid,
        email,
        name
      };
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.name);

    res.json({
      message: 'Google login successful',
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    const storedToken = db.prepare(`
      SELECT rt.*, u.email, u.name 
      FROM refresh_tokens rt 
      JOIN users u ON rt.user_id = u.id 
      WHERE rt.token = ? AND rt.expires_at > datetime('now')
    `).get(refreshToken) as any;

    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      storedToken.user_id,
      storedToken.email,
      storedToken.name
    );

    db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authenticateToken, (req: AuthenticatedRequest, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    }

    db.prepare('DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at <= datetime("now")')
      .run(req.user!.id);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
