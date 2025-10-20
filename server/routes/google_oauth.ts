import type { RequestHandler } from "express";
import fetch from "node-fetch";
import db from "../db";
import { v4 as uuidv4 } from "uuid";

/*
  Google OAuth2 configuration
  Provide the following environment variables in your deployment or .env file:
  - GOOGLE_CLIENT_ID:     The OAuth client ID obtained from Google Cloud Console
  - GOOGLE_CLIENT_SECRET: The OAuth client secret from Google Cloud Console
  - GOOGLE_REDIRECT_URI:  The redirect URI configured in Google Cloud (e.g. https://yourapp.com/api/auth/google/callback)
  - FRONTEND_URL:         (optional) Your frontend origin where the user should be redirected after auth. If not set, the server will return JSON with the token.

  Do NOT embed credentials in source control. Configure these values through your hosting provider or local environment.
*/

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export const googleRedirect: RequestHandler = (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res
      .status(500)
      .send(
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI in environment variables.",
      );
  }
  const state = req.query.state || "";
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&state=${encodeURIComponent(String(state))}`;
  res.redirect(url);
};

export const googleCallback: RequestHandler = async (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res
      .status(500)
      .send(
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in environment variables.",
      );
  }

  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing code");

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok)
    return res.status(500).json({ message: "Token exchange failed" });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Fetch userinfo
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!profileRes.ok)
    return res.status(500).json({ message: "Failed fetching profile" });
  const profile = await profileRes.json();

  // Upsert user
  const email = profile.email;
  let row = await db.get(
    "SELECT id,name,email,photoUrl,createdAt FROM users WHERE email = ?",
    email,
  );
  if (!row) {
    const id = uuidv4();
    const now = new Date().toISOString();
    await db.run(
      "INSERT INTO users (id,name,email,photoUrl,createdAt) VALUES (?,?,?,?,?)",
      id,
      profile.name || "Google User",
      email,
      profile.picture || null,
      now,
    );
    row = await db.get(
      "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
      id,
    );
  }

  // Sign JWT and redirect back to frontend with token (or return JSON)
  const { signToken } = require("../lib/jwt");
  let token: string;
  try {
    token = signToken({ sub: row.id, email: row.email });
  } catch (e: any) {
    // If JWT isn't configured, return the user record and skip signing
    const FRONTEND = process.env.FRONTEND_URL;
    if (FRONTEND)
      return res.redirect(
        `${FRONTEND}/?error=${encodeURIComponent("JWT not configured")}`,
      );
    return res.status(500).json({
      message:
        "JWT not configured on server. Set JWT_SECRET to enable token generation.",
    });
  }

  const FRONTEND = process.env.FRONTEND_URL;
  // WARNING: Including token in URL is simple for demo; consider using a secure cookie or a POST response in production.
  if (FRONTEND) {
    return res.redirect(`${FRONTEND}/?token=${encodeURIComponent(token)}`);
  }

  // If frontend URL not provided, return JSON containing token and user information.
  return res.json({ token, user: row });
};
