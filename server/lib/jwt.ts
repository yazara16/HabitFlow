import jwt from "jsonwebtoken";

// IMPORTANT: Provide a strong secret via the JWT_SECRET environment variable.
// Do NOT commit or hard-code secrets in source control. Set JWT_SECRET in your deployment or .env.
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "30d";

if (!JWT_SECRET) {
  // Warn during startup so the developer knows to configure the secret.
  // Signing or verifying tokens will fail until JWT_SECRET is provided.
  // The application will continue running but authenticated endpoints will return errors if used.
  // Set JWT_SECRET in your environment (e.g. export JWT_SECRET="..." or via your hosting provider).
  // This file intentionally does not provide a fallback secret.
  //
  // Example (local development):
  // export JWT_SECRET="a-very-secure-random-string"
  console.warn(
    "JWT_SECRET environment variable is not set. JWT signing and verification will be disabled until configured.",
  );
}

export function signToken(payload: object) {
  if (!JWT_SECRET)
    throw new Error(
      "JWT_SECRET is not configured. Set process.env.JWT_SECRET to sign tokens.",
    );
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (e) {
    return null;
  }
}
