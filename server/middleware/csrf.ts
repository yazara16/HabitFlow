import { randomBytes } from "crypto";

function parseCookies(cookieHeader: string | undefined) {
  const obj: Record<string, string> = {};
  if (!cookieHeader) return obj;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx < 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    obj[key] = decodeURIComponent(val);
  }
  return obj;
}

function generateToken() {
  return randomBytes(24).toString("hex");
}

export function ensureCsrfCookie(req: any, res: any, next: any) {
  try {
    const cookies = parseCookies(req.headers?.cookie);
    let token = cookies["XSRF-TOKEN"];
    if (!token) {
      token = generateToken();
      const secure = process.env.NODE_ENV === "production";
      // Set cookie so client-side JS can read it for double-submit protection
      res.cookie("XSRF-TOKEN", token, {
        httpOnly: false,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    // expose current token to handlers
    req.csrfToken = token;
  } catch (e) {
    // ignore
  }
  return next();
}

// Check double-submit cookie header for state-changing requests
export function csrfProtection(req: any, res: any, next: any) {
  const method = (req.method || "").toUpperCase();
  const unsafe = ["POST", "PUT", "PATCH", "DELETE"];
  if (!unsafe.includes(method)) return next();

  const cookies = parseCookies(req.headers?.cookie);
  const cookieToken = cookies["XSRF-TOKEN"];
  const headerToken =
    req.headers["x-xsrf-token"] || req.headers["x-xsrf-token".toLowerCase()];

  // If server has no cookie token, allow (for compatibility)
  if (!cookieToken && !headerToken) return next();

  if (!cookieToken)
    return res.status(403).json({ message: "CSRF token missing (cookie)" });
  if (!headerToken)
    return res.status(403).json({ message: "CSRF token missing (header)" });
  if (String(cookieToken) !== String(headerToken))
    return res.status(403).json({ message: "CSRF token mismatch" });

  return next();
}
