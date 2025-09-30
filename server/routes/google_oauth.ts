import type { RequestHandler } from "express";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import db from "../db"; // Este debe ser tu cliente Prisma
import { signToken } from "../lib/jwt";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// Redirige al usuario a Google para iniciar sesión
export const googleRedirect: RequestHandler = (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res
      .status(500)
      .send(
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI in environment variables."
      );
  }

  const state = req.query.state || "";
  const scope = encodeURIComponent("openid email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    CLIENT_ID
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&state=${encodeURIComponent(
    String(state)
  )}`;

  res.redirect(url);
};

// Callback de Google después de autenticación
export const googleCallback: RequestHandler = async (req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return res
      .status(500)
      .send(
        "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI in environment variables."
      );
  }

  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).send("Missing code");

  // Intercambiar código por tokens
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

  if (!tokenRes.ok) return res.status(500).json({ message: "Token exchange failed" });
  const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
  const accessToken = tokenData.access_token;

  // Obtener perfil del usuario
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileRes.ok) return res.status(500).json({ message: "Failed fetching profile" });
  const profile = (await profileRes.json()) as GoogleProfile;

  // Buscar o crear usuario en Prisma
  let user = await db.user.findUnique({
    where: { email: profile.email },
    select: { id: true, name: true, email: true, photoUrl: true, createdAt: true },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        id: uuidv4(),
        name: profile.name || "Google User",
        email: profile.email,
        photoUrl: profile.picture || null,
        createdAt: new Date(),
      },
    });
  }

  // Firmar token JWT
  let token: string;
  try {
    token = signToken({ sub: user.id, email: user.email });
  } catch (e: any) {
    const FRONTEND = process.env.FRONTEND_URL;
    if (FRONTEND)
      return res.redirect(
        `${FRONTEND}/?error=${encodeURIComponent("JWT not configured")}`
      );
    return res.status(500).json({
      message: "JWT not configured on server. Set JWT_SECRET to enable token generation.",
    });
  }

  // Redirigir al frontend con token
  const FRONTEND = process.env.FRONTEND_URL;
  if (FRONTEND) {
    return res.redirect(`${FRONTEND}/?token=${encodeURIComponent(token)}`);
  }

  // Si no hay frontend, devolver JSON
  return res.json({ token, user });
};
