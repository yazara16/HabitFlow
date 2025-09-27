import type { RequestHandler } from 'express';
import fetch from 'node-fetch';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

// NOTE: Set these environment variables in your .env or deployment settings:
// - GOOGLE_CLIENT_ID
// - GOOGLE_CLIENT_SECRET
// - GOOGLE_REDIRECT_URI   (e.g. https://yourapp.com/api/auth/google/callback)
// The values above should be provided by you in production.

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_HERE';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/api/auth/google/callback';

export const googleRedirect: RequestHandler = (req, res) => {
  const state = req.query.state || '';
  const scope = encodeURIComponent('openid email profile');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&state=${encodeURIComponent(String(state))}`;
  res.redirect(url);
};

export const googleCallback: RequestHandler = async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send('Missing code');

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }),
  });
  if (!tokenRes.ok) return res.status(500).json({ message: 'Token exchange failed' });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Fetch userinfo
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!profileRes.ok) return res.status(500).json({ message: 'Failed fetching profile' });
  const profile = await profileRes.json();

  // Upsert user
  const email = profile.email;
  let row = db.prepare('SELECT id,name,email,photoUrl,createdAt FROM users WHERE email = ?').get(email);
  if (!row) {
    const id = uuidv4();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO users (id,name,email,photoUrl,createdAt) VALUES (?,?,?,?,?)').run(id, profile.name || 'Google User', email, profile.picture || null, now);
    row = db.prepare('SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?').get(id);
  }

  // Sign JWT and redirect back to frontend with token (or return JSON)
  const { signToken } = require('../lib/jwt');
  const token = signToken({ sub: row.id, email: row.email });

  // Redirect to frontend and include token. Replace FRONTEND_URL with your front-end origin in env.
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
  // WARNING: including token in URL is simple for demo; consider secure cookie or POST response in production.
  res.redirect(`${FRONTEND}/?token=${token}`);
};
